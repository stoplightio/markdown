// Initial work taken from https://github.com/syntax-tree/unist-util-visit-parents, with license:
//
// Copyright (c) 2018 Titus Wormer <tituswormer@gmail.com>, Stoplight <support@stoplight.io>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and
// associated documentation files (the 'Software'), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge, publish, distribute,
// sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or
// substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT
// NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
import * as types from './types';

const CONTINUE = true;
const SKIP = 'skip';
const EXIT = false;

// visitParents.CONTINUE = CONTINUE;
// visitParents.SKIP = SKIP;
// visitParents.EXIT = EXIT;

/* Visit. */
export function visitParents(
  tree: types.IParentObj,
  test: string[],
  visitor: (node: types.INodeObj, index: number | undefined, stack: types.IParentObj[], idxstack: number[]) => void
) {
  const stack: types.IParentObj[] = [];
  const idxstack: number[] = [];

  one(tree);

  /* Visit a single node. */
  function one(node: types.INodeObj, index?: number, parent?: types.IParentObj): any {
    let result: any;

    if (parent && !index) {
      index = 0;
    }

    if (test.includes(node.type)) {
      result = visitor(node, index, stack, idxstack);
    }

    if (result === EXIT) {
      return result;
    }

    if (node.children && result !== SKIP) {
      return all(node.children, parent || (node as types.IParentObj)) === EXIT ? EXIT : result;
    }

    return result;
  }

  /* Visit children in `parent`. */
  function all(children: types.INodeObj[], parent: types.IParentObj) {
    const step = 1;
    let index: number = -1 + step;
    let child;
    let result;

    stack.push(parent);

    while (index > -1 && index < children.length) {
      child = children[index];

      idxstack.push(index);
      result = child && one(child, index, parent);
      idxstack.pop();

      if (result === EXIT) {
        return result;
      }

      index = typeof result === 'number' ? result : index + step;
    }

    stack.pop();

    return CONTINUE;
  }
}
