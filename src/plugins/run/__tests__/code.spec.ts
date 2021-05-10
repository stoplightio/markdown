import * as fs from 'fs';
import * as path from 'path';
import prettier from 'prettier';
import html from 'remark-html';
import remarkParse from 'remark-parse';
import unified from 'unified';
import { fileURLToPath } from 'url';

import { remarkParsePreset } from '../../../parse';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const prettyParse = (input: string) => {
  return prettier.format(
    `<>${unified().use(remarkParse).use(remarkParsePreset).use(html).processSync(input).contents}</>`,
    {
      parser: 'babel',
    },
  );
};

describe('code plugin', () => {
  describe('annotations', () => {
    it('should support meta props like title and lineNumbers', () => {
      const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/with-meta.md'), 'utf8');

      expect(prettyParse(input)).toMatchInlineSnapshot(`
        "<>
          <h2 id=\\"my-title\\">My Title</h2>
          <p>Starting paragraph.</p>
          <codegroup>
            <pre>
              <code
                class=\\"language-bash\\"
                lang=\\"bash\\"
                meta=\\"title=&#x22;title 1&#x22;\\"
                title=\\"title 1\\"
              >
                # my bash
              </code>
            </pre>
            <pre>
              <code
                class=\\"language-js\\"
                lang=\\"js\\"
                meta=\\"lineNumbers title=&#x22;title 2&#x22;\\"
                title=\\"title 2\\"
                lineNumbers=\\"true\\"
              >
                var x = 'y';
              </code>
            </pre>
          </codegroup>
          <p>End paragraph.</p>
        </>;
        "
      `);
    });

    it('should support deprecated annotation syntax', () => {
      const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/with-legacy-annotations.md'), 'utf8');

      expect(prettyParse(input)).toMatchInlineSnapshot(`
        "<>
          <p>With legacy json_schema annotation:</p>
          <pre>
            <code
              class=\\"language-yaml\\"
              lang=\\"yaml\\"
              meta=\\"title=&#x22;title 1&#x22;\\"
              title=\\"title 1\\"
              jsonSchema=\\"true\\"
            >
              type: object
            </code>
          </pre>
          <p>With legacy json_schema snakecase tag in meta:</p>
          <pre>
            <code
              class=\\"language-json\\"
              lang=\\"json\\"
              meta=\\"json_schema title=&#x22;title 1&#x22;\\"
              title=\\"title 1\\"
              jsonSchema=\\"true\\"
            >
              type: object
            </code>
          </pre>
          <p>With legacy http annotation:</p>
          <pre>
            <code class=\\"language-yaml\\" lang=\\"yaml\\" http=\\"true\\">
              method: get
            </code>
          </pre>
        </>;
        "
      `);
    });
  });

  describe('codegroups', () => {
    it('should wrap consecutive code blocks in a <codegroup> node', () => {
      const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/simple.md'), 'utf8');

      expect(prettyParse(input)).toMatchInlineSnapshot(`
        "<>
          <codegroup>
            <pre>
              <code class=\\"language-bash\\" lang=\\"bash\\">
                # my bash
              </code>
            </pre>
            <pre>
              <code class=\\"language-js\\" lang=\\"js\\">
                var x = 'y';
              </code>
            </pre>
          </codegroup>
        </>;
        "
      `);
    });

    it('should support not grouped', () => {
      const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/not-grouped.md'), 'utf8');

      expect(prettyParse(input)).toMatchInlineSnapshot(`
        "<>
          <pre>
            <code class=\\"language-bash\\" lang=\\"bash\\">
              # my bash
            </code>
          </pre>
          <p>Has a line in between, so not grouped.</p>
          <pre>
            <code class=\\"language-js\\" lang=\\"js\\">
              var x = 'y';
            </code>
          </pre>
        </>;
        "
      `);
    });

    it('should support multiple groups', () => {
      const input = fs.readFileSync(path.join(__dirname, '__fixtures__/code/multiple-groups.md'), 'utf8');

      expect(prettyParse(input)).toMatchInlineSnapshot(`
        "<>
          <codegroup>
            <pre>
              <code class=\\"language-bash\\" lang=\\"bash\\">
                # my bash
              </code>
            </pre>
            <pre>
              <code class=\\"language-js\\" lang=\\"js\\">
                var x = 'y';
              </code>
            </pre>
          </codegroup>
          <p>Something in between 1.</p>
          <codegroup>
            <pre>
              <code class=\\"language-bash\\" lang=\\"bash\\">
                # my bash 2
              </code>
            </pre>
            <pre>
              <code class=\\"language-js\\" lang=\\"js\\">
                var x = 'y';
              </code>
            </pre>
          </codegroup>
          <p>Something in between 2.</p>
          <codegroup>
            <pre>
              <code class=\\"language-bash\\" lang=\\"bash\\">
                # my bash 3
              </code>
            </pre>
            <pre>
              <code class=\\"language-js\\" lang=\\"js\\">
                var x = 'y';
              </code>
            </pre>
            <pre>
              <code class=\\"language-js\\" lang=\\"js\\">
                var x2 = 'y2';
              </code>
            </pre>
          </codegroup>
          <p>Something in between 3 - next one is not grouped.</p>
          <pre>
            <code class=\\"language-js\\" lang=\\"js\\">
              var x3 = 'y3';
            </code>
          </pre>
        </>;
        "
      `);
    });
  });
});
