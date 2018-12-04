import remarkParse from 'remark-parse';
import remarkStringify, { IStringifyOpts } from 'remark-stringify';
import unified, { IProcessor } from 'unified';
import { INode as Node } from './ast-types/unist';

const defaultOpts: IStringifyOpts = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use(remarkParse)
  .use(remarkStringify);

export const stringify = (tree: Node, opts: IStringifyOpts = defaultOpts, processor: IProcessor = defaultProcessor) => {
  return processor.data('settings', defaultOpts).stringify(tree);
};
