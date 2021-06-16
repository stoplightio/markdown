import * as HAST from 'hast';

type ThemeType = 'info' | 'warning' | 'danger' | 'success';

export interface Root extends HAST.Root {}
export interface Parent extends HAST.Parent {}
export interface Text extends HAST.Text {}

export interface Element extends HAST.Element {
  tagName: Exclude<keyof HTMLElementTagNameMap, 'blockquote' | 'code'>;
  properties?: HAST.Properties;
}

export interface BlockquoteProperties {
  theme?: ThemeType;
}

export interface Blockquote extends HAST.Element {
  tagName: 'blockquote';

  properties?: BlockquoteProperties & HAST.Properties;
}

export interface ImageProperties {
  bg?: string;
  focus?: 'top' | 'bottom' | 'center' | 'top-right' | 'top-left' | 'default' | 'false';
  invertOnDark?: 'true' | 'false';
  inline?: 'true' | 'false';
}

export interface Image extends HAST.Element {
  tagName: 'img';
  properties?: ImageProperties & HAST.Properties;
}

export interface CodeProperties {
  title?: string;
  lang?: string;
  lineNumbers?: 'true' | 'false';
  /** stringified json: string[] | string[][] */
  highlightLines?: string;
  inline?: 'true' | 'false';
  live?: 'true' | 'false';
  jsonSchema?: 'true' | 'false';
  http?: 'true' | 'false';
}

export interface Code extends HAST.Element {
  tagName: 'code';
  properties?: CodeProperties & HAST.Properties;
}

export interface Tabs extends HAST.Element {
  tagName: 'tabs';
  properties?: HAST.Properties;
}

export interface Tab extends HAST.Element {
  tagName: 'tab';
  properties?: HAST.Properties;
}

export interface CodeGroup extends HAST.Element {
  tagName: 'codegroup';
  properties?: HAST.Properties;
}
