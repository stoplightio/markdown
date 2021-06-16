import * as HAST from 'hast';

type ThemeType = 'info' | 'warning' | 'danger' | 'success';

export interface Root extends HAST.Root {}
export interface Parent extends HAST.Parent {}
export interface Text extends HAST.Text {}

export interface Element extends HAST.Element {
  tagName: Exclude<keyof HTMLElementTagNameMap, 'blockquote' | 'code'>;
  properties?: HAST.Properties;
}

export interface Blockquote extends HAST.Element {
  tagName: 'blockquote';

  properties?: {
    theme: ThemeType;
  } & HAST.Properties;
}

export interface Image extends HAST.Element {
  tagName: 'img';

  properties?: {
    bg?: string;
    focus?: 'top' | 'bottom' | 'center' | 'top-right' | 'top-left' | 'default' | 'false';
    invertOnDark?: 'true' | 'false';
    inline?: 'true' | 'false';
  } & HAST.Properties;
}

export interface Code extends HAST.Element {
  tagName: 'code';

  properties?: {
    title?: string;
    lang?: string;
    lineNumbers?: 'true' | 'false';
    /** stringified json: string[] | string[][] */
    highlightLines?: string;
    inline?: 'true' | 'false';
    live?: 'true' | 'false';
    jsonSchema?: 'true' | 'false';
    http?: 'true' | 'false';
  } & HAST.Properties;
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
