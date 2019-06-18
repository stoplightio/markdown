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

  it('should accept a length option', () => {
    const summary = getSummary(parse(`the dog barks`), {
      truncate: 3,
    });

    expect(summary).toBe('the...');
  });

  it('should return undefined if no frontmatter summary and no paragraphs', () => {
    const summary = getSummary(parse(`## Hello`));
    expect(summary).toBe(undefined);
  });
});
