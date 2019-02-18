import { IBlockquote as MdastBlockquote } from '../mdast';

import { IAnnotations } from './annotations';

export interface IBlockquote extends MdastBlockquote {
  annotations?: IAnnotations;
}
