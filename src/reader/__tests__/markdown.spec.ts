import * as fs from 'fs';

import { Reader as MdReader } from '../reader';

const mdReader = new MdReader();

describe('markdown-tests', () => {
  const files = fs.readdirSync(`${__dirname}/fixtures/markdown`);
  for (const name of files) {
    if (!name.endsWith('.md')) {
      continue;
    }

    const filepath = `fixtures/markdown/${name}`;
    test(filepath, () => {
      const contents = fs.readFileSync(`${__dirname}/${filepath}`, {
        encoding: 'utf8',
      });

      const fromLang = mdReader.fromLang(contents);
      const toSpec = mdReader.toSpec(fromLang);
      const fromSpec = mdReader.fromSpec(toSpec);
      const toLang = mdReader.toLang(fromSpec);

      expect(contents.trim()).toEqual(toLang.trim());
    });
  }
});
