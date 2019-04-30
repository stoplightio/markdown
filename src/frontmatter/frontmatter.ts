import * as yaml from 'js-yaml';
import { get, pullAt, set, toPath, unset } from 'lodash';
import * as Unist from 'unist';

import { parseWithPointers } from '../parseWithPointers';
import { stringify } from '../stringify';
import { IFrontmatter, PropertyPath } from './types';

import { countNewLines, shiftLines } from './utils';

export class Frontmatter<T extends object = any> implements IFrontmatter<T> {
  private readonly node: Unist.Literal | null;
  private readonly root: Unist.Parent;
  private readonly properties: T | null;

  constructor(data: Unist.Parent | string) {
    const root = typeof data === 'string' ? parseWithPointers(data).data : data;
    if (root.type !== 'root') {
      throw new TypeError('Malformed yaml was provided');
    }

    this.root = root;
    this.node =
      root.children.length > 0 && root.children[0].type === 'yaml' ? (root.children[0] as Unist.Literal) : null;

    this.properties = this.node !== null ? yaml.safeLoad(String(this.node.value)) : null;
  }

  public getAll(): T | void {
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
    if (this.properties !== null) {
      set(this.properties, prop, value);
      this.updateDocument();
    }
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
    const oldValue = this.node!.value;

    this.node!.value = yaml
      .safeDump(this.properties, {
        flowLevel: 1,
        indent: 2,
      })
      .trim();

    const diff = countNewLines(this.node!.value as string) - countNewLines(oldValue as string);

    if (diff !== 0) {
      shiftLines(this.root, diff);
    }
  }
}
