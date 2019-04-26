import * as yaml from 'js-yaml';
import * as Unist from 'unist';
import { parseWithPointers } from '../parseWithPointers';
import { stringify } from '../stringify';
import { MarkdownParserResult } from '../types';
import { IFrontmatter } from './types';

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
    this.node!.value = yaml
      .safeDump(this.properties, {
        flowLevel: 1,
        indent: 2,
      })
      .trim();

    // todo: update offsets
  }

  public getAll(): T | void {
    if (this.properties !== null) {
      return this.properties;
    }
  }

  public get(prop: keyof T): T[keyof T] | void {
    if (this.properties !== null) {
      return this.properties[prop];
    }
  }

  public set(prop: keyof T, value: T[keyof T]) {
    if (this.properties !== null) {
      this.properties[prop] = value;
      this.updateDocument();
    }
  }

  public unset(prop: keyof T) {
    if (this.properties !== null) {
      delete this.properties[prop];
      this.updateDocument();
    }
  }

  public stringify() {
    return stringify(this.root);
  }
}
