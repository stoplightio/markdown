import { Parent } from '../mdast';

export type ElementTagNameType = 'div' | 'span';

// Generic html element
export interface IElement extends Parent {
  type: 'element';
  tagName: ElementTagNameType;
  properties: object;
}
