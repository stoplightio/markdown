import unified from 'unified';
import type { VFileCompatible } from 'vfile';

import { parse, ParseOptions } from './parse';
import { MarkdownParserResult } from './types';

export const parseWithPointers = (
  input: VFileCompatible,
  opts: Partial<ParseOptions> = {},
  processor?: unified.Processor,
): MarkdownParserResult => {
  const tree = parse(input, opts, processor);
  return {
    data: tree,
    diagnostics: [],
    ast: tree,
    lineMap: undefined,
  };
};
