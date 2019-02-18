import * as Unist from 'unist';

export type ElementTagNameType = 'div' | 'span';

// Generic html element
export interface IElement extends Unist.Parent {
  type: 'element';
  tagName: ElementTagNameType;
  properties: object;
}
