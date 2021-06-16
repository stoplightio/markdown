// Pulled over from https://github.com/remarkjs/remark-unwrap-images and adjusted to not unwrap if paragraph has multiple children

import { whitespace } from 'hast-util-whitespace';
import * as unified from 'unified';
import { Parent } from 'unist';
import { SKIP, visit } from 'unist-util-visit';

export const unwrapImages: unified.Attacher = function () {
  // Patch slugs on heading nodes.
  return function transformer(tree) {
    visit<Parent>(tree, 'paragraph', (node, index, parent) => {
      if (!index) return;

      if (applicable(node)) {
        parent?.children.splice(index, 1, ...node.children);
        return [SKIP, index];
      }

      return;
    });
  };
};

function applicable(node: Parent, inLink?: boolean): boolean | null {
  let image: boolean | null = null;
  let children = node.children;
  let length = children.length;
  let index = -1;
  let child;
  let linkResult;
  let nonwhitespaceChildren = 0;

  while (++index < length) {
    child = children[index];

    const isWhitespace = whitespace(child);
    if (!isWhitespace) nonwhitespaceChildren++;

    if (isWhitespace) {
      // White space is fine.
    } else if (child.type === 'image' || child.type === 'imageReference') {
      image = true;
    } else if (!inLink && (child.type === 'link' || child.type === 'linkReference')) {
      linkResult = applicable(child as Parent, true);

      if (linkResult === false) {
        return false;
      }

      if (linkResult === true) {
        image = true;
      }
    } else {
      return false;
    }
  }

  if (nonwhitespaceChildren > 1) return false;

  return image;
}
