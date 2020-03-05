import * as fs from 'fs';
import { join } from 'path';
import { parse } from '../parse';

describe('parse', () => {
  it('should parse simple', () => {
    expect(parse('**simple**')).toMatchSnapshot();
  });

  it('should work when called multiple times in a row', () => {
    // This tests to make sure the processor isn't frozen: https://github.com/unifiedjs/unified/blob/7ee2c8f563f0ebe330cd76496be9ba405a1cd023/readme.md#processorfreeze

    expect(parse('**simple**')).toEqual(parse('**simple**'));
  });

  describe('jira blocks', () => {
    it('parses simple jira block', () => {
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

    it('parses more complex document correctly', () => {
      expect(parse(fs.readFileSync(join(__dirname, '__fixtures__/jira.md'), 'utf8'))).toMatchSnapshot();
    });

    it('does not recognize blocks contained in fenced code', () => {
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

    describe('does not recognize invalid blocks', () => {
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
  });
});
