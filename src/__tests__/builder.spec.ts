import fs = require('fs');
import path = require('path');
import { Builder } from '../builder';

describe('Builder', () => {
  describe('#addMarkdown', () => {
    it('takes any markdown, parses it and attaches to the root node', () => {
      const b = new Builder();
      const markdown = '**foo**\n\nwooo';
      b.addMarkdown(markdown);
      expect(b.toString()).toEqual(`${markdown}\n`);
    });

    it('correctly parses stoplight markdown tabs', () => {
      const b = new Builder();

      const tabsMarkdown = fs.readFileSync(path.resolve(__dirname, './__fixtures__/tabs.md'), 'utf-8');

      b.addMarkdown(tabsMarkdown);

      expect(b.toString()).toEqual(tabsMarkdown);
    });
  });

  describe('#addChild', () => {
    it('takes any Mdast child and places it under the root node', () => {
      const b = new Builder();

      const node = {
        type: 'heading',
        depth: 1,
        children: [
          {
            type: 'text',
            value: 'Foo',
          },
        ],
      };

      b.addChild(node);
      expect(b.toString()).toEqual('# Foo\n');
    });
  });
});
