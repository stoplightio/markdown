import * as Unist from 'unist';

import { IAnnotations } from './annotations';

export interface ITabContainer extends Unist.Parent {
  type: 'tabContainer';
  children: Unist.Node[];
}

export interface ITab extends Unist.Parent {
  type: 'tab';
  annotations?: IAnnotations;
}
