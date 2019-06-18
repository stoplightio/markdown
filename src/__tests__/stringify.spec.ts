import fs = require('fs');
import path = require('path');
import { stringify } from '../stringify';

describe('stringify', () => {
  it('should work', () => {
    expect(
      stringify(JSON.parse(fs.readFileSync(path.resolve(__dirname, './fixtures/simple.json'), 'utf-8'))),
    ).toMatchSnapshot();
  });

  it('should work when called multiple times in a row', () => {
    // This tests to make sure the processor isn't frozen: https://github.com/unifiedjs/unified/blob/7ee2c8f563f0ebe330cd76496be9ba405a1cd023/readme.md#processorfreeze

    const json = JSON.parse(fs.readFileSync(path.resolve(__dirname, './fixtures/simple.json'), 'utf-8'));

    expect(stringify(json)).toBe(stringify(json));
  });
});
