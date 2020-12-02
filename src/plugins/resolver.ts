import { Dictionary } from '@stoplight/types';
import { parse, safeStringify } from '@stoplight/yaml';
import * as remarkStringify from 'remark-stringify';
import * as unified from 'unified';
import visit from 'unist-util-visit';
import { ICode as IMDAstCode } from '../ast-types/mdast';
import { ICode as ISMDAstCode } from '../ast-types/smdast';

type Resolver = (node: IMDAstCode, data: Dictionary<unknown>) => Promise<object>;

export default function(this: unified.Processor, { resolver }: { resolver: Resolver }): unified.Transformer {
  const { Compiler } = this;

  if (Compiler !== void 0) {
    Compiler.prototype.visitors.code = createCompiler(Compiler.prototype.visitors.code);
  }

  return async tree => {
    const promises: Array<Promise<void>> = [];
    visit(tree, 'code', createVisitor(resolver, promises));
    await Promise.all(promises);
  };
}

const createVisitor = (resolver: Resolver, promises: Array<Promise<void>>): visit.Visitor<IMDAstCode> => node => {
  if (typeof node.value !== 'string') return;
  if (node.meta !== 'json_schema' && node.lang !== 'http') return;

  try {
    promises.push(
      resolver(node, parse(node.value))
        .then(resolved => {
          (node as ISMDAstCode).resolved = resolved;
        })
        .catch(() => {
          (node as ISMDAstCode).resolved = null;
        }),
    );
  } catch {
    (node as ISMDAstCode).resolved = null;
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
            node.lang === 'json' || node.lang === 'http'
              ? JSON.stringify(node.resolved, null, 2)
              : safeStringify(node.resolved, { indent: 2 }),
        },
        parent,
      );
    }

    return fn.call(this, node, parent);
  };
}
