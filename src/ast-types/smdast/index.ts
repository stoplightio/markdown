import { Dictionary } from '@stoplight/types';
import * as MDASst from '../mdast';
import { IAnnotations } from './annotations';

export {
  IThematicBreak,
  ITable,
  ITableCell,
  ITableRow,
  IDefinition,
  IDelete,
  IEmphasis,
  IHeading,
  IHTML,
  IRoot,
  IParagraph,
  ILink,
  ILinkReference,
  IImage,
  IImageReference,
  IInlineCode,
  ITextNode,
  IList,
  IListItem,
} from '../mdast';
export * from './element';
export * from './annotations';
export * from './tab';

export interface IBlockquote<T extends Dictionary<any> = {}> extends IAnnotations<T>, MDASst.IBlockquote {}
export interface ICode<T extends Dictionary<any> = {}> extends IAnnotations<T>, MDASst.ICode {}
