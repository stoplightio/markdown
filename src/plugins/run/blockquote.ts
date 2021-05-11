import * as unified from 'unified';
import { visit } from 'unist-util-visit';

import { MDAST } from '../../ast-types';

export const blockquoteMdast2Hast: unified.Attacher = function () {
  return function transform(root) {
    visit<MDAST.Blockquote>(root, 'blockquote', node => {
      const data = node.data || (node.data = {});
      const annotations = node.annotations || {};
      data.hProperties = annotations;
    });
  };
};
