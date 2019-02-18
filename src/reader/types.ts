import * as Mdast from '../ast-types/mdast';

export interface ILangReader {
  fromLang(raw: string): Mdast.IRoot;
  toLang(data: Mdast.IRoot): string;

  // (MM) TODO: We should probably commit to returning promises for these intense tasks
  // fromLang(raw: string): Promise<UnistT.IParentObj>;
  // toLang(data: UnistT.IParentObj): Promise<string>;
}
