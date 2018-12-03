import { Processor } from 'unified';
import { IParserResult } from '@stoplight/types';
import { ParseOpts } from 'remark-parse';

import { parse } from './parse';

export const parseWithPointers = <T>(value: string, opts?: ParseOpts, processor?: Processor): IParserResult<T> => {
  return {
    data: parse(value, opts, processor),
    pointers: {}, // todo: implement actual functionality
    validations: [],
  };
};
