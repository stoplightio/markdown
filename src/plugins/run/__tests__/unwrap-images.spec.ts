import * as fs from 'fs';
import * as path from 'path';
import html from 'remark-html';
import remarkParse from 'remark-parse';
import unified from 'unified';

import { remarkParsePreset } from '../../../parse';

const prettier = require('prettier');

const prettyParse = (input: string) => {
  return prettier.format(
    `<>${unified()
      .use(remarkParse)
      .use(remarkParsePreset)
      .use(html, { closeSelfClosing: true })
      .processSync(input)}</>`,
    {
      parser: 'babel',
    },
  );
};

describe('unwrap-images plugin', () => {
  it('should support meta props like title and lineNumbers', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/images/unwrap.md'), 'utf8');

    expect(prettyParse(input)).toMatchInlineSnapshot(`
"<>
  <p>
    Image in a paragraph:{\\" \\"}
    <img
      src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
      alt=\\"should NOT unwrap\\"
      inline=\\"true\\"
    />
    .
  </p>
  <img
    src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
    alt=\\"should unwrap\\"
  />
  <a href=\\"https://ecologi.com/stoplightinc\\">
    <img
      src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
      alt=\\"should unwrap\\"
      inline=\\"true\\"
    />
  </a>
  <p>
    <img
      src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
      alt=\\"should NOT unwrap\\"
      inline=\\"true\\"
    />{\\" \\"}
    <a href=\\"https://ecologi.com/stoplightinc\\">
      <img
        src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
        alt=\\"should NOT unwrap\\"
        inline=\\"true\\"
      />
    </a>
  </p>
</>;
"
`);
  });
});
