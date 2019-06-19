import * as Unist from 'unist';

import { getProperty } from './get-property';

// Priority: yaml title, then first heading
export const getTitle = (data?: Unist.Node) => {
  return getProperty('title', 'heading', data);
};
