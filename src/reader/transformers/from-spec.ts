import { safeStringify } from '@stoplight/yaml';
import * as Unist from 'unist';

import { MDAST, SMDAST } from '../../ast-types';

function transformAnnotations(node: Unist.Node): Unist.Node | null {
  if (!node.annotations) return null;

  const propCount = Object.keys(node.annotations as object).length;
  if (propCount === 0) return null;

  return {
    type: 'html',
    value: `<!--${propCount > 1 ? '\n' : ' '}${safeStringify(node.annotations).trim()}${propCount > 1 ? '\n' : ' '}-->`,
  };
}

function transformBlockquote(node: SMDAST.IBlockquote): Unist.Node[] {
  return [
    {
      type: 'blockquote',
      children: node.children,
    },
  ];
}

function transformTabs(node: SMDAST.ITabContainer): Unist.Node[] {
  const res: Unist.Node[] = [];

  // push transformed children
  res.push(...transform(node.children));

  // follow with 'tab-end' annotation type, marking the end of the tab container
  res.push({
    type: 'html',
    value: `<!-- ${safeStringify({ type: 'tab-end' }).trim()} -->`,
  });

  return res;
}

function transformTab(node: SMDAST.ITab): Unist.Node[] {
  return transform(node.children);
}

function transform(nodes: Unist.Node[]): Unist.Node[] {
  const processed: Unist.Node[] = [];

  for (const i in nodes) {
    if (!nodes[i]) continue;

    const node = nodes[i];

    const anno = transformAnnotations(node);
    if (anno) {
      processed.push(anno);
    }

    const { type } = node;
    if (type === 'blockquote') {
      processed.push(...transformBlockquote(node as SMDAST.IBlockquote));
    } else if (type === 'tabs') {
      // nothing needs to be done for tabContainers apart from processing the child tabs
      processed.push(...transformTabs(node as SMDAST.ITabContainer));
    } else if (type === 'tab') {
      processed.push(...transformTab(node as SMDAST.ITab));
    } else {
      processed.push(node);
    }
  }

  return processed;
}

export const fromSpec = (root: SMDAST.IRoot): MDAST.IRoot => {
  const nodes = root.children;

  return {
    type: 'root',
    children: transform(nodes),
    position: root.position,
  };
};
