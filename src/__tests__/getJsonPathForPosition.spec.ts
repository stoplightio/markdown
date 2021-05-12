import * as fs from 'fs';
import { join } from 'path';

import { getJsonPathForPosition } from '../getJsonPathForPosition';
import { parseWithPointers } from '../parseWithPointers';

const FIXTURES_DIR = join(__dirname, '../reader/__tests__/fixtures/markdown/');

const basic = fs.readFileSync(join(FIXTURES_DIR, 'basic.md'), 'utf-8');
const list = fs.readFileSync(join(FIXTURES_DIR, 'list.md'), 'utf-8');

describe('getJsonPathForPosition', () => {
  describe('basic fixture', () => {
    const result = parseWithPointers(basic);

    it.each`
      line  | character | path
      ${0}  | ${0}      | ${['children', 0]}
      ${2}  | ${18}     | ${['children', 1, 'children', 0]}
      ${2}  | ${37}     | ${['children', 1, 'children', 1, 'children', 0]}
      ${2}  | ${64}     | ${['children', 1, 'children', 5, 'children', 0]}
      ${2}  | ${88}     | ${['children', 1, 'children', 7, 'children', 1]}
      ${2}  | ${89}     | ${['children', 1, 'children', 7, 'children', 1, 'children', 0]}
      ${2}  | ${93}     | ${['children', 1, 'children', 7, 'children', 1, 'children', 0, 'children', 0]}
      ${4}  | ${0}      | ${['children', 2]}
      ${4}  | ${2}      | ${['children', 2, 'children', 0, 'children', 0]}
      ${6}  | ${0}      | ${['children', 3]}
      ${7}  | ${6}      | ${['children', 3]}
      ${10} | ${8}      | ${['children', 4, 'children', 0]}
      ${18} | ${3}      | ${['children', 8]}
    `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
      expect(getJsonPathForPosition(result, { line, character })).toEqual(path);
    });
  });

  describe('list fixture', () => {
    const result = parseWithPointers(list);

    it.each`
      line  | character | path
      ${10} | ${0}      | ${['children', 5, 'children', 0]}
      ${65} | ${0}      | ${['children', 18, 'children', 1, 'children', 1]}
      ${65} | ${3}      | ${['children', 18, 'children', 1, 'children', 1, 'children', 1]}
    `('should return proper json path for line $line and character $character', ({ line, character, path }) => {
      expect(getJsonPathForPosition(result, { line, character })).toEqual(path);
    });
  });
});
