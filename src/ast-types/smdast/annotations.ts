import { Dictionary } from '@stoplight/types';

export type AnnotationType = 'tab' | 'tab-end';

export type ThemeType = 'info' | 'warning' | 'danger' | 'success';

export interface IAnnotations<T extends Dictionary<any> = {}> {
  annotations?: T;
}
