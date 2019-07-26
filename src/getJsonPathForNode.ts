import { JsonPath } from '@stoplight/types';
import * as Unist from 'unist';

export const getJsonPathForNode = (root: Unist.Parent, node: Unist.Node): JsonPath | void => {
  const path: JsonPath = [];
  findNode(root, node, path);
  return path;
};

function findNode(root: Unist.Parent | Unist.Node, node: Unist.Node, path: JsonPath): Unist.Node | undefined {
  if (
    node.position!.start.line === root.position!.start.line &&
    node.position!.end.line === root.position!.end.line &&
    node.position!.start.column === root.position!.start.column &&
    node.position!.end.column === root.position!.end.column
  ) {
    return node;
  }

  if (node.position!.start.line >= root.position!.start.line && node.position!.end.line <= root.position!.end.line) {
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
