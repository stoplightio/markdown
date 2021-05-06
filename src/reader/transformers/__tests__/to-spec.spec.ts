import * as fs from 'fs';
import * as path from 'path';
import html from 'remark-html';
import remarkParse from 'remark-parse';
import unified from 'unified';

import { toSpec } from '../to-spec';

const prettier = require('prettier');

const parse = (input: string) => {
  return prettier.format(
    `<>${
      unified()
        // @ts-expect-error
        .use([remarkParse, () => toSpec, html])
        .processSync(input).contents
    }</>`,
    { parser: 'babel' },
  );
};

describe('toSpec plugin', () => {
  it('should support tabs', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/tabs.md'), 'utf8');

    expect(parse(input)).toMatchInlineSnapshot(`
      "<>
        <h1>Article with tabs</h1>
        <tabs>
          <tab type=\\"tab\\" title=\\"My First Tab\\">
            <paragraph>The contents of tab 1.</paragraph>
          </tab>
          <tab type=\\"tab\\" title=\\"My Second Tab\\">
            <paragraph>The contents of tab 2.</paragraph>
          </tab>
        </tabs>
      </>;
      "
    `);
  });

  it('should support kitchen sink smd', () => {
    const input = fs.readFileSync(path.join(__dirname, '__fixtures__/smd.md'), 'utf8');

    expect(parse(input)).toMatchInlineSnapshot(`
      "<>
        <h1>Stoplight Flavored Markdown (smd)</h1>
        <h3>The Two Laws</h3>
        <ol>
          <li>
            smd is human readable. A human with a simple text editor can easily read
            and comprehend smd.
          </li>
          <li>
            smd degrades gracefully. An smd document rendered on{\\" \\"}
            <code>github.com</code> should be readable and clean.
          </li>
        </ol>
        <h3>The Approach</h3>
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
        <h2>Tabs</h2>
        <p>
          A smd tab container is a <code>tab</code> annotation, followed by the tab
          content, and closed by a final <code>tab-end</code> annotation.
        </p>
        <p>Tab containers cannot be nested.</p>
        <tabs>
          <tab type=\\"tab\\" title=\\"My First Tab\\">
            <paragraph>The contents of tab 1.</paragraph>
          </tab>
          <tab type=\\"tab\\" title=\\"My Second Tab\\">
            <paragraph>The contents of tab 2.</paragraph>
          </tab>
        </tabs>
        <h4>Markdown Sample</h4>
        <pre>
          <code class=\\"language-md\\">
            &#x3C;!-- type: tab title: My First Tab --> The contents of tab 1.
            &#x3C;!-- type: tab title: My Second Tab --> The contents of tab 2.
            &#x3C;!-- type: tab-end -->
          </code>
        </pre>
        <h2>Callouts</h2>
        <p>
          A callout is a md block quote with an optional annotation that indicates
          intent.
        </p>
        <blockquote theme=\\"danger\\">
          <h3>Danger Will Robinson!</h3>
          <p>Here is my danger callout!</p>
        </blockquote>
        <blockquote theme=\\"warning\\">
          <h3>Watch Out!</h3>
          <p>Here is my warning callout!</p>
        </blockquote>
        <blockquote theme=\\"success\\">
          <h3>Mission Accomplished!</h3>
          <p>Here is my success callout!</p>
        </blockquote>
        <blockquote theme=\\"info\\">
          <h3>A thing to know</h3>
          <p>Here is my info callout</p>
        </blockquote>
        <h4>Markdown Sample</h4>
        <pre>
          <code class=\\"language-md\\">
            &#x3C;!-- theme: danger --> > ### Danger Will Robinson! > > Here is my
            danger callout! &#x3C;!-- theme: warning --> > ### Watch Out! > > Here is
            my warning callout! &#x3C;!-- theme: success --> > ### Mission
            Accomplished! > > Here is my success callout! &#x3C;!-- theme: info --> >
            ### A thing to know > > Here is my info callout
          </code>
        </pre>
        <h2>Code Blocks</h2>
        <p>
          A smd code block is md code fence with an optional annotation to tweak the
          presentation of the code block.
        </p>
        <pre>
          <code
            class=\\"language-bash\\"
            title=\\"Fibonacci In Javascript\\"
            highlightLines=\\"1,2 4,5\\"
          >
            # hello
          </code>
        </pre>
        <h2>Raw HTML</h2>
        <pre>
          <code>&#x3C;div>Hello world!&#x3C;/div></code>
        </pre>
        <div>Hello world!</div>
        <h2>Inline Links</h2>
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
