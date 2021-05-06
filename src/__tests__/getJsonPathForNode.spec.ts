import * as fs from 'fs';
import { join } from 'path';

import { IParagraph, IStrong } from '../ast-types/mdast';
import { getJsonPathForNode } from '../getJsonPathForNode';
import { parseWithPointers } from '../parseWithPointers';

const FIXTURES_DIR = join(__dirname, '../reader/__tests__/fixtures/markdown/');

const basic = fs.readFileSync(join(FIXTURES_DIR, 'basic.md'), 'utf-8');

describe('getJsonPathForNode', () => {
  describe('basic fixture', () => {
    const result = parseWithPointers(basic);

    it('generates correct json path for heading', () => {
      expect(getJsonPathForNode(result.data, result.data.children[0])).toEqual(['children', 0]);
    });

    it('generates correct json path for strong node in paragraph', () => {
      expect(getJsonPathForNode(result.data, (result.data.children[1] as IParagraph).children[3])).toEqual([
        'children',
        1,
        'children',
        3,
      ]);
    });

    it('generates correct json path for nested emphasis node', () => {
      expect(
        getJsonPathForNode(result.data, ((result.data.children[1] as IParagraph).children[7] as IStrong).children[1]),
      ).toEqual(['children', 1, 'children', 7, 'children', 1]);
    });
  });
});
