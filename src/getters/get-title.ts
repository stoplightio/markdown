import { MDAST } from '../ast-types';
import { getProperty } from './get-property';

// Priority: yaml title, then first heading
export const getTitle = (data?: MDAST.Root) => {
  return getProperty('title', 'heading', data);
};
