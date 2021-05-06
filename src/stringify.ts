import remarkStringify, { RemarkStringifyOptions } from 'remark-stringify';
import unified from 'unified';

import { MDAST } from './ast-types';
import jiraBlocks from './plugins/jiraBlocks';
import resolver from './plugins/resolver';
import { fromSpec } from './reader/transformers/from-spec';

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
  // @ts-expect-error unified typing issue
  .use(() => fromSpec)
  .use(resolver);

export const stringify = (
  tree: MDAST.Node,
  opts: Partial<RemarkStringifyOptions> = defaultOpts,
  processor: unified.Processor = defaultProcessor,
) => {
  return processor().data('settings', opts).stringify(tree);
};
