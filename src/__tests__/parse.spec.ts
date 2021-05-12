import { parse } from '../parse';

describe('parse', () => {
  it('should parse simple', () => {
    expect(parse('**simple**')).toMatchSnapshot();
  });

  it('should work when called multiple times in a row', () => {
    // This tests to make sure the processor isn't frozen: https://github.com/unifiedjs/unified/blob/7ee2c8f563f0ebe330cd76496be9ba405a1cd023/readme.md#processorfreeze

    expect(parse('**simple**')).toEqual(parse('**simple**'));
  });
});
