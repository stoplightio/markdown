import { toString } from 'mdast-util-to-string';
import { select } from 'unist-util-select';

import { MDAST } from '../ast-types';
import { Frontmatter } from '../frontmatter';

// Priority: yaml title, then first heading
export const getProperty = (propName: string, element?: string, data?: MDAST.Root) => {
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
