import remarkStringify, { IStringifyOpts } from 'remark-stringify';
import unified from 'unified';
import { Node } from 'unist';
const frontmatter = require('remark-frontmatter');

const defaultOpts: IStringifyOpts = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use(remarkStringify)
  .use(frontmatter, ['yaml']);

export const stringify = (
  tree: Node,
  opts: IStringifyOpts = defaultOpts,
  processor: unified.Processor = defaultProcessor
) => {
  return processor()
    .data('settings', opts)
    .stringify(tree);
};
