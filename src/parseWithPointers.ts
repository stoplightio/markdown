import { Processor } from 'unified';
import { IParserResult } from '@stoplight/types';
import { ParseOpts } from 'remark-parse';

import { parse } from './parse';
import * as Mdast from './ast-types/mdast';
import { IPosition } from './ast-types/unist';
import * as TUnist from './ast-types/unist';

interface Pointers {
  [key: string]: IPosition
}

const getPointers = (node: Partial<TUnist.IParent>, pointers: Pointers = {}, path: string = '/'): Pointers  => {
  if (node.position) {
    pointers[path] = node.position;
  }

  if (node.children) {
    for (const [i, child] of node.children.entries()) {
      getPointers(child, pointers, `${path}children/${i}/`)
    }
  }

  return pointers;
};

export const parseWithPointers = (value: string, opts?: ParseOpts, processor?: Processor): IParserResult<Mdast.IRoot> => {
  const tree = parse(value, opts, processor);
  return {
    data: tree,
    pointers: getPointers(tree),
    validations: [],
  };
};
