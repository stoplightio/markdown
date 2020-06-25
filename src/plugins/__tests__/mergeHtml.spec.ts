import unified from 'unified';
import { parse } from '../../parse';
import mergeHtml from '../mergeHtml';

describe('merge HTML plugin', () => {
  it('should handle empty element', () => {
    const parsed = parse(`<span></span>`);

    expect(
      unified()
        .use(mergeHtml)
        .runSync(parsed),
    ).toStrictEqual(
      expect.objectContaining({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            position: expect.any(Object),
            children: [
              {
                type: 'html',
                value: '<span></span>',
                position: expect.any(Object),
              },
            ],
          },
        ],
      }),
    );
  });

  it('should parse attributes', () => {
    // based on https://github.com/nghiattran/html-attribute-parser/blob/master/test.js#L6
    const parsed = parse(`<span attr class="animated infinite" ng-class="main.classAnimation">foo</span>`);

    expect(
      unified()
        .use(mergeHtml)
        .runSync(parsed),
    ).toStrictEqual(
      expect.objectContaining({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            position: expect.any(Object),
            children: [
              {
                type: 'inlineHtml',
                attributes: {
                  attr: true,
                  class: 'animated infinite',
                  'ng-class': 'main.classAnimation',
                },
                tagName: 'span',
                position: expect.any(Object),
                children: [
                  {
                    type: 'text',
                    value: 'foo',
                    position: expect.any(Object),
                  },
                ],
              },
            ],
          },
        ],
      }),
    );
  });

  it('should prepare children for inline html element', () => {
    const parsed = parse(`HTML link <a href="https://google.com">**hello** _world_ ~~navigate~~ to</a>.`);

    expect(
      unified()
        .use(mergeHtml)
        .runSync(parsed),
    ).toStrictEqual(
      expect.objectContaining({
        type: 'root',
        children: [
          {
            type: 'paragraph',
            position: expect.any(Object),
            children: [
              {
                type: 'text',
                value: 'HTML link ',
                position: expect.any(Object),
              },
              {
                type: 'inlineHtml',
                attributes: {
                  href: 'https://google.com',
                },
                tagName: 'a',
                position: expect.any(Object),
                children: [
                  {
                    type: 'strong',
                    position: expect.any(Object),
                    children: [
                      {
                        type: 'text',
                        value: 'hello',
                        position: expect.any(Object),
                      },
                    ],
                  },
                  {
                    type: 'text',
                    value: ' ',
                    position: expect.any(Object),
                  },
                  {
                    position: expect.any(Object),
                    type: 'emphasis',
                    children: [
                      {
                        type: 'text',
                        position: expect.any(Object),
                        value: 'world',
                      },
                    ],
                  },
                  {
                    type: 'text',
                    value: ' ',
                    position: expect.any(Object),
                  },
                  {
                    type: 'delete',
                    position: expect.any(Object),
                    children: [
                      {
                        type: 'text',
                        value: 'navigate',
                        position: expect.any(Object),
                      },
                    ],
                  },
                  {
                    type: 'text',
                    value: ' to',
                    position: expect.any(Object),
                  },
                ],
              },
              {
                type: 'text',
                position: expect.any(Object),
                value: '.',
              },
            ],
          },
        ],
      }),
    );
  });

  it('should ignore any markdown inside block html element', () => {
    const parsed = parse(`<dl>
  <dt>Definition list</dt>
  <dd>Is something people use sometimes.</dd>

  <dt>Markdown in HTML</dt>
  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>
</dl>`);

    expect(
      unified()
        .use(mergeHtml)
        .runSync(parsed),
    ).toStrictEqual({
      type: 'root',
      children: [
        {
          type: 'html',
          value:
            '<dl>\n  <dt>Definition list</dt>\n  <dd>Is something people use sometimes.</dd>  <dt>Markdown in HTML</dt>\n  <dd>Does *not* work **very** well. Use HTML <em>tags</em>.</dd>\n</dl>',
          position: expect.any(Object),
        },
      ],
      position: expect.any(Object),
    });
  });

  it('should treat comments with care', () => {
    const parsed = parse(`<!-- theme: danger -->

> ### Danger Will Robinson!
>
> Here is my danger callout!

<!-- theme: warning -->`);

    expect(
      unified()
        .use(mergeHtml)
        .runSync(parsed),
    ).toStrictEqual({
      type: 'root',
      children: [
        {
          type: 'html',
          value: '<!-- theme: danger -->',
          position: expect.any(Object),
        },
        {
          type: 'blockquote',
          children: [
            {
              type: 'heading',
              depth: 3,
              children: [
                {
                  type: 'text',
                  value: 'Danger Will Robinson!',
                  position: expect.any(Object),
                },
              ],
              position: expect.any(Object),
            },
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  value: 'Here is my danger callout!',
                  position: expect.any(Object),
                },
              ],
              position: expect.any(Object),
            },
          ],
          position: expect.any(Object),
        },
        {
          type: 'html',
          value: '<!-- theme: warning -->',
          position: expect.any(Object),
        },
      ],
      position: expect.any(Object),
    });
  });
});
