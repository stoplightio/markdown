import * as unified from 'unified';
import { Data, Parent } from 'unist';
import { visit } from 'unist-util-visit';

export const inlineImages: unified.Attacher = function () {
  // Set `inline` prop on images that we consider "inline", so that downstream renderers can render them nicely
  return function transformer(tree) {
    visit<Parent>(tree, ['image', 'imageReference'], (node, index, parent) => {
      if (!parent) return;

      if (applicable(parent)) {
        const data = (node.data ??= {});
        const props = (data.hProperties ??= {}) as Data;

        data.inline = true;
        props.inline = 'true';
      }

      return;
    });
  };
};

function applicable(node: Parent): boolean | null {
  if (node.type === 'link' || node.type === 'linkReference') return true;
  if (node.type === 'paragraph' && node.children.length > 1) return true;

  return false;
}
