import * as fs from 'fs';
import { join } from 'path';
import * as Unist from 'unist';

import { parse } from '../../parse';
import { parseWithPointers } from '../../parseWithPointers';
import { stringify } from '../../stringify';
import { Frontmatter } from '../frontmatter';

const FIXTURES_DIR = join(__dirname, './fixtures');

const tags = fs.readFileSync(join(FIXTURES_DIR, 'tags.md'), 'utf-8');
const invalid = fs.readFileSync(join(FIXTURES_DIR, 'invalid.md'), 'utf-8');

describe('Frontmatter', () => {
  it('should clone given data by default', () => {
    const parsed = parseWithPointers(tags);
    const instance = new Frontmatter(parsed.ast);

    expect(instance.document).not.toBe(parsed.ast);
  });

  it('should throw when invalid ast is provided', () => {
    const node: Unist.Parent = {
      type: 'paragraph',
      value: '',
      children: [],
    };

    expect(() => new Frontmatter(node)).toThrow();
  });

  describe('no frontmatter fixture', () => {
    const fixture = '**welcome**\n~test~\n';
    it('should return undefined when trying to access properties', () => {
      const instance = new Frontmatter(fixture);

      expect(instance.getAll()).toBeUndefined();
      expect(instance.get('test')).toBeUndefined();
    });

    it('getFrontmatterBlock should return undefined', () => {
      expect(Frontmatter.getFrontmatterBlock(fixture)).toBeUndefined();
    });

    describe('set', () => {
      it('should create frontmatter block', () => {
        const instance = new Frontmatter(fixture);

        instance.set('test', 23);
        instance.set('foo', 123);
        expect(instance.getAll()).toEqual({
          test: 23,
          foo: 123,
        });
        expect(instance.stringify()).toEqual(`---
test: 23
foo: 123
---

**welcome**
~test~
`);
      });
    });
  });

  describe('invalid fixture', () => {
    it('should return empty object', () => {
      const instance = new Frontmatter(invalid);

      expect(instance.getAll()).toEqual({});
    });

    it('getFrontmatterBlock should return block', () => {
      expect(Frontmatter.getFrontmatterBlock(invalid)).toEqual(`---
tti
tags: [Hubs]
---`);
    });

    describe('set', () => {
      it('should update frontmatter block correctly', () => {
        const instance = new Frontmatter(invalid);

        instance.set('title', 'hello!');
        instance.set('tags', ['test']);
        expect(instance.getAll()).toEqual({
          tags: ['test'],
          title: 'hello!',
        });
        expect(instance.stringify()).toEqual(`---
title: hello!
tags: [test]
---

# Hello world!
`);
      });
    });

    describe('unset', () => {
      it('should do nothing', () => {
        const instance = new Frontmatter(invalid);

        instance.unset('tit');

        expect(instance.getAll()).toEqual({});
      });
    });
  });

  describe('tags fixture', () => {
    it('should get all properties', () => {
      const instance = new Frontmatter(tags);

      expect(instance.getAll()).toEqual({
        tags: ['introductions', 'guides'],
        title: 'Graphite Introduction',
      });
    });

    it('getFrontmatterBlock should return block', () => {
      expect(Frontmatter.getFrontmatterBlock(tags)).toEqual(`---
title: Graphite Introduction
tags: ['introductions', 'guides']
---`);
    });

    describe('#get', () => {
      it('should return value for single item', () => {
        const instance = new Frontmatter(tags);

        expect(instance.get('title')).toEqual('Graphite Introduction');
        expect(instance.get('tags')).toEqual(['introductions', 'guides']);
      });

      it('should support nested properties', () => {
        const instance = new Frontmatter(tags);

        expect(instance.get(['tags', 1])).toEqual('guides');
        expect(instance.get('tags.0')).toEqual('introductions');
      });
    });

    describe('#set', () => {
      it('should update properties', () => {
        const instance = new Frontmatter(tags);

        instance.set('tags', ['foo']);

        expect(instance.get('tags')).toEqual(['foo']);
      });

      it('should update ast', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.set('tags', ['foo']);

        expect(parsed.ast.children[0]!.value).toEqual('title: Graphite Introduction\ntags: [foo]'); // should be quoted?
      });

      it('should support nested properties', () => {
        const instance = new Frontmatter(tags);
        instance.set('tags.0', 'new guides');
        instance.set(['tags', 1], 'start');

        expect(instance.get('tags')).toEqual(['new guides', 'start']);
      });

      it('should re-add previously removed block', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.unset('tags');
        instance.unset('title');

        expect(parsed.ast.children[0]!.type).toEqual('heading'); // verifies block is not there, more decent assertion is done in #unset test case

        instance.set('tags', []);

        expect(parsed.ast.children[0]!.type).toEqual('yaml');
        expect(stringify(parsed.ast)).toEqual(`---
tags: []
---

# Introduction

Coolio.
`);
      });

      it('should add new properties', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.set('new item', 2);

        expect(parsed.ast.children[0]!.value).toEqual(
          'title: Graphite Introduction\ntags: [introductions, guides]\nnew item: 2',
        );
      });

      it('document should be serializable', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.set('tags', ['foo']);

        expect(stringify(parsed.ast)).toEqual(`---
title: Graphite Introduction
tags: [foo]
---

# Introduction

Coolio.
`);
      });
    });

    describe('#unset', () => {
      it('should update properties', () => {
        const instance = new Frontmatter(tags, true);

        instance.unset('tags');

        expect(instance.getAll()).not.toHaveProperty('tags');
      });

      it('should update ast', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.unset('tags');

        expect(parsed.ast.children[0]!.value).toEqual('title: Graphite Introduction');
      });

      it('should remove block if all properties are removed', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.unset('tags');
        instance.unset('title');
        instance.unset('title');

        expect(instance.stringify()).toEqual(`# Introduction

Coolio.
`);
        expect(parsed.ast.children[0]!.type).toEqual('heading');
        expect(parsed.ast.children).toHaveLength(2);
      });

      it('should support nested properties', () => {
        const instance = new Frontmatter(tags);
        instance.unset('tags.0');

        expect(instance.get('tags')).toEqual(['guides']);
      });

      it('should handle non-existing properties gracefully', () => {
        const instance = new Frontmatter(tags);
        instance.unset('tags.3');
        instance.unset('5');
        instance.unset('foo');

        expect(instance.getAll()).toEqual(new Frontmatter(tags).getAll());
      });

      it('should do nothing if property does not exist', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.unset('test');

        expect(instance.getAll()).toEqual({
          tags: ['introductions', 'guides'],
          title: 'Graphite Introduction',
        });
      });

      it('document should be serializable', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.unset('tags');

        expect(stringify(parsed.ast)).toEqual(`---
title: Graphite Introduction
---

# Introduction

Coolio.
`);
      });
    });

    it('should expose a way to stringify existing document', () => {
      const instance = new Frontmatter(tags);
      expect(instance.stringify()).toEqual(tags);
    });
  });

  describe('getFrontmatterBlock method', () => {
    it.each(['---', '------', '---\nfoo', '--\n---', '---\na--', '\na\n---'])(
      'should return undefined for incomplete block `%s`',
      document => {
        const block = Frontmatter.getFrontmatterBlock(document);
        expect(block).toBeUndefined();
        expect(parse(document)).toEqual(
          expect.objectContaining({
            type: 'root',
            children: expect.arrayContaining([expect.not.objectContaining({ type: 'yaml' })]),
          }),
        );
      },
    );

    it.each(['---\n---', '---\nfoo\n---'])('should produce the same result for `%s`', () => {
      const document = `---\n---`;
      const block = Frontmatter.getFrontmatterBlock(document)!;

      expect(block).toEqual(document);
      expect(stringify(parse(block))).toEqual(stringify(parse(document)));
    });
  });
});
