import * as fs from 'fs';
import { join } from 'path';
import { parseWithPointers } from '../../parseWithPointers';
import { stringify } from '../../stringify';
import { Frontmatter } from '../frontmatter';

const FIXTURES_DIR = join(__dirname, './fixtures');

const front = fs.readFileSync(join(FIXTURES_DIR, 'front.md'), 'utf-8');

describe('Frontmatter', () => {
  describe('front.md fixture', () => {
    it('should get all properties', () => {
      const instance = new Frontmatter(front);

      expect(instance.getAll()).toEqual({
        tags: ['introductions', 'guides'],
        title: 'Graphite Introduction',
      });
    });

    describe('#get', () => {
      it('should value for single item', () => {
        const instance = new Frontmatter(front);

        expect(instance.get('tags')).toEqual(['introductions', 'guides']);
      });
    });

    describe('#set', () => {
      it('should update properties', () => {
        const instance = new Frontmatter(front);

        instance.set('tags', ['foo']);

        expect(instance.get('tags')).toEqual(['foo']);
      });

      it('should update ast', () => {
        const parsed = parseWithPointers(front);
        const instance = new Frontmatter(parsed);

        instance.set('tags', ['foo']);

        expect(parsed.ast.children[0]!.value).toEqual('title: Graphite Introduction\ntags: [foo]'); // should be quoted?
      });

      it('document should be serializable', () => {
        const parsed = parseWithPointers(front);
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
        const instance = new Frontmatter(front);

        instance.unset('tags');

        expect(instance.getAll()).not.toHaveProperty('tags');
      });

      it('should update ast', () => {
        const parsed = parseWithPointers(front);
        const instance = new Frontmatter(parsed);

        instance.unset('tags');

        expect(parsed.ast.children[0]!.value).toEqual('title: Graphite Introduction');
      });

      it('document should be serializable', () => {
        const parsed = parseWithPointers(front);
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
  });
});
