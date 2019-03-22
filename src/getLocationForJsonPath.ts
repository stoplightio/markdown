import { GetLocationForJsonPath, JsonPath } from '@stoplight/types';
import _get = require('lodash/get');
import * as Unist from 'unist';

export const getLocationForJsonPath: GetLocationForJsonPath<Unist.Node> = ({ ast }, path: JsonPath) => {
  const data = _get(ast, path) as Unist.Node | undefined;
  if (data === undefined) return;

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
