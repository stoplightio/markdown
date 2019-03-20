import { parseWithPointers } from '../parseWithPointers';

describe('parseWithPointers', () => {
  it('should parse simple', () => {
    expect(parseWithPointers('**simple**')).toMatchSnapshot();
  });
});
