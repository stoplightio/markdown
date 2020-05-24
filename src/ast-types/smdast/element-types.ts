import * as MDASst from '../mdast';
import { IAnnotations } from "./annotations";
import { Dictionary } from '@stoplight/types';

export {
    IBreak,
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
    IYAML,
    IImage,
    IImageReference,
    IInlineCode,
    ITextNode,
    IList,
    IListItem,
    IFootnote,
    IFootnoteReference,
    IFootnoteDefinition,
    IJiraNode,
} from '../mdast';

export interface IBlockquote<T extends Dictionary<any> = {}> extends IAnnotations<T>, MDASst.IBlockquote {}
export interface ICode<T extends Dictionary<any> = {}> extends IAnnotations<T>, MDASst.ICode {}

export { ITab, ITabContainer } from './tab';

export { IElement } from './element';