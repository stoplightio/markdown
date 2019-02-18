import * as Mdast from '../ast-types/mdast';
import * as SMdast from '../ast-types/smdast';
import { parse } from '../parse';
import { stringify } from '../stringify';
import { fromSpec } from './transformers/from-spec';
import { toSpec } from './transformers/to-spec';
import { ILangReader } from './types';

export class Reader implements ILangReader {
  public fromLang(raw: string): Mdast.IRoot {
    return parse(raw) as Mdast.IRoot;
  }

  public toLang(data: Mdast.IRoot): string {
    return stringify(data, {
      // https://github.com/remarkjs/remark/tree/master/packages/remark-stringify#options
      commonmark: true,
      gfm: true,
      bullet: '*',
      fence: '`',
      fences: true,
      incrementListMarker: true,
      listItemIndent: '1',
    });
  }

  public fromSpec = fromSpec;
  public toSpec = toSpec;

  public read(raw: string): SMdast.IRoot {
    return this.fromSpec(this.fromLang(raw));
  }
}
