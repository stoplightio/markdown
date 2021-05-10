import { Dictionary } from '@stoplight/types';
import { parse } from '@stoplight/yaml';

import { MDAST } from '../../ast-types';

// When we have bandwidth, might make sense to look into the new lower level pattern made possible by micromark ecosystem
// Example in the gfm plugin - https://github.com/remarkjs/remark-gfm/blob/main/index.js#L30-L32
export function smdAnnotations() {
  return function transform(root: MDAST.Root) {
    const nodes = root.children;

    const processed: MDAST.Content[] = [];

    let inTab: boolean = false;
    let skipNext: boolean = false;

    // temporary variable for storing current tabContainer
    let tabPlaceholder: MDAST.Tabs = {
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
            Object.assign(children[children.length - 1].data, {
              hProperties: anno,
            });
          }

          tabPlaceholder.children = children;

          continue;
        } else if (type === 'tab-end') {
          // finalize tabContainer
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
          (tabPlaceholder.children[size - 1].children as MDAST.Content[]).push(processNode(node, anno));
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
      ...root,
      children: processed,
    };
  };
}

function captureAnnotations<T extends Dictionary<any>>(node: MDAST.Content | undefined): T | {} {
  if (!node || !node.value) {
    return {};
  }

  if (
    // @ts-expect-error
    node.type === 'mdxFlowExpression' &&
    // @ts-expect-error
    (node.value as string).startsWith('/*') &&
    // @ts-expect-error
    (node.value as string).endsWith('*/')
  ) {
    // remove comments and whitespace
    // @ts-expect-error
    const raw = (node.value as string)
      // @ts-expect-error
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

function processNode(node: MDAST.Content, annotations?: object): MDAST.Content {
  if (annotations) {
    return {
      ...node,
      annotations,
    };
  }

  return node;
}