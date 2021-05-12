import * as Unist from 'unist';

export interface ILangReader {
  fromLang(raw: string): Unist.Parent;
  toLang(data: Unist.Parent): string;

  // (MM) TODO: We should probably commit to returning promises for these intense tasks
  // fromLang(raw: string): Promise<UnistT.IParentObj>;
  // toLang(data: UnistT.IParentObj): Promise<string>;
}
