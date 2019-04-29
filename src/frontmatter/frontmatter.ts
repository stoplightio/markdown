import * as yaml from 'js-yaml';
import _get = require('lodash/get');
import _pullAt = require('lodash/pullAt');
import _set = require('lodash/set');
import _toPath = require('lodash/toPath');
import _unset = require('lodash/unset');
import * as Unist from 'unist';
import { parseWithPointers } from '../parseWithPointers';
import { stringify } from '../stringify';
import { MarkdownParserResult } from '../types';
import { IFrontmatter, PropertyPath } from './types';
import { countNewLines, shiftLines } from './utils';

export class Frontmatter<T extends object = any> implements IFrontmatter<T> {
  private readonly document: MarkdownParserResult;
  private readonly node: Unist.Literal | null;
  private readonly root: Unist.Parent;
  private readonly properties: T | null;

  constructor(data: MarkdownParserResult | string) {
    this.document = typeof data === 'string' ? parseWithPointers(data) : data;

    const root = this.document.ast;
    if (root.type !== 'root') {
      throw new TypeError('Malformed yaml was provided');
    }

    this.root = root;
    this.node =
      root.children.length > 0 && root.children[0].type === 'yaml' ? (root.children[0] as Unist.Literal) : null;

    this.properties = this.node !== null ? yaml.safeLoad(String(this.node.value)) : null;
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

  public getAll(): T | void {
    if (this.properties !== null) {
      return this.properties;
    }
  }

  public get<V = unknown>(prop: PropertyPath): V | void {
    if (this.properties !== null) {
      return _get(this.properties, prop);
    }
  }

  public set(prop: PropertyPath, value: unknown) {
    if (this.properties !== null) {
      _set(this.properties, prop, value);
      this.updateDocument();
    }
  }

  public unset(prop: PropertyPath) {
    if (this.properties !== null) {
      const path = _toPath(prop);
      const lastSegment = Number(path[path.length - 1]);
      if (!Number.isNaN(lastSegment)) {
        const baseObj = path.length > 1 ? this.get(path.slice(0, path.length - 1)) : this.getAll();
        if (!Array.isArray(baseObj) || baseObj.length < lastSegment) return;
        _pullAt(baseObj, lastSegment);
      } else {
        _unset(this.properties, prop);
      }

      this.updateDocument();
    }
  }

  public stringify() {
    return stringify(this.root);
  }
}
