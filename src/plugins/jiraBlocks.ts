import * as remarkParse from 'remark-parse';
import * as unified from 'unified';

import { IJiraNode } from '../ast-types/mdast';

export default function (this: unified.Processor) {
  const { Compiler, Parser } = this;

  if (Compiler !== void 0) {
    Compiler.prototype.visitors.jira = compileJiraBlock;
  } else if (Parser !== void 0) {
    Parser.prototype.blockTokenizers.jira = tokenizeJiraBlock;
    Parser.prototype.interruptParagraph.push(['jira']);

    const methods = Parser.prototype.blockMethods;
    methods.splice(methods.indexOf('fencedCode') + 1, 0, 'jira');
  }
}

const blockStart = /^\[block:([A-Za-z]+)\][^\S\n]*(?=\n)/;
const blockEnd = /\[\/block\][^\S\n]*(?=\n|$)/;

function tokenizeJiraBlock(eat: remarkParse.Eat, value: string, silent: boolean) {
  const blockStartMatch = blockStart.exec(value);
  const blockEndMatch = blockEnd.exec(value); // let's naively assume block cannot be placed in any node besides content

  if (blockStartMatch !== null && blockEndMatch !== null) {
    if (silent) {
      return true;
    }

    const node: IJiraNode = {
      type: 'jira',
      code: blockStartMatch[1],
      value: value.slice(blockStartMatch[0].length + 1, blockEndMatch.index - 1),
    };

    return eat(value.slice(0, blockEndMatch.index + blockEndMatch[0].length))(node);
  }

  return false;
}

function compileJiraBlock(node: IJiraNode) {
  return `[block:${node.code}]\n${node.value}\n[/block]`;
}
