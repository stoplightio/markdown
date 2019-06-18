import { truncate } from 'lodash';
import * as Unist from 'unist';

const { select } = require('unist-util-select');
const toString = require('mdast-util-to-string');

import { Frontmatter } from '../frontmatter';

export interface IGetSummaryOpts {
  truncate?: number;
}

// Priority: yaml title, then first heading
export const getSummary = (data?: Unist.Node, opts: IGetSummaryOpts = {}) => {
  let summary: string | void | undefined;

  if (data) {
    try {
      const frontmatter = new Frontmatter(data, true);
      summary = frontmatter.get('summary');

      if (!summary) {
        const paragraph = select('paragraph', data);
        if (paragraph) {
          summary = toString(paragraph);
        }
      }
    } catch (e) {
      console.warn('Error getting summary from markdown document', e);
    }
  }

  if (summary && opts.truncate) {
    // +3 to account for ellipsis
    summary = truncate(summary, { length: opts.truncate + 3 });
  }

  return summary;
};
