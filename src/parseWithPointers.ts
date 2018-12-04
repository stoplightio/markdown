import { IParserResult, IParserResultPointers } from '@stoplight/types';
import { IParseOpts } from 'remark-parse';
import { IProcessor } from 'unified';

import * as TUnist from './ast-types/unist';
import { parse } from './parse';

const getPointers = <T extends TUnist.Parent = TUnist.IParent>(
  node: Partial<T>,
  pointers: IParserResultPointers = {},
  path: string = ''
): IParserResultPointers => {
  if (node.position) {
    pointers[path === '' ? '/' : path] = {
      start: node.position.start,
      end: node.position.end,
    };
  }

  if (node.children) {
    for (const [i, child] of node.children.entries()) {
      getPointers(child, pointers, `${path}/children/${i}`);
    }
  }

  return pointers;
};

export const parseWithPointers = <T extends TUnist.Parent = TUnist.IParent>(
  value: string,
  opts?: IParseOpts,
  processor?: IProcessor
): IParserResult<T> => {
  const tree = parse(value, opts, processor);
  return {
    data: tree,
    pointers: getPointers<T>(tree),
    validations: [],
  };
};
