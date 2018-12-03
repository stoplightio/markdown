import { parseWithPointers } from '../parseWithPointers';

describe('parseWithPointers', () => {
  test('should parse simple', () => {
    expect(parseWithPointers('**simple**')).toMatchSnapshot();
  });
});
