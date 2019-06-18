import { parse } from '../../parse';
import { getSummary } from '../get-summary';

describe('get-summary', () => {
  it('should return frontmatter summary if present', () => {
    const title = getSummary(
      parse(`---
summary: my summary
---

# Other Title

Yo
`),
    );

    expect(title).toBe('my summary');
  });

  it('should return first paragraph if present', () => {
    const title = getSummary(
      parse(`# Other Title

Paragraph 1.

Paragraph 2.
`),
    );

    expect(title).toBe('Paragraph 1.');
  });

  it('should strip markdown out of paragraph', () => {
    const title = getSummary(parse(`this has a [link](./foo.json)`));

    expect(title).toBe('this has a link');
  });

  it('should limit to 50 by default', () => {
    const title = getSummary(
      parse(`this is a longer paragraph that is over fifty characters long. it goes on and on and on`),
    );

    expect(title).toBe('this is a longer paragraph that is over fifty char');
  });

  it('should accept a length option', () => {
    const title = getSummary(
      parse(`this is a longer paragraph that is over fifty characters long. it goes on and on and on`),
      {
        length: 4,
      },
    );

    expect(title).toBe('this');
  });

  it('should return undefined if no frontmatter summary and no paragraphs', () => {
    const title = getSummary(parse(`## Hello`));
    expect(title).toBe(undefined);
  });
});
