import { MDAST } from '../ast-types';
import { parse } from '../parse';
import { stringify } from '../stringify';
import { ILangReader } from './types';

export class Reader implements ILangReader {
  public fromLang(raw: string): MDAST.Root {
    return parse(raw);
  }

  public toLang(data: MDAST.Root): string {
    return stringify(data);
  }
}
