declare module 'remark-parse' {
  import { IParser, transformer } from 'unified';

  export interface IParseOpts {
    commonmark?: boolean; // true by default
    gfm?: boolean; // false by default
    footnotes?: boolean; // false by default
    blocks?: string[]; // default: list of block HTML elements
    pedantic?: boolean; // false by default
  }

  const parse: {
    (options?: IParseOpts): transformer;

    Parser: IParser;
  };

  export default parse;
}
