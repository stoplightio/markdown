import * as Unist from '@core/unist';

import { IAnnotations } from './annotations';

export interface ITabContainer extends Unist.Parent {
  type: 'tabContainer';
  children: Unist.types.INodeObj[];
}

export interface ITab extends Unist.Parent {
  type: 'tab';
  annotations?: IAnnotations;
}
