import { JsonPath } from '@stoplight/types';

import { MDAST } from './ast-types';

export const getJsonPathForNode = (root: MDAST.Parent, node: MDAST.Content): JsonPath | void => {
  const path: JsonPath = [];
  findNode(root, node, path);
  return path;
};

function findNode(root: MDAST.Parent | MDAST.Content, node: MDAST.Content, path: JsonPath): MDAST.Content | undefined {
  if (node.position === undefined || root.position === undefined) return;

  if (
    node.position.start.line === root.position.start.line &&
    node.position.end.line === root.position.end.line &&
    node.position.start.column === root.position.start.column &&
    node.position.end.column === root.position.end.column
  ) {
    return node;
  }

  if (node.position.start.line >= root.position.start.line && node.position.end.line <= root.position.end.line) {
    const { children } = root;
    if (Array.isArray(children)) {
      for (let i = 0; i < children.length; i++) {
        const item = findNode(children[i], node, path);
        if (item) {
          path.unshift('children', i);
          return findNode(item, node, path);
        }
      }
    }
  }

  return;
}
