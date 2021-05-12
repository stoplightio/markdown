import type { VFileCompatible } from 'vfile';

const blockStart = /\[block:([A-Za-z]+)\][^\S\n]*(?=\n)/g;
const blockEnd = /\[\/block\][^\S\n]*(?=\n)/g;

/**
 * Certain 3rd parties like readme.io and jira add these blocks to the markdown export, which the remark-gfm
 * plugin has trouble dealing with (deals with it fine, but performance issues).
 *
 * Simple pre-process to replace them with code blocks, since they mean nothing in markdown anyways.
 */
export const replaceThirdPartyBlocks = (input: VFileCompatible): VFileCompatible => {
  return input.toString().replace(blockStart, '```block_$1').replace(blockEnd, '```');
};
