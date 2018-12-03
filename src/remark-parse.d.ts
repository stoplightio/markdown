declare module 'remark-parse' {
  import { Parser, transformer } from 'unified';

  export interface ParseOpts {
    commonmark?: boolean; // true by default
    gfm?: boolean; // false by default
    footnotes?: boolean;  // false by default
    blocks?: string[], // default: list of block HTML elements
    pedantic?: boolean; // false by default
  }

  const parse: {
    (options?: ParseOpts): transformer;

    Parser: Parser;
  };

  export default parse;
}
