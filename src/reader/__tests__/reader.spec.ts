import { Reader } from '../reader';

describe('Reader', () => {
  describe('fromLang', () => {
    test('parses a line of text', () => {
      const mdReader = new Reader();

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
                  indent: [],
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
              indent: [],
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

    test('parses text with marks', () => {
      const mdReader = new Reader();

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
                  indent: [],
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
                          indent: [],
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
                      indent: [],
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
                      indent: [],
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
                  indent: [],
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
                  indent: [],
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
              indent: [],
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
  });

  describe('toSpec', () => {
    test('captures annotations for code blocks', () => {
      const mdReader = new Reader();

      const markdown = `<!--
title: "My code snippet"
lineNumbers: false
highlightLines: [[1,2], [4,5]]
    -->
    
    \`\`\`javascript
    var x = true;
    \`\`\` `;

      const tree = mdReader.toSpec(mdReader.fromLang(markdown));

      expect(tree).toHaveProperty('children', [
        expect.objectContaining({
          type: 'code',
          annotations: {
            title: 'My code snippet',
            lineNumbers: false,
            highlightLines: [[1, 2], [4, 5]],
          },
        }),
      ]);
    });
  });
});
