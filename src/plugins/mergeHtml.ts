import { Dictionary } from '@stoplight/types';
import { Plugin } from 'unified';
import { Node, Parent } from 'unist';
import visit from 'unist-util-visit';

import { IInlineHTML } from '..';
import { IHTML } from '../ast-types/smdast';

const Source = require('source-component');

export const SELF_CLOSING_HTML_TAGS = Object.freeze([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
  'command',
  'keygen',
  'menuitem',
]);

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

const HTML_TAG_REGEXP = /^<[^>]*>$/;

function isValueHtmlTag(value: string) {
  return HTML_TAG_REGEXP.test(value);
}

function locateNextHtmlNode(parent: Parent, index: number): number {
  if (index > parent.children.length) {
    // out-of-bounds access check
    return -1;
  }

  // eslint-disable-next-line no-param-reassign
  index++;

  // eslint-disable-next-line no-param-reassign
  for (; index < parent.children.length; index++) {
    if (isHtmlNode(parent.children[index])) {
      return index;
    }
  }

  return -1;
}

function mergeSiblingsHtml(left: IHTML, right: IHTML): void {
  if (typeof left.value !== 'string' || typeof right.value !== 'string') return;

  left.value += right.value;
  if (left.position !== void 0 && right.position !== void 0) {
    left.position.end = right.position.end;
  }
}

const onVisit: visit.Visitor<IHTML> = (node, index, parent) => {
  // isParentNode is unlikely to be needed, but let's trust typings
  if (!isParentNode(parent)) return;

  const nextHtmlNodeIndex = locateNextHtmlNode(parent, index);
  if (nextHtmlNodeIndex === -1 || typeof node.value !== 'string') return;

  if (!isValueHtmlTag(node.value) && nextHtmlNodeIndex !== index + 1) return;

  const nextHtmlNode = parent.children[nextHtmlNodeIndex] as IHTML;

  if (index + 1 === nextHtmlNodeIndex) {
    mergeSiblingsHtml(node, nextHtmlNode);
    parent.children.splice(nextHtmlNodeIndex, 1);
    return [visit.SKIP, nextHtmlNodeIndex];
  }

  try {
    const { tagName, attributes, selfClosing } = parse(node.value);

    if (selfClosing) {
      return;
    }

    const newNode: IInlineHTML = {
      type: 'inlineHtml',
      children: parent.children.slice(index + 1, nextHtmlNodeIndex),
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
    parent.children.splice(index + 1, newNode.children.length + 1);

    return [visit.SKIP, nextHtmlNodeIndex];
  } catch (ex) {
    // parsing failed, let's go with default nodes
    return;
  }
};

/**
 * tweaked version of https://github.com/nghiattran/html-attribute-parser
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

// the vast chunk of parsing is already done on the remark side of things, but let's have our own simple logic here as well to make sure React can render the element without any problems

function isASCIIAlpha(charCode: number) {
  return (
    // https://infra.spec.whatwg.org/#ascii-upper-alpha
    (charCode >= 65 && charCode <= 90) ||
    // https://infra.spec.whatwg.org/#ascii-lower-alpha
    (charCode >= 97 && charCode <= 122)
  );
}

function isASCIIDigit(charCode: number) {
  return (
    // https://infra.spec.whatwg.org/#ascii-digit
    charCode >= 48 && charCode <= 57
  );
}

// https://html.spec.whatwg.org/multipage/syntax.html#syntax-tag-name
function isValidTagIdentifierCharCode(charCode: number) {
  return (
    isASCIIAlpha(charCode) ||
    isASCIIDigit(charCode) ||
    // dash for web-components
    charCode === 45
  );
}

function parseName(source: typeof Source) {
  let char = source.nextChar();
  let name = char;

  if (!isASCIIAlpha(char.charCodeAt(0))) {
    throw new SyntaxError('tagName has to start with ascii alpha char');
  }

  // tslint:disable-next-line:no-conditional-assignment
  while ((char = source.nextChar()) && isValidTagIdentifierCharCode(char.charCodeAt(0))) {
    name += char;
  }

  if (name === '') {
    throw new SyntaxError('No valid tagName found');
  }

  source.nextChar(); // this is to scan `>`
  return name.toLowerCase();
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
  const tagName = parseName(source);

  return {
    tagName,
    attributes: parseAttributes(source),
    selfClosing: SELF_CLOSING_HTML_TAGS.includes(tagName),
  };
}
