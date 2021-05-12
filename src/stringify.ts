import remarkFrontmatter from 'remark-frontmatter';
import remarkGFM from 'remark-gfm';
import remarkStringify, { RemarkStringifyOptions } from 'remark-stringify';
import unified from 'unified';

import { MDAST } from './ast-types';
import { blockquoteHandler, codeGroupHandler, codeHandler, tabHandler, tabsHandler } from './plugins/stringify';

export type StringifySettings = RemarkStringifyOptions;

export type StringifyOptions = {
  remarkPlugins?: unified.PluggableList<unified.Settings>;
  settings?: StringifySettings;
};

const remarkStringifyPreset: unified.Preset<StringifySettings> = {
  plugins: [[remarkFrontmatter, ['yaml']], remarkGFM],
  settings: {
    bullet: '-',
    emphasis: '_',
    fences: true,
    incrementListMarker: true,
    listItemIndent: 'one',
    rule: '-',
    handlers: {
      blockquote: blockquoteHandler,
      code: codeHandler,
      tabs: tabsHandler,
      tab: tabHandler,
      codegroup: codeGroupHandler,
    },
  },
};

const defaultProcessor = unified().use(remarkStringify).use(remarkStringifyPreset);

export const stringify = (
  tree: MDAST.Root,
  opts: Partial<StringifyOptions> = {},
  processor: unified.Processor = defaultProcessor,
) => {
  const processorInstance = processor()
    .data('settings', Object.assign({}, remarkStringifyPreset.settings, opts.settings))
    .use(opts.remarkPlugins || []);

  return processorInstance.stringify(processorInstance.runSync(tree));
};
