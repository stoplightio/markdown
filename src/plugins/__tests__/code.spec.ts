import * as fs from 'fs';
import * as path from 'path';
import html from 'remark-html';
import remarkParse from 'remark-parse';
import unified from 'unified';

import { smdCode } from '../code';

const prettier = require('prettier');

const parse = (input: string) => {
  return prettier.format(`<>${unified().use([remarkParse, smdCode, html]).processSync(input).contents}</>`, {
    parser: 'babel',
  });
};

describe('code plugin', () => {
  it('should wrap consecutive code blocks in a <codegroup> node', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/simple.md'), 'utf8');

    expect(parse(input)).toMatchInlineSnapshot(`
      "<>
        <codegroup>
          <pre>
            <code class=\\"language-bash\\"># my bash</code>
          </pre>
          <pre>
            <code class=\\"language-js\\">var x = 'y';</code>
          </pre>
        </codegroup>
      </>;
      "
    `);
  });

  it('should support meta props like title and lineNumbers', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/with-meta.md'), 'utf8');

    expect(parse(input)).toMatchInlineSnapshot(`
      "<>
        <h2>My Title</h2>
        <p>Starting paragraph.</p>
        <codegroup>
          <pre>
            <code class=\\"language-bash\\" title=\\"title 1\\">
              # my bash
            </code>
          </pre>
          <pre>
            <code class=\\"language-js\\" lineNumbers=\\"true\\" title=\\"title 2\\">
              var x = 'y';
            </code>
          </pre>
        </codegroup>
        <p>End paragraph.</p>
      </>;
      "
    `);
  });

  it('should support not grouped', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/not-grouped.md'), 'utf8');

    expect(parse(input)).toMatchInlineSnapshot(`
      "<>
        <pre>
          <code class=\\"language-bash\\"># my bash</code>
        </pre>
        <p>Has a line in between, so not grouped.</p>
        <pre>
          <code class=\\"language-js\\">var x = 'y';</code>
        </pre>
      </>;
      "
    `);
  });

  it('should support multiple groups', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/multiple-groups.md'), 'utf8');

    expect(parse(input)).toMatchInlineSnapshot(`
      "<>
        <codegroup>
          <pre>
            <code class=\\"language-bash\\"># my bash</code>
          </pre>
          <pre>
            <code class=\\"language-js\\">var x = 'y';</code>
          </pre>
        </codegroup>
        <p>Something in between 1.</p>
        <codegroup>
          <pre>
            <code class=\\"language-bash\\"># my bash 2</code>
          </pre>
          <pre>
            <code class=\\"language-js\\">var x = 'y';</code>
          </pre>
        </codegroup>
        <p>Something in between 2.</p>
        <codegroup>
          <pre>
            <code class=\\"language-bash\\"># my bash 3</code>
          </pre>
          <pre>
            <code class=\\"language-js\\">var x = 'y';</code>
          </pre>
          <pre>
            <code class=\\"language-js\\">var x2 = 'y2';</code>
          </pre>
        </codegroup>
        <p>Something in between 3 - next one is not grouped.</p>
        <pre>
          <code class=\\"language-js\\">var x3 = 'y3';</code>
        </pre>
      </>;
      "
    `);
  });
});
