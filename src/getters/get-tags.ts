import * as Unist from 'unist';

import { Frontmatter } from '../frontmatter';

// Priority: yaml tags
export const getTags = (data?: Unist.Node): string[] => {
  const tags: string[] = [];

  if (data) {
    try {
      const frontmatter = new Frontmatter(data, true);
      const dataTags = frontmatter.get('tags');

      if (dataTags && Array.isArray(dataTags)) {
        return dataTags.reduce<string[]>((filteredTags, tag) => {
          if (tag && typeof tag === 'string' && tag !== 'undefined' && tag !== 'null') {
            filteredTags.push(String(tag));
          }

          return filteredTags;
        }, []);
      }
    } catch (e) {
      console.warn('Error getting tags from markdown document', e);
    }
  }

  return tags;
};
