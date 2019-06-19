import { parse } from '../../parse';
import { getTags } from '../get-tags';

describe('get-tags', () => {
  it('should return frontmatter tags if present', () => {
    const tags = getTags(
      parse(`---
tags: [t1, t2]
---

# Other Title

Yo
`),
    );

    expect(tags).toEqual(['t1', 't2']);
  });

  it('should remove nil tags', () => {
    const tags = getTags(
      parse(`---
tags: [t1, undefined]
---`),
    );

    expect(tags).toEqual(['t1']);
  });

  it('should not fail if tags is undefined', () => {
    const tags = getTags(
      parse(`---
tags: undefined
---`),
    );

    expect(tags).toEqual([]);
  });

  it('should not fail if tags is null', () => {
    const tags = getTags(
      parse(`---
tags: null
---`),
    );

    expect(tags).toEqual([]);
  });
});
