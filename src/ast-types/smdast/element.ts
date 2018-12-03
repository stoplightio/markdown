import * as Unist from '@core/unist';

export type ElementTagNameType = 'div' | 'span';

// Generic html element
export interface IElement extends Unist.IParent {
  type: 'element';
  tagName: ElementTagNameType;
  properties: object;
}
