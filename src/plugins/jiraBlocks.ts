import * as remarkParse from 'remark-parse';

export default function(this: remarkParse.Parse) {
  const Parser = this.Parser;

  // @ts-ignore
  Parser.prototype.blockTokenizers.jira = tokenizeJiraBlock;

  // @ts-ignore
  Parser.prototype.interruptParagraph.push(['jira']);

  // @ts-ignore
  const methods = Parser.prototype.blockMethods;
  methods.splice(methods.indexOf('fencedCode') + 1, 0, 'jira');
}

const blockStart = /^\[block:([A-Za-z]+)\][^\S\n]*(?=\n)/;
const blockEnd = /\[\/block\][^\S\n]*(?=\n|$)/;

const tokenizeJiraBlock = (eat: remarkParse.Eat, value: string, silent: boolean) => {
  const blockStartMatch = blockStart.exec(value);
  const blockEndMatch = blockEnd.exec(value); // let's naively assume block cannot be placed in any node besides content

  if (blockStartMatch !== null && blockEndMatch !== null) {
    if (silent) {
      return true;
    }

    return eat(value.slice(0, blockEndMatch.index + blockEndMatch[0].length))({
      type: 'jira',
      code: blockStartMatch[1],
      value: value.slice(blockStartMatch[0].length + 1, blockEndMatch.index - 1),
    });
  }

  return false;
};
