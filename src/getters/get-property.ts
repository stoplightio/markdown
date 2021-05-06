import * as Unist from 'unist';
import { select } from 'unist-util-select';

import { Frontmatter } from '../frontmatter';

const toString = require('mdast-util-to-string');

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
