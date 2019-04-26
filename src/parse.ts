import remarkParse, { IParseOpts } from 'remark-parse';
import unified from 'unified';
import * as Unist from 'unist';
const frontmatter = require('remark-frontmatter');

const defaultOpts: IParseOpts = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use(remarkParse)
  .use(frontmatter, ['yaml']);

export const parse = (
  input: string,
  opts: IParseOpts = defaultOpts,
  processor: unified.Processor = defaultProcessor
): Unist.Node => {
  // return the parsed remark ast
  return processor()
    .data('settings', opts)
    .parse(input);
};
