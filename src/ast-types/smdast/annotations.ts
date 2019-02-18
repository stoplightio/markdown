export type ThemeType = 'info' | 'warning' | 'danger' | 'success';

export type AnnotationType = 'tab' | 'tab-end';

export interface IAnnotations {
  type?: AnnotationType;
  theme?: ThemeType;
  title?: string;
}
