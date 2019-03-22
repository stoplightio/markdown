import { IParserResult } from '@stoplight/types';
import { IParseOpts } from 'remark-parse';
import * as unified from 'unified';
import * as Unist from 'unist';

import { parse } from './parse';

export const parseWithPointers = (
  value: string,
  opts?: IParseOpts,
  processor?: unified.Processor
): IParserResult<Unist.Node, Unist.Node> => {
  const tree = parse(value, opts, processor);
  return {
    data: tree,
    diagnostics: [],
    ast: tree,
    lineMap: undefined,
  };
};
