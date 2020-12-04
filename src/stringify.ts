import remarkStringify, { RemarkStringifyOptions } from 'remark-stringify';
import unified from 'unified';
import { Node } from 'unist';
import jiraBlocks from './plugins/jiraBlocks';
import resolver from './plugins/resolver';
const frontmatter = require('remark-frontmatter');

const defaultOpts: Partial<RemarkStringifyOptions> = {
  commonmark: true,
  gfm: true,
  listItemIndent: 'mixed', // this is needed to preserve the original indentation
};

const defaultProcessor = unified()
  .use<RemarkStringifyOptions[]>(remarkStringify)
  .use(jiraBlocks)
  .use(frontmatter, ['yaml'])
  .use(resolver);

export const stringify = (
  tree: Node,
  opts: Partial<RemarkStringifyOptions> = defaultOpts,
  processor: unified.Processor = defaultProcessor,
) => {
  return processor()
    .data('settings', opts)
    .stringify(tree);
};
