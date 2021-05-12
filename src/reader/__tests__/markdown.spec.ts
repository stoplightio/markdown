import * as fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import { Reader as MdReader } from '../reader';

const mdReader = new MdReader();
const __dirname = dirname(fileURLToPath(import.meta.url));

describe('markdown-tests', () => {
  const files = fs.readdirSync(`${__dirname}/fixtures/markdown`);
  for (const name of files) {
    if (!name.endsWith('.md')) {
      continue;
    }

    const filepath = `fixtures/markdown/${name}`;
    it(filepath, () => {
      const contents = fs.readFileSync(`${__dirname}/${filepath}`, {
        encoding: 'utf8',
      });

      const fromLang = mdReader.fromLang(contents);
      const toLang = mdReader.toLang(fromLang);

      expect(toLang.trim()).toEqual(contents.trim());
    });
  }

  describe('code annotations', () => {
    it('converts deprecated code block annotations to meta string', () => {
      const input = `<!--
title: "My example"
lineNumbers: true
highlightLines: [[1,2], 4, [6,7]]
-->

\`\`\`json
{
  "one": 1,
  "two": 2,
  "three": 3,
  "four": 4,
  "five": 5,
  "six": 6,
  "seven": 7,
}
\`\`\``;

      const output = `\`\`\`json title="My example" lineNumbers {1-2,4,6-7}
{
  "one": 1,
  "two": 2,
  "three": 3,
  "four": 4,
  "five": 5,
  "six": 6,
  "seven": 7,
}
\`\`\``;

      const fromLang = mdReader.fromLang(input);
      const toLang = mdReader.toLang(fromLang);
      expect(toLang.trim()).toEqual(output);
    });

    it('ignore falsey lineNumbers', () => {
      const input = `<!-- lineNumbers: false -->

\`\`\`json
{
  "one": 1
}
\`\`\``;

      const output = `\`\`\`json
{
  "one": 1
}
\`\`\``;

      const fromLang = mdReader.fromLang(input);
      const toLang = mdReader.toLang(fromLang);
      expect(toLang.trim()).toEqual(output);
    });

    it('support old type: json_schema pattern', () => {
      const input = `<!-- type: json_schema -->

\`\`\`json
{
  "one": 1
}
\`\`\``;

      const output = `\`\`\`json jsonSchema
{
  "one": 1
}
\`\`\``;

      const fromLang = mdReader.fromLang(input);
      const toLang = mdReader.toLang(fromLang);
      expect(toLang.trim()).toEqual(output);
    });

    it('appends to existing metastring annotations', () => {
      const input = `<!-- lineNumbers: true -->

\`\`\`json title="My title" myRandomProp {1}
{
  "one": 1
}
\`\`\``;

      const output = `\`\`\`json title="My title" myRandomProp {1} lineNumbers
{
  "one": 1
}
\`\`\``;

      const fromLang = mdReader.fromLang(input);
      const toLang = mdReader.toLang(fromLang);
      expect(toLang.trim()).toEqual(output);
    });
  });
});
