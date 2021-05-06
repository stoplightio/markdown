import frontmatter from 'remark-frontmatter';
// @ts-expect-error
import inlineLinks from 'remark-inline-links';
import remarkParse, { RemarkParseOptions } from 'remark-parse';
// @ts-expect-error
import remarkSlug from 'remark-slug';
import unified from 'unified';

import { MDAST } from './ast-types';
import { mergeHtml } from './plugins';
import { smdCode } from './plugins/code';
import jiraBlocks from './plugins/jiraBlocks';
import stripJsProtocol from './plugins/stripJsProtocol';
import { toSpec } from './reader/transformers/to-spec';

const defaultOpts: Partial<RemarkParseOptions> = {
  commonmark: true,
  gfm: true,
};

export const remarkPreset = [
  remarkParse,
  jiraBlocks,
  [frontmatter, ['yaml']],
  () => toSpec,
  smdCode,
  remarkSlug,
  [inlineLinks, { commonmark: true }],
  mergeHtml,
  stripJsProtocol,
];

// @ts-expect-error
const defaultProcessor = unified().use<RemarkParseOptions[]>(remarkPreset);

export const parse = (
  input: string,
  opts: Partial<RemarkParseOptions> = defaultOpts,
  processor: unified.Processor = defaultProcessor,
): MDAST.IRoot => {
  // return the parsed remark ast
  return processor().data('settings', opts).parse(input) as MDAST.IRoot;
};

export const run = (
  input: string,
  opts: Partial<RemarkParseOptions> = defaultOpts,
  processor: unified.Processor = defaultProcessor,
): MDAST.IRoot => {
  // return the parsed remark ast
  return processor().runSync(parse(input, opts, processor)) as MDAST.IRoot;
};
