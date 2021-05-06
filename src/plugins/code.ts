import visit from 'unist-util-visit';

import { MDAST, SMDAST } from '../ast-types';
import { CodeAnnotations } from '../ast-types/smdast';

const metaKeyValPairMatcher = /(\S+)\s*=\s*(\"?)([^"]*)(\2|\s|$)/g;
function parseMeta(metastring?: string | null) {
  const props: Record<string, boolean | string> = {};

  if (!metastring) return props;

  let metaWithoutKeyValPairs = metastring;
  // const keyValPairs = metastring.matchAll(metaKeyValPairMatcher);
  let keyValPair: RegExpExecArray | null;
  while ((keyValPair = metaKeyValPairMatcher.exec(metastring)) !== null) {
    props[keyValPair[1]] = keyValPair[3];
    metaWithoutKeyValPairs = metaWithoutKeyValPairs.replace(keyValPair[0], '');
  }

  const booleanProps = metaWithoutKeyValPairs.split(' ');
  for (const booleanProp of booleanProps) {
    if (booleanProp) {
      props[booleanProp] = 'true';
    }
  }

  return props;
}

type Grouping = { codeGroup: SMDAST.ICodeGroup; parent: MDAST.Parent; startIndex: number; numCodeBlocks: number };

function addCodeGrouping(groupings: Grouping[], parent: MDAST.Parent, lastIndex: number, children: SMDAST.ICode[]) {
  // if only one code block.. don't group
  if (children.length <= 1) return;

  const numCodeBlocks = children.length;

  const codeGroup: SMDAST.ICodeGroup = {
    type: 'codegroup',
    data: {
      hName: 'codegroup',
    },
    children,
  };

  groupings.push({
    codeGroup,
    parent,
    startIndex: lastIndex - (numCodeBlocks - 1),
    numCodeBlocks,
  });
}

export function smdCode() {
  return function transform(root: MDAST.Node) {
    let sequentialCodeBlocks: SMDAST.ICode[] = [];
    let lastIndex = -1;
    let lastParent: MDAST.Parent | undefined;

    let groupings: Grouping[] = [];

    visit<SMDAST.ICode>(root, 'code', (node, index, parent) => {
      const { title: metaTitle, ...metaProps } = parseMeta(node.meta);

      /**
       * Annotation processing
       */

      const annotations: CodeAnnotations = Object.assign({}, node.annotations, metaProps);
      const title = annotations.title || (metaTitle as string | undefined);
      if (title) annotations.title = title;
      node.annotations = annotations;

      if (node.meta) {
        // babel will crap out if certain characters, like ", are not escaped
        // don't need meta anymore
        delete node.meta;
      }

      const data = node.data || (node.data = {});
      data.hProperties = {
        ...((data.hProperties as any) || {}),
        ...node.annotations,
      };

      /**
       * Code groupings
       */

      // if it's a sequential code block with same parent, add it to the list to later group
      const lastCodeBlock = sequentialCodeBlocks[sequentialCodeBlocks.length - 1];
      if (!lastCodeBlock || (lastIndex === index - 1 && lastParent === parent)) {
        lastIndex = index;
        lastParent = parent;
        sequentialCodeBlocks.push(node);
      } else {
        addCodeGrouping(groupings, lastParent!, lastIndex, sequentialCodeBlocks);
        lastIndex = index;
        lastParent = parent;
        sequentialCodeBlocks = [node];
      }
    });

    // add any grouping that might be at end of document
    addCodeGrouping(groupings, lastParent!, lastIndex, sequentialCodeBlocks);

    // splice the code groupings in!
    // keep track of how many we're splicing out in each parent, so that indexes don't get mis-aligned
    let removed = new Map<MDAST.Parent, number>();
    for (const group of groupings) {
      if (!removed.get(group.parent)) {
        removed.set(group.parent, 0);
      }
      const removeCount = removed.get(group.parent)!;

      group.parent.children.splice(group.startIndex - removeCount, group.numCodeBlocks, group.codeGroup);

      removed.set(group.parent, removeCount + group.numCodeBlocks - 1);
    }
  };
}
