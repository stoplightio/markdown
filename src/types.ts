import { IParserResult } from '@stoplight/types';

import { MDAST } from './ast-types';

export type MarkdownParserResult = IParserResult<MDAST.Root, MDAST.Root>;
