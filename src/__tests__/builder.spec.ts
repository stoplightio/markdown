import * as fs from 'fs';
import * as path from 'path';

import { Builder } from '../builder';

describe('Builder', () => {
  describe('chaining', () => {
    it('allows chaining', () => {
      expect(new Builder().addMarkdown('# Hello World').toString()).toEqual('# Hello World\n');
    });
  });

  describe('#addMarkdown', () => {
    it('takes any markdown, parses it and attaches to the root node', () => {
      const b = new Builder();
      const markdown = '**foo**\n\nwooo';
      b.addMarkdown(markdown);
      expect(b.toString()).toEqual(`${markdown}\n`);
    });

    it('correctly parses stoplight markdown tabs', () => {
      expect(
        new Builder().addMarkdown(fs.readFileSync(path.resolve(__dirname, './__fixtures__/tabs/raw.md'), 'utf-8')).root,
      ).toEqual(JSON.parse(fs.readFileSync(path.resolve(__dirname, './__fixtures__/tabs/root.json'), 'utf-8')));
    });

    it('correctly parses stoplight flavored markdown', () => {
      expect(
        new Builder().addMarkdown(fs.readFileSync(path.resolve(__dirname, './__fixtures__/smd/raw.md'), 'utf-8')).root,
      ).toEqual(JSON.parse(fs.readFileSync(path.resolve(__dirname, './__fixtures__/smd/root.json'), 'utf-8')));
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
