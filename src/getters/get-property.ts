import * as Unist from 'unist';

const { select } = require('unist-util-select');
const toString = require('mdast-util-to-string');

import { Frontmatter } from '../frontmatter';

// Priority: yaml title, then first heading
export const getProperty = (propName: string, element?: string, data?: Unist.Node) => {
  let target: string | void | undefined;

  if (data) {
    try {
      const frontmatter = new Frontmatter(data, true);
      target = frontmatter.get(propName);

      if (element && !target) {
        const elem = select(element, data);
        if (elem) {
          target = toString(elem);
        }
      }
    } catch (e) {
      console.warn(`Error getting ${propName} from markdown document`, e);
    }
  }

  return target;
};
