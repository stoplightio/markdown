import { Plugin } from 'unified';
import visit from 'unist-util-visit';

import { ILink } from '../ast-types/mdast';

// taken from https://github.com/facebook/react/blob/9198a5cec0936a21a5ba194a22fcbac03eba5d1d/packages/react-dom/src/shared/sanitizeURL.js#L23
const isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;

export function hasJavascriptProtocol(url: string) {
  return isJavaScriptProtocol.test(url);
}

export const stripJsProtocol: Plugin = () => tree => {
  visit(tree, 'link', onVisit);
};

export { stripJsProtocol as default };

const onVisit: visit.Visitor<ILink> = node => {
  if (hasJavascriptProtocol(node.url)) {
    node.url = '';
  }
};
