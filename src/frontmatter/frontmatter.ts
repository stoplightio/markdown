import * as yaml from 'js-yaml';
import { get, pullAt, set, toPath, unset } from 'lodash';
import * as Unist from 'unist';

import { parseWithPointers } from '../parseWithPointers';
import { stringify } from '../stringify';
import { IFrontmatter, PropertyPath } from './types';

import { countNewLines, shiftLines } from './utils';

export class Frontmatter<T extends object = any> implements IFrontmatter<T> {
  private readonly node: Unist.Literal;
  private readonly root: Unist.Parent;
  private properties: Partial<T> | null;

  constructor(data: Unist.Parent | string) {
    const root = typeof data === 'string' ? parseWithPointers(data).data : data;
    if (root.type !== 'root') {
      throw new TypeError('Malformed yaml was provided');
    }

    this.root = root;
    if (root.children.length > 0 && root.children[0].type === 'yaml') {
      this.node = root.children[0] as Unist.Literal;
      this.properties = yaml.safeLoad(String(this.node.value));
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
    return stringify(this.root);
  }

  private updateDocument() {
    const index = this.root.children.indexOf(this.node);

    const oldValue = this.node.value;
    this.node.value = yaml
      .safeDump(this.properties, {
        flowLevel: 1,
        indent: 2,
      })
      .trim();

    const diff = countNewLines(this.node.value as string) - countNewLines(oldValue as string);

    if (diff !== 0) {
      shiftLines(this.root, diff);
    }

    if (this.isEmpty) {
      if (index !== -1) {
        this.root.children.splice(index, 1);
      }
    } else if (index === -1) {
      this.root.children.unshift(this.node);
    }
  }
}
