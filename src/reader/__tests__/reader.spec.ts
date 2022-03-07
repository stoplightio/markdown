import * as fs from 'fs';
import * as path from 'path';
import html from 'remark-html';
import unified from 'unified';

import { MDAST } from '../../ast-types';
import { Reader } from '../reader';

const prettier = require('prettier');

const prettyStringify = (input: MDAST.Root, parser: 'babel' | 'html' = 'babel') => {
  const processor = unified().use([html]);
  const output = processor.stringify(processor.runSync(input));
  return prettier.format(parser === 'babel' ? `<>${output}</>` : output, { parser });
};

describe('Reader', () => {
  let mdReader: Reader;

  beforeEach(() => {
    mdReader = new Reader();
  });

  describe('fromLang', () => {
    it('parses a line of text', () => {
      const tree = mdReader.fromLang(`A line of text.`);

      expect(tree).toEqual({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'A line of text.',
                position: {
                  start: {
                    line: 1,
                    column: 1,
                    offset: 0,
                  },
                  end: {
                    line: 1,
                    column: 16,
                    offset: 15,
                  },
                },
              },
            ],
            position: {
              start: {
                line: 1,
                column: 1,
                offset: 0,
              },
              end: {
                line: 1,
                column: 16,
                offset: 15,
              },
            },
          },
        ],
        position: {
          start: {
            line: 1,
            column: 1,
            offset: 0,
          },
          end: {
            line: 1,
            column: 16,
            offset: 15,
          },
        },
      });
    });

    it('parses text with marks', () => {
      const tree = mdReader.fromLang(`A line of text with **_nested_ marks** in a paragraph.`);

      expect(tree).toEqual({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                value: 'A line of text with ',
                position: {
                  start: {
                    line: 1,
                    column: 1,
                    offset: 0,
                  },
                  end: {
                    line: 1,
                    column: 21,
                    offset: 20,
                  },
                },
              },
              {
                type: 'strong',
                children: [
                  {
                    type: 'emphasis',
                    children: [
                      {
                        type: 'text',
                        value: 'nested',
                        position: {
                          start: {
                            line: 1,
                            column: 24,
                            offset: 23,
                          },
                          end: {
                            line: 1,
                            column: 30,
                            offset: 29,
                          },
                        },
                      },
                    ],
                    position: {
                      start: {
                        line: 1,
                        column: 23,
                        offset: 22,
                      },
                      end: {
                        line: 1,
                        column: 31,
                        offset: 30,
                      },
                    },
                  },
                  {
                    type: 'text',
                    value: ' marks',
                    position: {
                      start: {
                        line: 1,
                        column: 31,
                        offset: 30,
                      },
                      end: {
                        line: 1,
                        column: 37,
                        offset: 36,
                      },
                    },
                  },
                ],
                position: {
                  start: {
                    line: 1,
                    column: 21,
                    offset: 20,
                  },
                  end: {
                    line: 1,
                    column: 39,
                    offset: 38,
                  },
                },
              },
              {
                type: 'text',
                value: ' in a paragraph.',
                position: {
                  start: {
                    line: 1,
                    column: 39,
                    offset: 38,
                  },
                  end: {
                    line: 1,
                    column: 55,
                    offset: 54,
                  },
                },
              },
            ],
            position: {
              start: {
                line: 1,
                column: 1,
                offset: 0,
              },
              end: {
                line: 1,
                column: 55,
                offset: 54,
              },
            },
          },
        ],
        position: {
          start: {
            line: 1,
            column: 1,
            offset: 0,
          },
          end: {
            line: 1,
            column: 55,
            offset: 54,
          },
        },
      });
    });

    it('captures annotations for code blocks', () => {
      const markdown = `<!--
title: "My code snippet"
lineNumbers: false
highlightLines: [[1,2], [4,5]]
-->

\`\`\`javascript
var x = true;
\`\`\` `;

      const tree = mdReader.fromLang(markdown);

      expect(tree).toHaveProperty('children', [
        expect.objectContaining({
          type: 'code',
          annotations: {
            title: 'My code snippet',
            lineNumbers: false,
            highlightLines: [
              [1, 2],
              [4, 5],
            ],
          },
        }),
      ]);
    });
  });

  describe('to html', () => {
    it('should support tabs', () => {
      const input = fs.readFileSync(path.join(__dirname, 'fixtures/tabs.md'), 'utf8');

      const mdastTree = mdReader.fromLang(input);

      expect(prettyStringify(mdastTree)).toMatchInlineSnapshot(`
        "<>
          <h1 id=\\"article-with-tabs\\">Article with tabs</h1>
          <tabs>
            <tab type=\\"tab\\" title=\\"My First Tab\\">
              <p>The contents of tab 1.</p>
            </tab>
            <tab type=\\"tab\\" title=\\"My Second Tab\\">
              <p>The contents of tab 2.</p>
            </tab>
          </tabs>
        </>;
        "
      `);
    });

    it('should support annotations placed within tabs', () => {
      const input = fs.readFileSync(path.join(__dirname, 'fixtures/tabs-with-images.md'), 'utf8');

      const mdastTree = mdReader.fromLang(input);

      expect(prettyStringify(mdastTree, 'html')).toMatchInlineSnapshot(`
"<h1 id=\\"article-with-tabs-containing-embedded-annotations\\">
  Article with tabs containing embedded annotations
</h1>
<tabs
  ><tab type=\\"tab\\" title=\\"My Tab\\"
    ><p>The contents of tab 1.</p>
    <img
      src=\\"https://i.imgur.com/YCb6MWI.png\\"
      alt=\\"https://i.imgur.com/YCb6MWI.png\\"
      focus=\\"center\\" /></tab
></tabs>
"
`);
    });

    it('should support annotations placed within table cells', () => {
      const input = fs.readFileSync(path.join(__dirname, 'fixtures/table-cell-with-annotations.md'), 'utf8');

      const mdastTree = mdReader.fromLang(input);

      expect(prettyStringify(mdastTree, 'html')).toMatchInlineSnapshot(`
"<table>
  <thead>
    <tr>
      <th>foo</th>
      <th>bar</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>baz</td>
      <td>
        <img
          src=\\"https://i.imgur.com/ueOOL8X.png\\"
          alt=\\"picture\\"
          focus=\\"false\\"
        />
      </td>
    </tr>
  </tbody>
</table>
"
`);
    });

    it('should support kitchen sink smd', () => {
      const input = fs.readFileSync(path.join(__dirname, 'fixtures/smd.md'), 'utf8');

      const mdastTree = mdReader.fromLang(input);

      expect(prettyStringify(mdastTree)).toMatchInlineSnapshot(`
"<>
  <h1 id=\\"stoplight-flavored-markdown-smd\\">
    Stoplight Flavored Markdown (smd)
  </h1>
  <h3 id=\\"the-two-laws\\">The Two Laws</h3>
  <ol>
    <li>
      smd is human readable. A human with a simple text editor can easily read
      and comprehend smd.
    </li>
    <li>
      smd degrades gracefully. An smd document rendered on{\\" \\"}
      <code inline=\\"true\\">github.com</code> should be readable and clean.
    </li>
  </ol>
  <h3 id=\\"the-approach\\">The Approach</h3>
  <ol>
    <li>
      Stoplight flavored markdown extends github flavor markdown with inline
      comment annotations.
    </li>
    <li>
      The value inside of the annotations is a yaml object, and the annotation
      affects the following markdown block.
    </li>
  </ol>
  <p>
    By leveraging comments to store annotations, Stoplight flavored markdown
    degrades gracefully to any other markdown renderer (Github, for example).
  </p>
  <blockquote>
    <p>
      <a href=\\"https://github.com/mdx-js/mdx\\">MDX</a> is an interesting project
      that might allow our users to add more interactivity to their docs, at the
      cost of complexity (this is a more advanced use case). We would have to
      figure out a way to introduce this WITHOUT impacting those users that do
      not need the feature.
    </p>
  </blockquote>
  <h2 id=\\"tabs\\">Tabs</h2>
  <p>
    A smd tab container is a <code inline=\\"true\\">tab</code> annotation, followed
    by the tab content, and closed by a final <code inline=\\"true\\">tab-end</code>{\\" \\"}
    annotation.
  </p>
  <p>Tab containers cannot be nested.</p>
  <tabs>
    <tab type=\\"tab\\" title=\\"My First Tab\\">
      <p>The contents of tab 1.</p>
    </tab>
    <tab type=\\"tab\\" title=\\"My Second Tab\\">
      <p>The contents of tab 2.</p>
    </tab>
  </tabs>
  <h4 id=\\"markdown-sample\\">Markdown Sample</h4>
  <pre>
    <code class=\\"language-md\\" lang=\\"md\\">
      &#x3C;!-- type: tab title: My First Tab --> The contents of tab 1.
      &#x3C;!-- type: tab title: My Second Tab --> The contents of tab 2.
      &#x3C;!-- type: tab-end -->
    </code>
  </pre>
  <h2 id=\\"callouts\\">Callouts</h2>
  <p>
    A callout is a md block quote with an optional annotation that indicates
    intent.
  </p>
  <blockquote theme=\\"danger\\">
    <h3 id=\\"danger-will-robinson\\">Danger Will Robinson!</h3>
    <p>Here is my danger callout!</p>
  </blockquote>
  <blockquote theme=\\"warning\\">
    <h3 id=\\"watch-out\\">Watch Out!</h3>
    <p>Here is my warning callout!</p>
  </blockquote>
  <blockquote theme=\\"success\\">
    <h3 id=\\"mission-accomplished\\">Mission Accomplished!</h3>
    <p>Here is my success callout!</p>
  </blockquote>
  <blockquote theme=\\"info\\">
    <h3 id=\\"a-thing-to-know\\">A thing to know</h3>
    <p>Here is my info callout</p>
  </blockquote>
  <h4 id=\\"markdown-sample-1\\">Markdown Sample</h4>
  <pre>
    <code class=\\"language-md\\" lang=\\"md\\">
      &#x3C;!-- theme: danger --> > ### Danger Will Robinson! > > Here is my
      danger callout! &#x3C;!-- theme: warning --> > ### Watch Out! > > Here is
      my warning callout! &#x3C;!-- theme: success --> > ### Mission
      Accomplished! > > Here is my success callout! &#x3C;!-- theme: info --> >
      ### A thing to know > > Here is my info callout
    </code>
  </pre>
  <h2 id=\\"code-blocks\\">Code Blocks</h2>
  <p>
    A smd code block is md code fence with an optional annotation to tweak the
    presentation of the code block.
  </p>
  <pre>
    <code
      class=\\"language-bash\\"
      lang=\\"bash\\"
      title=\\"Fibonacci In Javascript\\"
      lineNumbers=\\"false\\"
      highlightLines=\\"1,2 4,5\\"
    >
      # hello
    </code>
  </pre>
  <h2 id=\\"raw-html\\">Raw HTML</h2>
  <pre>
    <code>&#x3C;div>Hello world!&#x3C;/div></code>
  </pre>
  <div>Hello world!</div>
  <h2 id=\\"inline-links\\">Inline Links</h2>
  <p>
    <a href=\\"http://example.com\\" title=\\"Example Domain\\">
      foo
    </a>
    ,{\\" \\"}
    <a href=\\"http://example.com\\" title=\\"Example Domain\\">
      foo
    </a>
    ,{\\" \\"}
    <a href=\\"http://example.com\\" title=\\"Example Domain\\">
      bar
    </a>
    .
  </p>
</>;
"
`);
    });
  });
});
