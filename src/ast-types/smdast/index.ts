import { Dictionary } from '@stoplight/types';

import * as MDAST from '../mdast';
import { CodeAnnotations, IAnnotations } from './annotations';

export {
  IBreak,
  IDefinition,
  IDelete,
  IEmphasis,
  IFootnote,
  IFootnoteDefinition,
  IFootnoteReference,
  IHeading,
  IHTML,
  IImage,
  IImageReference,
  IInlineCode,
  IInlineHTML,
  IJiraNode,
  ILink,
  ILinkReference,
  IList,
  IListItem,
  IParagraph,
  IRoot,
  IStrong,
  ITable,
  ITableCell,
  ITableRow,
  ITextNode,
  IThematicBreak,
  IYAML,
} from '../mdast';
export * from './annotations';
export * from './codeGroup';
export * from './element';
export * from './tab';

export interface IBlockquote<T extends Dictionary<any> = {}> extends IAnnotations<T>, MDAST.IBlockquote {}
export interface ICode<T extends CodeAnnotations = CodeAnnotations> extends IAnnotations<T>, MDAST.ICode {}
