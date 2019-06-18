import * as Unist from 'unist';

const { select } = require('unist-util-select');
const toString = require('mdast-util-to-string');

import { Frontmatter } from '../frontmatter';

export interface IGetSummaryOpts {
  length?: number;
}

// Priority: yaml title, then first heading
export const getSummary = (data?: Unist.Node, opts: IGetSummaryOpts = {}) => {
  const length = opts.length || 150;

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

  if (summary) {
    summary = summary.slice(0, length);
  }

  return summary;
};
