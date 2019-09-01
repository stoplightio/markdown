import * as fs from 'fs';
import { join } from 'path';
import { getLocationForJsonPath } from '../getLocationForJsonPath';
import { parseWithPointers } from '../parseWithPointers';

const FIXTURES_DIR = join(__dirname, '../reader/__tests__/fixtures/markdown/');

const basic = fs.readFileSync(join(FIXTURES_DIR, 'basic.md'), 'utf-8');
const list = fs.readFileSync(join(FIXTURES_DIR, 'list.md'), 'utf-8');

describe('getLocationForJsonPath', () => {
  describe('basic fixture', () => {
    const result = parseWithPointers(basic);

    it.each`
      start      | end         | path
      ${[0, 0]}  | ${[21, 0]}  | ${[]}
      ${[0, 0]}  | ${[0, 10]}  | ${['children', 0]}
      ${[2, 0]}  | ${[2, 31]}  | ${['children', 1, 'children', 0]}
      ${[2, 32]} | ${[2, 40]}  | ${['children', 1, 'children', 1, 'children', 0]}
      ${[2, 59]} | ${[2, 66]}  | ${['children', 1, 'children', 5, 'children', 0]}
      ${[2, 88]} | ${[2, 100]} | ${['children', 1, 'children', 7, 'children', 1]}
      ${[2, 89]} | ${[2, 99]}  | ${['children', 1, 'children', 7, 'children', 1, 'children', 0]}
      ${[2, 91]} | ${[2, 97]}  | ${['children', 1, 'children', 7, 'children', 1, 'children', 0, 'children', 0]}
      ${[4, 0]}  | ${[4, 25]}  | ${['children', 2]}
      ${[4, 2]}  | ${[4, 25]}  | ${['children', 2, 'children', 0, 'children', 0]}
      ${[6, 0]}  | ${[8, 3]}   | ${['children', 3]}
      ${[10, 0]} | ${[10, 29]} | ${['children', 4, 'children', 0]}
      ${[18, 0]} | ${[18, 5]}  | ${['children', 8]}
    `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
      expect(getLocationForJsonPath(result, path)).toEqual({
        range: {
          start: {
            character: start[1],
            line: start[0],
          },
          end: {
            character: end[1],
            line: end[0],
          },
        },
      });
    });
  });

  describe('list fixture', () => {
    const result = parseWithPointers(list);

    it.each`
      start      | end         | path
      ${[10, 0]} | ${[10, 13]} | ${['children', 5, 'children', 0]}
      ${[64, 3]} | ${[66, 8]}  | ${['children', 18, 'children', 1, 'children', 1]}
      ${[65, 3]} | ${[65, 8]}  | ${['children', 18, 'children', 1, 'children', 1, 'children', 1]}
    `('should return proper location for given JSONPath $path', ({ start, end, path }) => {
      expect(getLocationForJsonPath(result, path)).toEqual({
        range: {
          start: {
            character: start[1],
            line: start[0],
          },
          end: {
            character: end[1],
            line: end[0],
          },
        },
      });
    });
  });
});
