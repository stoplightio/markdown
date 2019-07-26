import remarkStringify, { RemarkStringifyOptions } from 'remark-stringify';
import unified from 'unified';
import { Node } from 'unist';
const frontmatter = require('remark-frontmatter');

const defaultOpts: Partial<RemarkStringifyOptions> = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use<RemarkStringifyOptions[]>(remarkStringify)
  .use(frontmatter, ['yaml']);

export const stringify = (
  tree: Node,
  opts: Partial<RemarkStringifyOptions> = defaultOpts,
  processor: unified.Processor = defaultProcessor,
) => {
  return processor()
    .data('settings', opts)
    .stringify(tree);
};
