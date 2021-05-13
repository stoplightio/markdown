import * as _ from 'lodash';

import { MDAST } from '../ast-types';
import { getProperty } from './get-property';

const { truncate } = _;

export interface IGetSummaryOpts {
  truncate?: number;
}

// Priority: yaml summary, then first paragraph
export const getSummary = (data?: MDAST.Root, opts: IGetSummaryOpts = {}) => {
  let summary = getProperty('summary', 'paragraph', data);

  if (summary && opts.truncate) {
    // +3 to account for ellipsis
    summary = truncate(summary, { length: opts.truncate + 3 });
  }

  return summary;
};
