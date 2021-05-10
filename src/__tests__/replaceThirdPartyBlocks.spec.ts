import * as fs from 'fs';
import { join } from 'path';
import { performance } from 'perf_hooks';

import { parse } from '../parse';
import { stringify } from '../stringify';

const FIXTURES_DIR = join(__dirname, '__fixtures__/third-party-blocks/');
const simple = fs.readFileSync(join(FIXTURES_DIR, 'simple.md'), 'utf-8');
const complex = fs.readFileSync(join(FIXTURES_DIR, 'complex.md'), 'utf-8');

describe('replaceThirdPartyBlocks', () => {
  it('should replace 3rd party block syntax with code fence', () => {
    expect(stringify(parse(simple))).toMatchInlineSnapshot(`
      "# Heading

      \`\`\`block_image
      {
        \\"images\\": [
          {
            \\"image\\": [
              \\"https://foo.com\\",
              \\"foo.png\\",
              222,
              111,
              \\"#faf9f9\\"
            ]
          }
        ]
      }
      \`\`\`

      And a code one:

      \`\`\`block_code
      {
        \\"blah\\"
      }
      [/block]
      \`\`\`
      "
    `);
  });

  it('should have decent performance', () => {
    const t0 = performance.now();

    stringify(parse(complex));

    const t1 = performance.now();
    const timeTaken = Math.round(t1 - t0);

    expect(timeTaken).toBeLessThan(200);
  });
});
