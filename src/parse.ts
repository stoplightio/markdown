import remarkParse, { IParseOpts } from 'remark-parse';
import * as Unist from 'unist';
import unified from 'unified';

const defaultOpts: IParseOpts = {
  commonmark: true,
  gfm: true,
};

const defaultProcessor = unified().use(remarkParse);

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
