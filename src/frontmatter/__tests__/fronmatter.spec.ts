import * as fs from 'fs';
import { join } from 'path';
import * as Unist from 'unist';

import { parseWithPointers } from '../../parseWithPointers';
import { stringify } from '../../stringify';
import { Frontmatter } from '../frontmatter';

const FIXTURES_DIR = join(__dirname, './fixtures');

const tags = fs.readFileSync(join(FIXTURES_DIR, 'tags.md'), 'utf-8');

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

  describe('tags fixture', () => {
    it('should get all properties', () => {
      const instance = new Frontmatter(tags);

      expect(instance.getAll()).toEqual({
        tags: ['introductions', 'guides'],
        title: 'Graphite Introduction',
      });
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

      it('should shift lines if applicable', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.set('new', ['foo']);

        expect(parsed.ast).toEqual({
          children: [
            expect.objectContaining({
              position: expect.objectContaining({
                end: expect.objectContaining({ column: 4, line: 5 }),
                start: expect.objectContaining({ column: 1, line: 1 }),
              }),
              type: 'yaml',
              value: 'title: Graphite Introduction\ntags: [introductions, guides]\nnew: [foo]',
            }),
            expect.objectContaining({
              children: [
                expect.objectContaining({
                  position: expect.objectContaining({
                    end: expect.objectContaining({ column: 15, line: 7 }),
                    start: expect.objectContaining({ column: 3, line: 7 }),
                  }),
                  type: 'text',
                  value: 'Introduction',
                }),
              ],
              type: 'heading',
              position: expect.objectContaining({
                end: expect.objectContaining({
                  column: 15,
                  line: 7,
                }),
                start: expect.objectContaining({ column: 1, line: 7 }),
              }),
            }),
            expect.objectContaining({
              children: [
                expect.objectContaining({
                  position: expect.objectContaining({
                    end: expect.objectContaining({ column: 8, line: 9 }),
                    start: expect.objectContaining({ column: 1, line: 9 }),
                  }),
                  type: 'text',
                  value: 'Coolio.',
                }),
              ],
              type: 'paragraph',
              position: expect.objectContaining({
                end: expect.objectContaining({ column: 8, line: 9 }),
                start: expect.objectContaining({ column: 1, line: 9 }),
              }),
            }),
          ],
          position: expect.objectContaining({
            end: expect.objectContaining({ column: 1, line: 10 }),
            start: expect.objectContaining({ column: 1, line: 1 }),
          }),
          type: 'root',
        });
      });

      it('should add new properties', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.set('new item', 2);

        expect(parsed.ast.children[0]!.value).toEqual(
          'title: Graphite Introduction\ntags: [introductions, guides]\nnew item: 2'
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

      it('should shift lines', () => {
        const parsed = parseWithPointers(tags);
        const instance = new Frontmatter(parsed.ast, true);

        instance.unset('tags');

        expect(parsed.ast).toEqual({
          children: [
            expect.objectContaining({
              position: expect.objectContaining({
                end: expect.objectContaining({ column: 4, line: 3 }),
                start: expect.objectContaining({ column: 1, line: 1 }),
              }),
              type: 'yaml',
              value: 'title: Graphite Introduction',
            }),
            expect.objectContaining({
              children: [
                expect.objectContaining({
                  position: expect.objectContaining({
                    end: expect.objectContaining({ column: 15, line: 5 }),
                    start: expect.objectContaining({ column: 3, line: 5 }),
                  }),
                  type: 'text',
                  value: 'Introduction',
                }),
              ],
              type: 'heading',
              position: expect.objectContaining({
                end: expect.objectContaining({
                  column: 15,
                  line: 5,
                }),
                start: expect.objectContaining({ column: 1, line: 5 }),
              }),
            }),
            expect.objectContaining({
              children: [
                expect.objectContaining({
                  position: expect.objectContaining({
                    end: expect.objectContaining({ column: 8, line: 7 }),
                    start: expect.objectContaining({ column: 1, line: 7 }),
                  }),
                  type: 'text',
                  value: 'Coolio.',
                }),
              ],
              type: 'paragraph',
              position: expect.objectContaining({
                end: expect.objectContaining({ column: 8, line: 7 }),
                start: expect.objectContaining({ column: 1, line: 7 }),
              }),
            }),
          ],
          position: expect.objectContaining({
            end: expect.objectContaining({ column: 1, line: 8 }),
            start: expect.objectContaining({ column: 1, line: 1 }),
          }),
          type: 'root',
        });
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
});
