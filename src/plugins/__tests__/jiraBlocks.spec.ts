import fs from 'fs';
import { join } from 'path';
import { parse } from '../../parse';
import { stringify } from '../../stringify';

describe('Jira blocks plugin', () => {
  it('should parse simple jira block', () => {
    expect(
      parse(`[block:image]
{}
[/block]`),
    ).toStrictEqual(
      expect.objectContaining({
        children: [
          {
            code: 'image',
            position: expect.objectContaining({
              end: {
                column: 9, // markdown lines are columns is 1-based
                line: 3,
                offset: 25,
              },
              start: {
                column: 1,
                line: 1,
                offset: 0,
              },
            }),
            type: 'jira',
            value: '{}',
          },
        ],
        type: 'root',
      }),
    );
  });

  it('should parse more complex document correctly', () => {
    expect(parse(fs.readFileSync(join(__dirname, '__fixtures__/jira.md'), 'utf8'))).toMatchSnapshot();
  });

  it('should not recognize blocks contained in fenced code', () => {
    expect(
      parse(`\`\`\`
[block:image]
{}
[/block]
\`\`\``),
    ).toStrictEqual(
      expect.objectContaining({
        type: 'root',
        children: [
          expect.objectContaining({
            type: 'code',
            lang: null,
            meta: null,
            value: '[block:image]\n{}\n[/block]',
          }),
        ],
      }),
    );
  });

  describe('should not recognize invalid blocks', () => {
    it('no new-line', () => {
      expect(
        parse(`[block:image] {}
[/block]`),
      ).toStrictEqual(
        expect.objectContaining({
          children: expect.not.arrayContaining([
            expect.objectContaining({
              type: 'jira',
            }),
          ]),
        }),
      );
    });

    it('no code', () => {
      expect(
        parse(`[block]
{}
[/block]`),
      ).toStrictEqual(
        expect.objectContaining({
          children: expect.not.arrayContaining([
            expect.objectContaining({
              type: 'jira',
            }),
          ]),
        }),
      );
    });

    it('no ending', () => {
      expect(
        parse(`[block:code]
{}
`),
      ).toStrictEqual(
        expect.objectContaining({
          children: expect.not.arrayContaining([
            expect.objectContaining({
              type: 'jira',
            }),
          ]),
        }),
      );
    });
  });

  it('should stringify markdown containing jira blocks', () => {
    const document = fs.readFileSync(join(__dirname, './__fixtures__/jira.md'), 'utf8');

    expect(stringify(parse(document))).toBe(document);
  });
});
