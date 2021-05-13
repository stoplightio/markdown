import { GetLocationForJsonPath, JsonPath } from '@stoplight/types';
import * as _ from 'lodash';

import { MDAST } from './ast-types';
import { MarkdownParserResult } from './types';

const { get: _get } = _;

export const getLocationForJsonPath: GetLocationForJsonPath<MarkdownParserResult> = ({ ast }, path: JsonPath) => {
  const data = path.length === 0 ? ast : (_get(ast, path) as MDAST.Content | undefined);
  if (data === void 0) return;

  return {
    range: {
      start: {
        character: data.position!.start.column - 1,
        line: data.position!.start.line - 1,
      },
      end: {
        character: data.position!.end.column - 1,
        line: data.position!.end.line - 1,
      },
    },
  };
};
