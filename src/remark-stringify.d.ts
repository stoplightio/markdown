declare module 'remark-stringify' {
  import { IParser, transformer } from 'unified';

  // https://github.com/remarkjs/remark/tree/master/packages/remark-stringify#processorusestringify-options
  export interface IStringifyOpts {
    commonmark?: boolean; // true by default
    gfm?: boolean; // false by default
    pedantic?: boolean; // false by default
    entities?: 'numbers' | 'escape' | boolean;
    setext?: boolean; // false by default
    closeAtx?: boolean; // false by default
    looseTable?: boolean; // false by default
    spacedTable?: boolean; // true by default
    paddedTable?: boolean; // true by default
    stringLength?: (str: string) => number;
    fence?: '~' | '`'; // '`' by default
    fences?: boolean; // false by default
    bullet?: '-' | '*' | '+'; // '-' by default
    listItemIndent?: 'tab' | 'mixed' | '1'; // 'tab' by default
    incrementListMarker?: boolean; // true by default
    rule?: '-' | '*' | '_'; // '*' by default
    ruleRepetition?: number; // 3 by default
    ruleSpaces?: boolean; // true by default
    strong?: '_' | '*'; // '*' by default
    emphasis?: '_' | '*'; // '_' by default
  }

  const compile: {
    (options?: IStringifyOpts): transformer;

    Compiler: IParser;
  };

  export default parse;
}
