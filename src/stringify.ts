import unified, { Node, Processor } from 'unified';
import remarkStringify, { StringifyOpts } from 'remark-stringify';
import remarkParse from 'remark-parse';

const defaultOpts: StringifyOpts = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use(remarkParse)
  .use(remarkStringify);

export const stringify = (tree: Node, opts: StringifyOpts = defaultOpts, processor: Processor = defaultProcessor) => {
  return processor
    .data('settings', defaultOpts)
    .stringify(tree);
};
