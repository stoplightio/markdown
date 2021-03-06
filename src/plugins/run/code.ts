import * as unified from 'unified';
import { visit } from 'unist-util-visit';

import { MDAST } from '../../ast-types';

export const inlineCodeMdast2Hast: unified.Attacher = function () {
  return function transform(root) {
    visit<MDAST.InlineCode>(root, 'inlineCode', node => {
      const data = node.data || (node.data = {});

      // mark inline code blocks with a property so that we can distinguish during rendering later
      data.hProperties = {
        inline: 'true',
      };
    });
  };
};

export const smdCode: unified.Attacher = function () {
  return function transform(root) {
    let sequentialCodeBlocks: MDAST.Code[] = [];
    let lastIndex = -1;
    let lastParent: MDAST.Parent | undefined;

    let groupings: Grouping[] = [];

    visit<MDAST.Code>(root, 'code', (node, index, parent) => {
      const { title: metaTitle, ...metaProps } = parseMeta(node.meta);

      /**
       * Annotation processing
       */

      let annotations: MDAST.Code['annotations'] = Object.assign({}, metaProps, node.annotations);
      const title = annotations.title || (metaTitle as string | undefined);
      if (title) {
        annotations = {
          // title first
          title,
          ...annotations,
        };
      }

      handleLegacyAnnotations(annotations);

      node.annotations = annotations;

      const data = node.data || (node.data = {});
      data.hProperties = {
        lang: node.lang,
        ...node.annotations,
        ...((data.hProperties as any) || {}),
      };

      /**
       * Code groupings
       */

      // if it's a sequential code block with same parent, add it to the list to later group
      const lastCodeBlock = sequentialCodeBlocks[sequentialCodeBlocks.length - 1];
      // @ts-expect-error
      if (!lastCodeBlock || (lastIndex === index - 1 && lastParent === parent)) {
        // @ts-expect-error
        lastIndex = index;
        // @ts-expect-error
        lastParent = parent;
        sequentialCodeBlocks.push(node);
      } else {
        addCodeGrouping(groupings, lastParent!, lastIndex, sequentialCodeBlocks);
        // @ts-expect-error
        lastIndex = index;
        // @ts-expect-error
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
};

/**
 * Internal helpers below
 */

const highlightLinesRangeRegex = /{([\d,-]+)}/;
const metaKeyValPairMatcher = /(\S+)\s*=\s*(\"?)([^"]*)(\2|\s|$)/g;
function parseMeta(metastring?: string | null) {
  const props: Record<string, boolean | string> = {};

  if (!metastring) return props;

  let metaWithoutKeyValPairs = metastring;
  let keyValPair: RegExpExecArray | null;
  while ((keyValPair = metaKeyValPairMatcher.exec(metastring)) !== null) {
    props[keyValPair[1]] = keyValPair[3];
    metaWithoutKeyValPairs = metaWithoutKeyValPairs.replace(keyValPair[0], '');
  }

  const booleanProps = metaWithoutKeyValPairs.split(' ');
  for (const booleanProp of booleanProps) {
    const highlightLinesMatch = booleanProp.match(highlightLinesRangeRegex);
    if (highlightLinesMatch) {
      props.highlightLines = highlightLinesMatch[1];
    } else if (booleanProp) {
      props[booleanProp] = 'true';
    }
  }

  return props;
}

type Grouping = { codeGroup: MDAST.CodeGroup; parent: MDAST.Parent; startIndex: number; numCodeBlocks: number };

function addCodeGrouping(groupings: Grouping[], parent: MDAST.Parent, lastIndex: number, children: MDAST.Code[]) {
  // if only one code block.. don't group
  if (children.length <= 1) return;

  const numCodeBlocks = children.length;

  const codeGroup: MDAST.CodeGroup = {
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

function handleLegacyAnnotations(annotations: MDAST.Code['annotations']) {
  if (!annotations) return;

  if (annotations.hasOwnProperty('type')) {
    // @ts-expect-error type is no longer part of the typings, it is deprecated
    const type = annotations.type;
    if (type === 'json_schema') {
      // @ts-expect-error
      annotations.jsonSchema = 'true';
    } else {
      annotations[type] = 'true';
    }

    // @ts-expect-error ditto above
    delete annotations.type;
  }

  if (annotations.hasOwnProperty('json_schema')) {
    // @ts-expect-error
    annotations.jsonSchema = 'true';
    // @ts-expect-error ditto above
    delete annotations.json_schema;
  }
}
