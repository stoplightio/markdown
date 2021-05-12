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
