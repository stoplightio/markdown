import * as Yaml from '@stoplight/yaml';
import { Handler } from 'mdast-util-to-markdown';
// @ts-expect-error
import blockquote from 'mdast-util-to-markdown/lib/handle/blockquote';

import { MDAST } from '../../ast-types';

const { safeStringify } = Yaml;

export const blockquoteHandler: Handler = function (node, _, context) {
  const annotations = {
    ...(node.annotations as MDAST.Blockquote['annotations']),
    ...(node.data?.hProperties as MDAST.Blockquote['annotations']),
  };

  const value = blockquote(node, _, context);

  if (Object.keys(annotations).length) {
    return `<!-- ${safeStringify(annotations, { skipInvalid: true }).trim()} -->

${value}`;
  }

  return value;
};
