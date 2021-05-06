import { DiagnosticSeverity, IDiagnostic, Optional } from '@stoplight/types';
import { parseWithPointers as parseYaml, safeStringify } from '@stoplight/yaml';
import { get, pullAt, set, toPath, unset } from 'lodash';

import { MDAST } from '../ast-types';
import { parseWithPointers } from '../parseWithPointers';
import { stringify } from '../stringify';
import { IFrontmatter, PropertyPath } from './types';

const isError = ({ severity }: IDiagnostic) => severity === DiagnosticSeverity.Error;

const safeParse = <T>(value: string): T | {} => {
  try {
    const { data, diagnostics } = parseYaml<T>(String(value));

    if (data === void 0 || (diagnostics.length > 0 && diagnostics.some(isError))) {
      return {};
    }

    return data;
  } catch {
    return {};
  }
};

export class Frontmatter<T extends object = any> implements IFrontmatter<T> {
  public readonly document: MDAST.Node;
  private readonly node: MDAST.Literal;
  private properties: Partial<T> | null;

  constructor(data: MDAST.Node | string, mutate = false) {
    const root =
      typeof data === 'string' ? parseWithPointers(data).data : mutate ? data : JSON.parse(JSON.stringify(data));
    if (root.type !== 'root') {
      throw new TypeError('Malformed yaml was provided');
    }

    this.document = root;
    if (root.children.length > 0 && root.children[0].type === 'yaml') {
      this.node = root.children[0] as MDAST.Literal;
      // typings are a bit tricked, but let's move the burden of validation to consumer
      this.properties = safeParse<Partial<T>>(this.node.value as string);
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

  public static getFrontmatterBlock(value: string): Optional<string> {
    const match = value.match(/^(\s*\n)?---(?:.|[\n\r\u2028\u2029])*?\n---/);
    return match === null ? void 0 : match[0];
  }

  private updateDocument() {
    const children = this.document.children as MDAST.Parent['children'] | undefined;
    if (!children) return;

    const index = children.indexOf(this.node);

    this.node.value = this.isEmpty
      ? ''
      : safeStringify(this.properties, {
          flowLevel: 1,
          indent: 2,
        }).trim();

    if (this.isEmpty) {
      if (index !== -1) {
        children.splice(index, 1);
      }
    } else if (index === -1) {
      children.unshift(this.node);
    }
  }
}
