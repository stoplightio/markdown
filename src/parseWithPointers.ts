import { RemarkParseOptions } from 'remark-parse';
import * as unified from 'unified';

import { MDAST } from './ast-types';
import { parse } from './parse';
import { MarkdownParserResult } from './types';

export const parseWithPointers = (
  value: string,
  opts?: Partial<RemarkParseOptions>,
  processor?: unified.Processor,
): MarkdownParserResult => {
  const tree = parse(value, opts, processor) as MDAST.Parent;
  return {
    data: tree,
    diagnostics: [],
    ast: tree,
    lineMap: undefined,
  };
};
