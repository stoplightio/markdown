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

describe('inline-images plugin', () => {
  it('should support meta props like title and lineNumbers', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/images/basic-inline.md'), 'utf8');

    expect(prettyParse(input)).toMatchInlineSnapshot(`
"<>
  <p>
    Image in a paragraph:{\\" \\"}
    <img
      src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
      alt=\\"should have inline\\"
      inline=\\"true\\"
    />
    .
  </p>
  <img
    src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
    alt=\\"should NOT have inline\\"
  />
  <a href=\\"https://ecologi.com/stoplightinc\\">
    <img
      src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
      alt=\\"should have inline\\"
      inline=\\"true\\"
    />
  </a>
  <tabs>
    <tab type=\\"tab\\">
      <p>Tab paragraph one.</p>
      <img
        src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
        alt=\\"should NOT have inline\\"
      />
      <p>Tab paragraph two.</p>
    </tab>
  </tabs>
</>;
"
`);
  });

  it('should ignore whitespaces', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/images/whitespaces.md'), 'utf8');

    // let's make sure the document does indeed have the whitespaces.
    // someone may remove them when running prettier, etc., you know.
    expect(input).toContain('<!-- inline: true -->      ');
    expect(input).toContain('<!-- type: tab -->  ');
    expect(input).toContain('  <!-- type: tab-end -->      ');

    expect(prettyParse(input)).toMatchInlineSnapshot(`
"<>
  <p>Image in a paragraph:</p>
  <p inline=\\"true\\">
    <img
      src=\\"https://img.shields.io/badge/Buy%20us%20a%20tree-%F0%9F%8C%B3-lightgreen\\"
      alt=\\"should have inline\\"
      inline=\\"true\\"
    />
    .
  </p>
  <tabs>
    <tab type=\\"tab\\">
      <p>Tab paragraph two.</p>
    </tab>
  </tabs>
</>;
"
`);
  });
});
