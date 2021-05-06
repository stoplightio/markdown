import { Dictionary } from '@stoplight/types';

export type AnnotationType = 'tab' | 'tab-end';

export type ThemeType = 'info' | 'warning' | 'danger' | 'success';

export interface IAnnotations<T extends Dictionary<any> = {}> {
  annotations?: T;
}

export type CodeAnnotations = {
  title?: string;
  resolved?: null | object;
  lineNumbers?: boolean;
  highlightLines?: number[] | number[][];
  json_schema?: boolean;
  http?: boolean;
};
