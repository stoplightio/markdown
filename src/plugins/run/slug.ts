// moved from https://github.com/remarkjs/remark-slug/blob/main/index.js

// @ts-expect-error
import GithubSlugger from 'github-slugger';
import { toString } from 'mdast-util-to-string'; // this is the pain point in the original package. the npm remark-slugs relies on older mdast-util-to-string that's CJS and has such an export `module.exports =`.
import * as unified from 'unified';
import { Data } from 'unist';
import { visit } from 'unist-util-visit';

const slugs = new GithubSlugger();

export const slug: unified.Attacher = function () {
  // Patch slugs on heading nodes.
  return function transformer(ast) {
    slugs.reset();

    visit(ast, 'heading', node => {
      const data = (node.data ??= {});
      const props = (data.hProperties ??= {}) as Data;
      let id = props.id;
      id = id ? slugs.slug(id, true) : slugs.slug(toString(node));

      data.id = id;
      props.id = id;
    });
  };
};
