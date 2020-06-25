import { Dictionary } from '@stoplight/types';
import { Plugin } from 'unified';
import { Node, Parent } from 'unist';
import visit from 'unist-util-visit';
import { IInlineHTML } from '..';
import { IHTML } from '../ast-types/smdast';

const Source = require('source-component');

const mergeHtml: Plugin = () => tree => {
  visit(tree, 'html', onVisit);
};

export { mergeHtml as default };

function isHtmlNode(node: Node): node is IHTML {
  return node.type === 'html';
}

function isParentNode(node: Node): node is Parent {
  return 'children' in node;
}

function locateNextHtmlNode(parent: Parent, index: number): number {
  if (index > parent.children.length) {
    // out-of-bounds access check
    return -1;
  }

  index++;

  for (; index < parent.children.length; index++) {
    if (isHtmlNode(parent.children[index])) {
      return index;
    }
  }

  return -1;
}

const onVisit: visit.Visitor<IHTML> = (node, index, parent) => {
  // isParentNode is unlikely to be needed, but let's trust typings
  if (!isParentNode(parent)) return;

  const nextHtmlNodeIndex = locateNextHtmlNode(parent, index);
  if (nextHtmlNodeIndex === -1 || typeof node.value !== 'string') return;
  const { tagName, attributes } = parse(node.value);

  const nextHtmlNode = parent.children[nextHtmlNodeIndex];

  const newNode: IInlineHTML = {
    type: 'inlineHtml',
    children: parent.children.slice(index + 1, index + nextHtmlNodeIndex - 1),
    attributes,
    tagName,
    ...(node.position !== void 0 &&
      nextHtmlNode.position !== void 0 && {
        position: {
          end: nextHtmlNode.position.end,
          start: node.position.start,
          indent: node.position.indent,
        },
      }),
  };

  parent.children[index] = newNode;
  parent.children.splice(index + 1, nextHtmlNodeIndex - index);

  return [visit.SKIP, nextHtmlNodeIndex];
};

/**
 * based on https://github.com/nghiattran/html-attribute-parser with a few minor tweaks + a bugfix
 */
function stringParser(source: typeof Source) {
  const stringSym = source.currentChar();
  let char = source.nextChar();
  let string = '';
  while (char) {
    if (char === stringSym && source.peek(-1) !== '\\') {
      source.nextChar();
      return string;
    } else {
      string += char;
    }

    char = source.nextChar();
  }

  return;
}

function parseName(source: typeof Source) {
  let name = '';

  let char = source.nextChar();
  while (char) {
    if (char === ' ') {
      source.nextChar();
      return name;
    } else if (char !== '>') {
      name += char;
    }
    char = source.nextChar();
  }
  return name;
}

function parseAttributes(source: typeof Source): Dictionary<string | true, string> {
  let field = '';
  let char = source.currentChar();
  const attributes = {};

  while (char && char !== '>') {
    if (char === ' ') {
      if (!attributes[field]) {
        attributes[field] = true;
      }
      field = '';
    } else {
      if (char === '=') {
        source.nextChar();
        attributes[field] = stringParser(source);
        char = source.currentChar();
        continue;
      } else {
        field += char;
      }
    }
    char = source.nextChar();
  }

  return attributes;
}

function parse(text: string) {
  const source = new Source(text);

  return {
    tagName: parseName(source),
    attributes: parseAttributes(source),
  };
}
