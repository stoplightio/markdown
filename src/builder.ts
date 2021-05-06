import * as Unist from 'unist';

import { IRoot } from './ast-types/mdast';
import { Reader } from './reader';
import { stringify } from './stringify';

export class Builder {
  public root: IRoot;

  constructor(public reader = new Reader()) {
    this.root = {
      type: 'root',
      children: [],
    };
  }

  public addMarkdown(markdown: string) {
    this.root.children.push(...this.reader.toSpec(this.reader.fromLang(markdown)).children);

    return this;
  }

  public addChild(node: Unist.Node) {
    this.root.children.push(node);

    return this;
  }

  public toString() {
    return stringify(this.reader.fromSpec(this.root));
  }
}
