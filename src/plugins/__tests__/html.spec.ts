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
                type: 'inlineHtml',
                attributes: {},
                tagName: 'span',
                position: expect.any(Object),
                children: [],
              },
            ],
          },
        ],
      }),
    );
  });

  it('should parse attributes', () => {
    // based on https://github.com/nghiattran/html-attribute-parser/blob/master/test.js#L6
    const parsed = parse(`<span attr class="animated infinite" ng-class="main.classAnimation"></span>`);

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
                children: [],
              },
            ],
          },
        ],
      }),
    );
  });

  it('should prepare children for inline html tag', () => {
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
});
