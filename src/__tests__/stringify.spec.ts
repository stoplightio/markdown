import fs = require('fs');
import path = require('path');
import { stringify } from '../stringify';

describe('stringify', () => {
  it('should work', () => {
    expect(stringify(JSON.parse(fs.readFileSync(path.resolve(__dirname, './fixtures/simple.json'), 'utf-8')))).toMatchSnapshot();
  });
});
