import * as TUnist from '../unist';

export type AlignType = 'left' | 'right' | 'center' | null;
export type ReferenceType = 'shortcut' | 'collapsed' | 'full';

export interface IRoot extends TUnist.IParent {
  type: 'root';
}

export interface IParagraph extends TUnist.IParent {
  type: 'paragraph';
}

export interface IBlockquote extends TUnist.IParent {
  type: 'blockquote';
}

export interface IHeading extends TUnist.IParent {
  type: 'heading';
  depth: 1 | 2 | 3 | 4 | 5 | 6;
}

export interface ICode extends TUnist.IText {
  type: 'code';
  lang?: string;
}

export interface IInlineCode extends TUnist.IText {
  type: 'inlineCode';
}

export interface IYAML extends TUnist.IText {
  type: 'yaml';
}

export interface IHTML extends TUnist.IText {
  type: 'html';
}

export interface IList extends TUnist.IParent {
  type: 'list';
  ordered: boolean;
  start?: number;
  loose: boolean;
}

export interface IListItem extends TUnist.IParent {
  type: 'listItem';
  loose: boolean;
  checked?: boolean;
}

export interface ITable extends TUnist.IParent {
  type: 'table';
  align: AlignType[];
}

export interface ITableRow extends TUnist.IParent {
  type: 'tableRow';
}

export interface ITableCell extends TUnist.IParent {
  type: 'tableCell';
}

export interface IThematicBreak extends TUnist.INode {
  type: 'thematicBreak';
}

export interface IBreak extends TUnist.INode {
  type: 'break';
}

export interface IEmphasis extends TUnist.IParent {
  type: 'emphasis';
}

export interface IStrong extends TUnist.IParent {
  type: 'strong';
}

export interface IDelete extends TUnist.IParent {
  type: 'delete';
}

export interface ILink extends TUnist.IParent {
  type: 'link';
  title?: string;
  url: string;
}

export interface IImage extends TUnist.INode {
  type: 'image';
  title?: string;
  alt?: string;
  url: string;
}

export interface IFootnote extends TUnist.IParent {
  type: 'footnote';
}

export interface ILinkReference extends TUnist.IParent {
  type: 'linkReference';
  identifier: string;
  referenceType: ReferenceType;
}

export interface IImageReference extends TUnist.INode {
  type: 'imageReference';
  identifier: string;
  referenceType: ReferenceType;
  alt?: string;
}

export interface IFootnoteReference extends TUnist.INode {
  type: 'footnoteReference';
  identifier: string;
}

export interface IDefinition extends TUnist.INode {
  type: 'definition';
  identifier: string;
  title?: string;
  url: string;
}

export interface IFootnoteDefinition extends TUnist.IParent {
  type: 'footnoteDefinition';
  identifier: string;
}

export interface ITextNode extends TUnist.IText {
  type: 'text';
}

// EXTRA

export interface IElement extends TUnist.INode {
  type: 'element';
  tagName: string;
  properties: object;
  children: TUnist.INode[];
}
