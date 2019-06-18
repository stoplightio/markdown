import { parse } from '../../parse';
import { getSummary } from '../get-summary';

describe('get-summary', () => {
  it('should return frontmatter summary if present', () => {
    const summary = getSummary(
      parse(`---
summary: my summary
---

# Other Title

Yo
`),
    );

    expect(summary).toBe('my summary');
  });

  it('should return first paragraph if present', () => {
    const summary = getSummary(
      parse(`# Other Title

Paragraph 1.

Paragraph 2.
`),
    );

    expect(summary).toBe('Paragraph 1.');
  });

  it('should strip markdown out of paragraph', () => {
    const summary = getSummary(parse(`this has a [link](./foo.json)`));

    expect(summary).toBe('this has a link');
  });

  it('should limit to 150 by default', () => {
    const val = `this is a longer paragraph that is over fifty characters long. it goes on and on and on. it wont stop cant stop forever and ever def more than 100 characters.`;

    const summary = getSummary(parse(val));

    expect(summary).toBe(`${val.slice(0, 150)}...`);
  });

  it('should accept a length option', () => {
    const summary = getSummary(
      parse(`this is a longer paragraph that is over fifty characters long. it goes on and on and on`),
      {
        truncate: 4,
      },
    );

    expect(summary).toBe('this...');
  });

  it('should return undefined if no frontmatter summary and no paragraphs', () => {
    const summary = getSummary(parse(`## Hello`));
    expect(summary).toBe(undefined);
  });
});
