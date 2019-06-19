import { truncate } from 'lodash';
import * as Unist from 'unist';

import { getProperty } from './get-property';

export interface IGetSummaryOpts {
  truncate?: number;
}

// Priority: yaml summary, then first paragraph
export const getSummary = (data?: Unist.Node, opts: IGetSummaryOpts = {}) => {
  let summary = getProperty('summary', 'paragraph', data);

  if (summary && opts.truncate) {
    // +3 to account for ellipsis
    summary = truncate(summary, { length: opts.truncate + 3 });
  }

  return summary;
};
