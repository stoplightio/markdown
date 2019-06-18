import * as Unist from 'unist';

const { select } = require('unist-util-select');
const toString = require('mdast-util-to-string');

import { Frontmatter } from '../frontmatter';

// Priority: yaml title, then first heading
export const getTitle = (data?: Unist.Node) => {
  let title: string | void | undefined;

  if (data) {
    try {
      const frontmatter = new Frontmatter(data, true);
      title = frontmatter.get('title');

      if (!title) {
        const heading = select('heading', data);
        if (heading) {
          title = toString(heading);
        }
      }
    } catch (e) {
      console.warn('Error getting title from markdown document', e);
    }
  }

  return title;
};
