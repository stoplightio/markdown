import _truncate from 'lodash/truncate';

import { MDAST } from '../ast-types';
import { getProperty } from './get-property';

export interface IGetSummaryOpts {
  truncate?: number;
}

// Priority: yaml summary, then first paragraph
export const getSummary = (data?: MDAST.Root, opts: IGetSummaryOpts = {}) => {
  let summary = getProperty('summary', 'paragraph', data);

  if (summary && opts.truncate) {
    // +3 to account for ellipsis
    summary = _truncate(summary, { length: opts.truncate + 3 });
  }

  return summary;
};
