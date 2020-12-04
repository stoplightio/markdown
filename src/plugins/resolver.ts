import { Dictionary } from '@stoplight/types';
import { parse, safeStringify } from '@stoplight/yaml';
import * as remarkStringify from 'remark-stringify';
import * as unified from 'unified';
import visit from 'unist-util-visit';
import { ICode } from '../ast-types/mdast';

type Resolver = (node: ICode, data: Dictionary<unknown>) => Promise<object>;

export default function(this: unified.Processor, opts?: { resolver: Resolver }): unified.Transformer | void {
  const { Compiler } = this;

  if (Compiler !== void 0) {
    Compiler.prototype.visitors.code = createCompiler(Compiler.prototype.visitors.code);
  }

  if (opts?.resolver) {
    return async tree => {
      const promises: Array<Promise<void>> = [];
      visit(tree, 'code', createVisitor(opts.resolver, promises));
      await Promise.all(promises);
    };
  }
}

const createVisitor = (resolver: Resolver, promises: Array<Promise<void>>): visit.Visitor<ICode> => node => {
  if (typeof node.value !== 'string') return;
  if (node.meta !== 'json_schema' && node.meta !== 'http') return;

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

function createCompiler(
  fn: typeof remarkStringify.Compiler['prototype']['visitors']['code'],
): typeof remarkStringify.Compiler['prototype']['visitors']['code'] {
  return function(this: remarkStringify.Compiler, node, parent) {
    if (node.type === 'code' && 'resolved' in node && node.resolved !== null) {
      return fn.call(
        this,
        {
          ...node,
          value:
            node.lang === 'json' ? JSON.stringify(node.resolved, null, 2) : safeStringify(node.resolved, { indent: 2 }),
        },
        parent,
      );
    }

    return fn.call(this, node, parent);
  };
}
