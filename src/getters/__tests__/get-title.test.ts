import { parse } from '../../parse';
import { getTitle } from '../get-title';

const titleInFrontMatter = `---
title: hello
---

# Other Title

Yo
`;

const titleInH1 = `---
summary: what it is about
---

# Other Title

Yo
`;

const titleInUnderlineH1 = `---
summary: what it is about
---

Other Title
===========

Yo
`;

const titleInH2 = `what it is about

## Other Title 2

Yo
`;

const noTitle = `what it is about`;

describe('get-title', () => {
  describe('parsed', () => {
    it('should return frontmatter title if present', () => {
      const title = getTitle(parse(titleInFrontMatter));

      expect(title).toBe('hello');
    });

    it('should return # heading if present', () => {
      const title = getTitle(parse(titleInH1));

      expect(title).toBe('Other Title');
    });

    it('should return underlined heading if present', () => {
      const title = getTitle(parse(titleInUnderlineH1));

      expect(title).toBe('Other Title');
    });

    it('should return headings other than h1 if present', () => {
      const title = getTitle(parse(titleInH2));

      expect(title).toBe('Other Title 2');
    });

    it('should return undefined if no frontmatter title and no headings', () => {
      const title = getTitle(parse(noTitle));
      expect(title).toBe(undefined);
    });
  });

  describe('raw string', () => {
    it('should return frontmatter title if present', () => {
      const title = getTitle(titleInFrontMatter);

      expect(title).toBe('hello');
    });

    it('should return # heading if present', () => {
      const title = getTitle(titleInH1);

      expect(title).toBe('Other Title');
    });

    it('should not detect underlined headings, sorry not sorry', () => {
      const title = getTitle(titleInUnderlineH1);

      expect(title).toBe(undefined);
    });

    it('should return headings other than h1 if present', () => {
      const title = getTitle(titleInH2);

      expect(title).toBe('Other Title 2');
    });

    it('should return undefined if no frontmatter title and no headings', () => {
      const title = getTitle(noTitle);
      expect(title).toBe(undefined);
    });
  });
});
