import { parse } from '../../parse';
import { getTitle } from '../get-title';

describe('get-title', () => {
  it('should return frontmatter title if present', () => {
    const title = getTitle(
      parse(`---
title: hello
---

# Other Title

Yo
`),
    );

    expect(title).toBe('hello');
  });

  it('should return heading if present', () => {
    const title = getTitle(
      parse(`---
summary: what it is about
---

# Other Title

Yo
`),
    );

    expect(title).toBe('Other Title');
  });

  it('should return headings other than h1 if present', () => {
    const title = getTitle(
      parse(`what it is about

## Other Title 2

Yo
`),
    );

    expect(title).toBe('Other Title 2');
  });

  it('should return undefined if no frontmatter title and no headings', () => {
    const title = getTitle(parse(`what it is about`));
    expect(title).toBe(undefined);
  });
});
