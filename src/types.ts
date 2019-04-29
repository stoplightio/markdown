import { IParserResult } from '@stoplight/types';
import * as Unist from 'unist';

export type MarkdownParserResult = IParserResult<Unist.Parent, Unist.Parent>;
