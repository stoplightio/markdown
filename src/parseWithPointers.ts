import { ILocation, IParserResult, IPosition, JSONPath } from '@stoplight/types';
import _get = require('lodash/get');
import { IParseOpts } from 'remark-parse';
import * as unified from 'unified';
import * as Unist from 'unist';

import { parse } from './parse';

export const parseWithPointers = <T extends Unist.Parent = Unist.Parent>(
  value: string,
  opts?: IParseOpts,
  processor?: unified.Processor
): IParserResult<T> => {
  const tree = parse(value, opts, processor) as T;
  return {
    data: tree,
    diagnostics: [],
    getJsonPathForPosition(position: IPosition): JSONPath | undefined {
      const path: JSONPath = [];
      findNodeAtPosition(tree, position, path);
      return path;
    },
    getLocationForJsonPath(path: JSONPath): ILocation | undefined {
      const data = _get(tree, path) as T;
      if (data === undefined) return;

      return {
        range: {
          start: {
            character: data.position!.start.column - 1,
            line: data.position!.start.line - 1,
          },
          end: {
            character: data.position!.end.column - 1,
            line: data.position!.end.line - 1,
          },
        },
      };
    },
  };
};

function findNodeAtPosition(node: Unist.Node, position: IPosition, path: JSONPath): Unist.Node | undefined {
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
