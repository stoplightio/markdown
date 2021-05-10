import { Dictionary } from '@stoplight/types';
import { parse } from '@stoplight/yaml';
import * as unified from 'unified';
import { visit, Visitor } from 'unist-util-visit';

import { MDAST } from '../../ast-types';

export type Resolver = (node: MDAST.Code, data: Dictionary<unknown>) => Promise<object>;

export function resolveCodeBlocks(this: unified.Processor, opts?: { resolver: Resolver }): unified.Transformer | void {
  if (opts?.resolver) {
    return async tree => {
      const promises: Array<Promise<void>> = [];
      visit(tree, 'code', createVisitor(opts.resolver, promises));
      await Promise.all(promises);
    };
  }
}

const createVisitor =
  (resolver: Resolver, promises: Array<Promise<void>>): Visitor<MDAST.Code> =>
  node => {
    if (typeof node.value !== 'string') return;
    if (!node.annotations?.jsonSchema && !node.annotations?.http) return;

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
  };
