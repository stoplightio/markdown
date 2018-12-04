import remarkParse, { IParseOpts } from 'remark-parse';
import unified, { IProcessor } from 'unified';

const defaultOpts: IParseOpts = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified().use(remarkParse);

export const parse = (input: string, opts: IParseOpts = defaultOpts, processor: IProcessor = defaultProcessor) => {
  // return the parsed remark ast
  return processor.data('settings', opts).parse(input);
};
