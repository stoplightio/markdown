import { Optional } from '@stoplight/types';
import * as yaml from 'js-yaml';
import { get, pullAt, set, toPath, unset } from 'lodash';
import * as Unist from 'unist';
const fence = require('remark-frontmatter/lib/fence');
const matters = require('remark-frontmatter/lib/matters');

import { FRONTMATTER_SETTINGS } from '../consts';
import { parseWithPointers } from '../parseWithPointers';
import { stringify } from '../stringify';
import { IFrontmatter, PropertyPath } from './types';

const safeParse = (value: string) => {
  try {
    return yaml.safeLoad(String(value));
  } catch {
    return {};
  }
};

export class Frontmatter<T extends object = any> implements IFrontmatter<T> {
  public readonly document: Unist.Node;
  private readonly node: Unist.Literal;
  private properties: Partial<T> | null;

  constructor(data: Unist.Node | string, mutate = false) {
    const root =
      typeof data === 'string' ? parseWithPointers(data).data : mutate ? data : JSON.parse(JSON.stringify(data));
    if (root.type !== 'root') {
      throw new TypeError('Malformed yaml was provided');
    }

    this.document = root;
    if (root.children.length > 0 && root.children[0].type === 'yaml') {
      this.node = root.children[0] as Unist.Literal;
      this.properties = safeParse(this.node.value as string);
    } else {
      this.node = {
        type: 'yaml',
        value: '',
      };
      this.properties = null;
    }
  }

  public get isEmpty() {
    for (const _ in this.properties) {
      if (Object.hasOwnProperty.call(this.properties, _)) {
        return false;
      }
    }

    return true;
  }

  public getAll(): Partial<T> | void {
    if (this.properties !== null) {
      return this.properties;
    }
  }

  public get<V = unknown>(prop: PropertyPath): V | void {
    if (this.properties !== null) {
      return get(this.properties, prop);
    }
  }

  public set(prop: PropertyPath, value: unknown) {
    if (this.properties === null) {
      this.properties = {};
    }

    set(this.properties, prop, value);
    this.updateDocument();
  }

  public unset(prop: PropertyPath) {
    if (this.properties !== null) {
      const path = toPath(prop);
      const lastSegment = Number(path[path.length - 1]);
      if (!Number.isNaN(lastSegment)) {
        const baseObj = path.length > 1 ? this.get(path.slice(0, path.length - 1)) : this.getAll();
        if (Array.isArray(baseObj)) {
          if (baseObj.length < lastSegment) return;
          pullAt(baseObj, lastSegment);
        } else {
          unset(this.properties, prop);
        }
      } else {
        unset(this.properties, prop);
      }

      this.updateDocument();
    }
  }

  public stringify() {
    return stringify(this.document);
  }

  // based on https://github.com/remarkjs/remark-frontmatter/blob/3c18752b01af683d94641e47bd79581690a995b7/lib/parse.js
  public static getFrontmatterBlock(value: string): Optional<string> {
    const [matter] = matters(FRONTMATTER_SETTINGS);
    const open = fence(matter, 'open');
    const close = fence(matter, 'close');
    const newline = '\n';

    let index = open.length;

    if (value.slice(0, index) !== open || value.charAt(index) !== newline) {
      return;
    }

    let offset = value.indexOf(close, index);

    while (offset !== -1 && value.charAt(offset - 1) !== newline) {
      index = offset + close.length;
      offset = value.indexOf(close, index);
    }

    if (offset !== -1) {
      return value.slice(0, offset + close.length);
    }

    return;
  }

  private updateDocument() {
    const children = this.document.children as Unist.Parent['children'] | undefined;
    if (!children) return;

    const index = children.indexOf(this.node);

    this.node.value = this.isEmpty
      ? ''
      : yaml
          .safeDump(this.properties, {
            flowLevel: 1,
            indent: 2,
          })
          .trim();

    if (this.isEmpty) {
      if (index !== -1) {
        children.splice(index, 1);
      }
    } else if (index === -1) {
      children.unshift(this.node);
    }
  }
}
