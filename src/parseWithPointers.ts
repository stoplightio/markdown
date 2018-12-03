import { Processor } from 'unified';
import { safeStringify } from '@stoplight/json/safeStringify';
import { parseWithPointers as parseJsonWithPointers } from '@stoplight/json/parseWithPointers';
import { IParserResult } from '@stoplight/types';
import { ParseOpts } from 'remark-parse';

import { parse } from './parse';

export const parseWithPointers = <T>(value: string, opts?: ParseOpts, processor?: Processor): IParserResult<T> => {
  return parseJsonWithPointers(safeStringify(parse(value, opts, processor)));
};

/** END parseWithPointers.ts */
