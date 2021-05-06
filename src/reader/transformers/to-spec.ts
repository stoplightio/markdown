import { Dictionary } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
import * as Unist from 'unist';

import { MDAST, SMDAST } from '../../ast-types';

function captureAnnotations<T extends Dictionary<any>>(node: Unist.Node | undefined): T | {} {
  if (!node || !node.value) {
    return {};
  }

  // this mdxFlowExpression block is required when in mdx > next.9 context
  if (
    node.type === 'mdxFlowExpression' &&
    (node.value as string).startsWith('/*') &&
    (node.value as string).endsWith('*/')
  ) {
    // remove comments and whitespace
    const raw = (node.value as string)
      .substr('/*'.length, (node.value as string).length - '*/'.length - '/*'.length)
      .trim();

    // load contents of annotation into yaml
    try {
      const contents = parse<T>(raw);
      if (typeof contents === 'object') {
        for (const key in contents) {
          if (typeof contents[key] === 'string') {
            // babel will crap out if certain characters, like ", are not escaped
            const escapedContent = contents[key].replace('"', '%22');
            contents[key] = escapedContent as any;
          }
        }

        // annotations must be objects, otherwise it's just a regular ol html comment
        return contents;
      }
    } catch (error) {
      // ignore invalid YAML
    }
  } else if (
    node.type === 'html' &&
    (node.value as string).startsWith('<!--') &&
    (node.value as string).endsWith('-->')
  ) {
    // remove comments and whitespace
    const raw = (node.value as string)
      .substr('<!--'.length, (node.value as string).length - '-->'.length - '<!--'.length)
      .trim();

    // load contents of annotation into yaml
    try {
      const contents = parse<T>(raw);
      if (typeof contents === 'object') {
        // annotations must be objects, otherwise it's just a regular ol html comment
        return contents;
      }
    } catch (error) {
      // ignore invalid YAML
    }
  }

  return {};
}

function processNode(node: Unist.Node, annotations?: SMDAST.IAnnotations): Unist.Node {
  if (annotations) {
    const data = node.data || {};
    return {
      ...node,
      annotations,
      data: {
        ...data,
        hName: node.type,
        hProperties: {
          ...((data.hProperties as any) || {}),
          ...annotations,
        },
      },
    };
  }

  return node;
}

export const toSpec = (root: MDAST.IRoot): SMDAST.IRoot => {
  const nodes = root.children;

  const processed: Unist.Node[] = [];

  let inTab: boolean = false;
  let skipNext: boolean = false;

  // temporary variable for storing current tabs
  let tabPlaceholder: SMDAST.ITabContainer = {
    type: 'tabs',
    data: {
      hName: 'tabs',
    },
    children: [
      {
        type: 'tab',
        data: {
          hName: 'tab',
        },
        children: [],
      },
    ],
  };

  for (const i in nodes) {
    if (!nodes[i]) continue;

    if (skipNext) {
      skipNext = false;
      continue;
    }

    // this node
    const node = nodes[i];

    // next node
    const next = nodes[+i + 1] ? nodes[+i + 1] : null;

    // collect annotations, if this is an html node
    const anno = captureAnnotations(node);

    if ('type' in anno) {
      const { type } = anno;

      if (type === 'tab') {
        const { children } = tabPlaceholder;

        if (inTab && tabPlaceholder) {
          // already inside of a tab, so this is a new one
          children.push({
            type: 'tab',
            data: {
              hName: 'tab',
            },
            children: [],
          });
        } else {
          // not inside a tab already
          inTab = true;
        }

        // set annotations if present
        if (Object.keys(anno).length > 0) {
          children[children.length - 1].annotations = anno;

          // for mdx and when we upgrade to micromark ecosystem
          Object.assign(children[children.length - 1].data, {
            hProperties: anno,
          });
        }

        tabPlaceholder.children = children;

        continue;
      } else if (type === 'tab-end') {
        // finalize tabs
        processed.push(tabPlaceholder);

        // reset tabPlaceholder
        inTab = false;
        tabPlaceholder = {
          type: 'tabs',
          data: {
            hName: 'tabs',
          },
          children: [
            {
              type: 'tab',
              data: {
                hName: 'tab',
              },
              children: [],
            },
          ],
        };

        continue;
      }
    }

    if (inTab) {
      // if we're in a tab, push this node as a child of the last tab
      const size = tabPlaceholder.children.length;
      if (tabPlaceholder.children[size - 1]) {
        (tabPlaceholder.children[size - 1].children as Unist.Node[]).push(processNode(node, anno));
      }
    } else if (Object.keys(anno).length > 0 && next) {
      // annotations apply to next node, process next node now and skip next iteration
      processed.push(processNode(next, anno));
      skipNext = true;
    } else {
      processed.push(processNode(node));
    }
  }

  return {
    type: 'root',
    children: processed,
  };
};
