import * as yaml from 'js-yaml';

import * as Unist from '../ast-types/unist';
import * as Mdast from '../ast-types/mdast';
import * as SMdast from '../ast-types/smdast';

function transformAnnotations(node: Unist.INode): Unist.INode | null {
  if (!node.annotations || Object.keys(node.annotations).length === 0) {
    return null;
  }

  return {
    type: 'html',
    value: `<!--\n${yaml.safeDump(node.annotations).trim()}\n-->`,
  };
}

function transformBlockquote(node: SMdast.IBlockquote): Unist.INode[] {
  const res: Unist.INode[] = [];

  const anno = transformAnnotations(node);
  if (anno) {
    res.push(anno);
  }

  res.push({
    type: 'blockquote',
    children: node.children,
  });

  return res;
}

function transformTabContainer(node: SMdast.ITabContainer): Unist.INode[] {
  const res: Unist.INode[] = [];

  // push transformed children
  res.push(...transform(node.children));

  // follow with 'tab-end' annotation type, marking the end of the tab container
  res.push({
    type: 'html',
    value: `<!--\n${yaml.safeDump({ type: 'tab-end' }).trim()}\n-->`,
  });

  return res;
}

function transformTab(node: SMdast.ITab): Unist.INode[] {
  const res: Unist.INode[] = [];

  if (!node.annotations) {
    node.annotations = {};
  }

  // add tab type back to annotation
  node.annotations.type = 'tab';

  const anno = transformAnnotations(node);
  if (anno) {
    res.push(anno);
  }

  res.push(...transform(node.children));

  return res;
}

function transform(nodes: Unist.INode[]): Unist.INode[] {
  const processed: Unist.INode[] = [];

  for (const i in nodes) {
    if (!nodes[i]) continue;

    const node = nodes[i];

    const { type } = node;

    if (type === 'blockquote') {
      processed.push(...transformBlockquote(node as SMdast.IBlockquote));
    } else if (type === 'tabContainer') {
      // nothing needs to be done for tabContainers apart from processing the child tabs
      processed.push(...transformTabContainer(node as SMdast.ITabContainer));
    } else if (type === 'tab') {
      processed.push(...transformTab(node as SMdast.ITab));
    } else {
      processed.push(node);
    }
  }

  return processed;
}

export const fromSpec = (root: SMdast.IRoot): Mdast.IRoot => {
  const nodes = root.children;

  return {
    type: 'root',
    children: transform(nodes),
    position: root.position,
  };
};
