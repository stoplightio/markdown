import { GetJsonPathForPosition, IPosition, JsonPath } from '@stoplight/types';
import * as Unist from 'unist';
import { MarkdownParserResult } from './types';

export const getJsonPathForPosition: GetJsonPathForPosition<MarkdownParserResult> = ({ ast }, position) => {
  const path: JsonPath = [];
  findNodeAtPosition(ast, position, path);
  return path;
};

function findNodeAtPosition(node: Unist.Node, position: IPosition, path: JsonPath): Unist.Node | undefined {
  if (position.line >= node.position!.start.line - 1 && position.line <= node.position!.end.line - 1) {
    const { children } = node;
    if (Array.isArray(children)) {
      for (let i = children.length - 1; i >= 0; i--) {
        const item = findNodeAtPosition(children[i], position, path);
        if (
          item &&
          (item.position!.start.line !== item.position!.end.line ||
            (position.character >= item.position!.start.column - 1 &&
              position.character <= item.position!.end.column - 1))
        ) {
          path.unshift('children', i);
          return findNodeAtPosition(item, position, path);
        }
      }
    }

    return node;
  }

  return;
}
