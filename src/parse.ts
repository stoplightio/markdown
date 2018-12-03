import unified, { Processor } from 'unified';
import remarkParse, { ParseOpts } from 'remark-parse';

const defaultOpts: ParseOpts = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified()
  .use(remarkParse);

export const parse = (input: string, opts: ParseOpts = defaultOpts, processor: Processor = defaultProcessor) => {
  // return the parsed remark ast
  return processor
    .data('settings', opts)
    .parse(input);
};
