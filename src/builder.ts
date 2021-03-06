import { MDAST } from './ast-types';
import { Reader } from './reader';
import { stringify } from './stringify';

export class Builder {
  public root: MDAST.Root;

  constructor(public reader = new Reader()) {
    this.root = {
      type: 'root',
      children: [],
    };
  }

  public addMarkdown(markdown: string) {
    this.root.children.push(...this.reader.fromLang(markdown).children);

    return this;
  }

  public addChild(node: MDAST.Content) {
    this.root.children.push(node);

    return this;
  }

  public toString() {
    return stringify(this.root);
  }
}
