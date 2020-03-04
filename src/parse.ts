import remarkParse, { RemarkParseOptions } from 'remark-parse';
import unified from 'unified';
import * as Unist from 'unist';
import { FRONTMATTER_SETTINGS } from './consts';
const frontmatter = require('remark-frontmatter');

const defaultOpts: Partial<RemarkParseOptions> = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use<RemarkParseOptions[]>(remarkParse)
  .use(frontmatter, FRONTMATTER_SETTINGS);

export const parse = (
  input: string,
  opts: Partial<RemarkParseOptions> = defaultOpts,
  processor: unified.Processor = defaultProcessor,
): Unist.Node => {
  // return the parsed remark ast
  return processor()
    .data('settings', opts)
    .parse(input);
};
