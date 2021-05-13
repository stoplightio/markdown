import { Dictionary } from '@stoplight/types';
import * as Yaml from '@stoplight/yaml';
import * as unified from 'unified';
import { Parent } from 'unist';
import { visit } from 'unist-util-visit';

import { MDAST } from '../../ast-types';

const { parse } = Yaml;

export type Resolver = (node: MDAST.Code, data: Dictionary<unknown>) => Promise<object>;

export const resolveCodeBlocks: unified.Attacher<[{ resolver?: Resolver }]> = function (opts) {
  const resolver = opts?.resolver;
  if (!resolver) return;

  return async function transformer(tree, _file) {
    const codes: Array<{ node: MDAST.Code; index: number | null; parent: Parent | null }> = [];
    const promises: Array<Promise<void>> = [];

    visit<MDAST.Code>(tree, 'code', (node, index, parent) => {
      codes.push({ node, index, parent });
    });

    for (const { node } of codes) {
      if (typeof node.value !== 'string') continue;
      if (!node.annotations?.jsonSchema && !node.annotations?.http) continue;

      try {
        promises.push(
          resolver(node, parse(node.value))
            .then(resolved => {
              node.resolved = resolved;
            })
            .catch(() => {
              node.resolved = null;
            }),
        );
      } catch {
        node.resolved = null;
      }
    }

    if (promises.length) {
      await Promise.all(promises);
    }

    return tree;
  };
};
