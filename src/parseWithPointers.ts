import { IParseOpts } from 'remark-parse';
import * as unified from 'unified';
import * as Unist from 'unist';

import { parse } from './parse';
import { MarkdownParserResult } from './types';

export const parseWithPointers = (
  value: string,
  opts?: IParseOpts,
  processor?: unified.Processor,
): MarkdownParserResult => {
  const tree = parse(value, opts, processor) as Unist.Parent;
  return {
    data: tree,
    diagnostics: [],
    ast: tree,
    lineMap: undefined,
  };
};
