import { Literal as UnistLiteral, Node, Parent as UnistParent } from 'unist';

type ThemeType = 'info' | 'warning' | 'danger' | 'success';

export type AlignType = 'left' | 'right' | 'center' | null;

export type ReferenceType = 'shortcut' | 'collapsed' | 'full';

export type Content = TopLevelContent | ListContent | TableContent | RowContent | PhrasingContent | TabsContent;

export type TopLevelContent = BlockContent | FrontmatterContent | DefinitionContent | Tabs | CodeGroup;

export type BlockContent = Paragraph | Heading | ThematicBreak | Blockquote | List | Table | HTML | Code;

export type FrontmatterContent = YAML;

export type DefinitionContent = Definition | FootnoteDefinition;

export type ListContent = ListItem;

export type TableContent = TableRow;

export type RowContent = TableCell;

export type PhrasingContent = StaticPhrasingContent | Link | LinkReference;

export type StaticPhrasingContent =
  | Text
  | Emphasis
  | Strong
  | Delete
  | HTML
  | InlineCode
  | Break
  | Image
  | ImageReference
  | Footnote
  | FootnoteReference;

export interface Parent<C extends Node = Content> extends UnistParent {
  children: C[];
}

export interface Literal extends UnistLiteral {
  value: string;
}

export interface Root extends Parent {
  type: 'root';
}

export interface Paragraph extends Parent {
  type: 'paragraph';
  children: PhrasingContent[];
}

export interface Heading extends Parent {
  type: 'heading';
  depth: 1 | 2 | 3 | 4 | 5 | 6;
  children: PhrasingContent[];
}

export interface ThematicBreak extends Node {
  type: 'thematicBreak';
}

export interface Blockquote extends Parent {
  type: 'blockquote';
  children: BlockContent[];

  // custom
  annotations?: {
    theme?: ThemeType;
  };
}

export interface List extends Parent {
  type: 'list';
  ordered?: boolean;
  start?: number;
  spread?: boolean;
  children: ListContent[];
}

export interface ListItem extends Parent {
  type: 'listItem';
  checked?: boolean;
  spread?: boolean;
  children: BlockContent[];
}

export interface Table extends Parent {
  type: 'table';
  align?: AlignType[];
  children: TableContent[];
}

export interface TableRow extends Parent {
  type: 'tableRow';
  children: RowContent[];
}

export interface TableCell extends Parent {
  type: 'tableCell';
  children: PhrasingContent[];
}

export interface HTML extends Literal {
  type: 'html';
}

export interface Code extends Literal {
  type: 'code';
  lang?: string;
  meta?: string;

  // custom
  resolved?: unknown;
  annotations?: {
    title?: string;
    lineNumbers?: boolean;
    highlightLines?: string[] | string[][];
    inline?: boolean;
    live?: boolean;
    jsonSchema?: boolean;
    http?: boolean;
  };
}

export interface YAML extends Literal {
  type: 'yaml';
}

export interface Definition extends Node, Association, Resource {
  type: 'definition';
}

export interface FootnoteDefinition extends Parent, Association {
  type: 'footnoteDefinition';
  children: BlockContent[];
}

export interface Text extends Literal {
  type: 'text';
}

export interface Emphasis extends Parent {
  type: 'emphasis';
  children: PhrasingContent[];
}

export interface Strong extends Parent {
  type: 'strong';
  children: PhrasingContent[];
}

export interface Delete extends Parent {
  type: 'delete';
  children: PhrasingContent[];
}

export interface InlineCode extends Literal {
  type: 'inlineCode';
}

export interface Break extends Node {
  type: 'break';
}

export interface Link extends Parent, Resource {
  type: 'link';
  children: StaticPhrasingContent[];
}

export interface Image extends Node, Resource, Alternative {
  type: 'image';

  // custom
  annotations?: {
    bg?: string;
    focus?: 'top' | 'bottom' | 'center' | 'top-right' | 'top-left' | 'default' | false;
    invertOnDark?: boolean;
    inline?: boolean;
  };
}

export interface LinkReference extends Parent, Reference {
  type: 'linkReference';
  children: StaticPhrasingContent[];
}

export interface ImageReference extends Node, Reference, Alternative {
  type: 'imageReference';
}

export interface Footnote extends Parent {
  type: 'footnote';
  children: PhrasingContent[];
}

export interface FootnoteReference extends Node, Association {
  type: 'footnoteReference';
}

// Mixin

export interface Resource {
  url: string;
  title?: string;
}

export interface Association {
  identifier: string;
  label?: string;
}

export interface Reference extends Association {
  referenceType: ReferenceType;
}

export interface Alternative {
  alt?: string;
}

// Custom

export interface Tabs extends Parent<Tab> {
  type: 'tabs';
}

export type TabsContent = Tab;

export interface Tab extends Parent {
  type: 'tab';

  annotations?: {
    title?: String;
  };
}

export interface CodeGroup extends Parent<Code> {
  type: 'codegroup';
}
