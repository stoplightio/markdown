import * as yaml from 'js-yaml';
import * as Unist from 'unist';
import * as Mdast from '../../ast-types/mdast';
import * as SMdast from '../../ast-types/smdast';

function captureAnnotations(node: Unist.Node | undefined): SMdast.IAnnotations {
  if (!node || !node.value) {
    return {};
  }

  if (node.type === 'html' && (node.value as string).startsWith('<!--') && (node.value as string).endsWith('-->')) {
    // remove comments and whitespace
    const raw = (node.value as string)
      .substr('<!--'.length, (node.value as string).length - '-->'.length - '<!--'.length)
      .trim();

    // load contents of annotation into yaml
    const contents = yaml.safeLoad(raw);
    if (typeof contents === 'object') {
      // annotations must be objects, otherwise it's just a regular ol html comment
      return contents;
    }
  }

  return {};
}

function processNode(node: Unist.Node, annotations: SMdast.IAnnotations | null): Unist.Node {
  if (annotations) {
    return {
      ...node,
      annotations,
    };
  }

  return node;
}

export const toSpec = (root: Mdast.IRoot): SMdast.IRoot => {
  const nodes = root.children;

  const processed: Unist.Node[] = [];

  let inTab: boolean = false;
  let skipNext: boolean = false;

  // temporary variable for storing current tabContainer
  let tabPlaceholder: SMdast.ITabContainer = {
    type: 'tabContainer',
    children: [
      {
        type: 'tab',
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

    if (anno.type) {
      const { type } = anno;

      // remove type annotation so that we can pass the annotation object around wholesale
      delete anno.type;

      if (type === 'tab') {
        const { children } = tabPlaceholder;

        if (inTab && tabPlaceholder) {
          // already inside of a tab, so this is a new one
          children.push({
            type: 'tab',
            children: [],
          });
        } else {
          // not inside a tab already
          inTab = true;
        }

        // set annotations if present
        if (Object.keys(anno).length > 0) {
          children[children.length - 1].annotations = anno;
        }

        tabPlaceholder.children = children;
      } else if (type === 'tab-end') {
        // finalize tabContainer
        processed.push(tabPlaceholder);

        // reset tabPlaceholder
        inTab = false;
        tabPlaceholder = {
          type: 'tabContainer',
          children: [
            {
              type: 'tab',
              children: [],
            },
          ],
        };
      }

      continue;
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
      processed.push(processNode(node, null));
    }
  }

  return {
    type: 'root',
    children: processed,
  };
};
