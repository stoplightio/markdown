import remarkParse, { RemarkParseOptions } from 'remark-parse';
import unified from 'unified';
import * as Unist from 'unist';
const frontmatter = require('remark-frontmatter');

const defaultOpts: Partial<RemarkParseOptions> = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use<RemarkParseOptions[]>(remarkParse)
  .use(frontmatter, ['yaml']);

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
