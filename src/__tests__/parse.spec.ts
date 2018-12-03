import { parse } from '../parse';

describe('parse', () => {
  it('should parse simple', () => {
    expect(parse('**simple**')).toMatchSnapshot();
  })
});
