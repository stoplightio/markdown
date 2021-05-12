import { safeStringify } from '@stoplight/yaml';
import { Handler } from 'mdast-util-to-markdown';
// @ts-expect-error
import blockquote from 'mdast-util-to-markdown/lib/handle/blockquote';

export const blockquoteHandler: Handler = function (node, _, context) {
  const annotations = (node.data?.hProperties || {}) as any;

  const value = blockquote(node, _, context);

  if (Object.keys(annotations).length) {
    return `<!-- ${safeStringify(annotations, { skipInvalid: true }).trim()} -->

${value}`;
  } else {
    return value;
  }
};
