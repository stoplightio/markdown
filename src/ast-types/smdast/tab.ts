import { Dictionary } from '@stoplight/types';
import * as Unist from 'unist';

import { IAnnotations } from './annotations';

export interface ITabContainer extends Unist.Parent {
  type: 'tabContainer';
  children: Unist.Node[];
}

export interface ITab<T extends Dictionary<any> = { type?: string }> extends IAnnotations<T>, Unist.Parent {
  type: 'tab';
}
