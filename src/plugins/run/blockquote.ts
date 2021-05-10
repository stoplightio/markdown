import { visit } from 'unist-util-visit';

import { MDAST } from '../../ast-types';

export function blockquoteMdast2Hast() {
  return function transform(root: MDAST.Root) {
    visit<MDAST.Blockquote>(root, 'blockquote', node => {
      const data = node.data || (node.data = {});
      const annotations = node.annotations || {};
      data.hProperties = annotations;
    });
  };
}
