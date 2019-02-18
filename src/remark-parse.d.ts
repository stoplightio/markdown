declare module 'remark-parse' {
  import * as unified from 'unified';

  export interface IParseOpts {
    commonmark?: boolean; // true by default
    gfm?: boolean; // false by default
    footnotes?: boolean; // false by default
    blocks?: string[]; // default: list of block HTML elements
    pedantic?: boolean; // false by default
  }

  const parse: unified.Plugin;

  export default parse;
}
