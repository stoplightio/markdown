import type { VFileCompatible } from 'vfile';

import { parse, ParseOptions } from './parse';
import { MarkdownParserResult } from './types';

export const parseWithPointers = (
  markdown: VFileCompatible,
  opts: Partial<ParseOptions> = {},
): MarkdownParserResult => {
  const tree = parse(markdown, opts);
  return {
    data: tree,
    diagnostics: [],
    ast: tree,
    lineMap: undefined,
  };
};
