import { IParserResult, IParserResultPointers } from '@stoplight/types';
import { IParseOpts } from 'remark-parse';
import * as unified from 'unified';
import * as Unist from 'unist';

import { parse } from './parse';

const getPointers = <T extends Unist.Parent = Unist.Parent>(
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

export const parseWithPointers = <T extends Unist.Parent = Unist.Parent>(
  value: string,
  opts?: IParseOpts,
  processor?: unified.Processor
): IParserResult<T> => {
  // todo fix
  const tree = parse(value, opts, processor) as any;
  return {
    data: tree,
    pointers: getPointers<T>(tree),
    validations: [],
  };
};
