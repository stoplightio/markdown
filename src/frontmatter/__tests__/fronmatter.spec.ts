import * as fs from 'fs';
import { join } from 'path';
import * as Unist from 'unist';
import { parseWithPointers } from '../../parseWithPointers';
import { stringify } from '../../stringify';
import { Frontmatter } from '../frontmatter';

const FIXTURES_DIR = join(__dirname, './fixtures');

const tags = fs.readFileSync(join(FIXTURES_DIR, 'tags.md'), 'utf-8');

describe('Frontmatter', () => {
  it('should throw when invalid ast is provided', () => {
    const node: Unist.Parent = {
      type: 'paragraph',
      value: '',
      children: [],
    };

    expect(() => new Frontmatter({ ast: node } as any)).toThrow();
  });

  describe('invalid fixture', () => {
    const fixture = '**welcome**\n~test~\n';
    it('should return undefined when trying to access properties', () => {
      const instance = new Frontmatter(fixture);

      expect(instance.getAll()).toBeUndefined();
      expect(instance.get('test')).toBeUndefined();
    });

    it('should do nothing when trying to modify the content', () => {
      const instance = new Frontmatter(fixture);

      instance.set('test', 23);
      instance.set('foo', 123);
      expect(instance.stringify()).toEqual(fixture);
      instance.unset('foo');
      expect(instance.stringify()).toEqual(fixture);
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

    it('should get value for single item', () => {
      const instance = new Frontmatter(tags);

      expect(instance.get('title')).toEqual('Graphite Introduction');
      expect(instance.get('tags')).toEqual(['introductions', 'guides']);
    });

    describe('#set', () => {
      it('should update properties', () => {
        const instance = new Frontmatter(tags);

        instance.set('tags', ['foo']);

        expect(instance.get('tags')).toEqual(['foo']);
      });

      it('should update ast', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed);

        instance.set('tags', ['foo']);

        expect(parsed.ast.children[0]!.value).toEqual('title: Graphite Introduction\ntags: [foo]'); // should be quoted?
      });

      it('document should be serializable', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed);

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
        const instance = new Frontmatter(tags);

        instance.unset('tags');

        expect(instance.getAll()).not.toHaveProperty('tags');
      });

      it('should update ast', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed);

        instance.unset('tags');

        expect(parsed.ast.children[0]!.value).toEqual('title: Graphite Introduction');
      });

      it('document should be serializable', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed);

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
});
