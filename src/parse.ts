import remarkFrontmatter from 'remark-frontmatter';
import remarkGFM from 'remark-gfm';
import remarkParse, { RemarkParseOptions } from 'remark-parse';
// @ts-expect-error
import remarkSlug from 'remark-slug';
import unified from 'unified';
import type { VFileCompatible } from 'vfile';

import { MDAST } from './ast-types';
import { blockquoteMdast2Hast, inlineCodeMdast2Hast, smdAnnotations, smdCode } from './plugins/run';

export type ParseSettings = RemarkParseOptions;

export type ParseOptions = {
  remarkPlugins?: unified.PluggableList<unified.Settings>;
  settings?: ParseSettings;
};

export const remarkParsePreset: unified.Preset<ParseSettings> = {
  plugins: [
    [remarkFrontmatter, ['yaml']],
    remarkGFM,
    remarkSlug,
    smdAnnotations,
    smdCode,
    inlineCodeMdast2Hast,
    blockquoteMdast2Hast,
  ],
  settings: {},
};

const defaultProcessor = unified().use(remarkParse).use(remarkParsePreset);

export const parse = (
  markdown: VFileCompatible,
  opts: Partial<ParseOptions> = {},
  processor: unified.Processor = defaultProcessor,
): MDAST.Root => {
  const processorInstance = processor()
    .data('settings', Object.assign({}, remarkParsePreset.settings, opts.settings))
    .use(opts.remarkPlugins || []);

  // return the parsed remark ast
  return processorInstance.runSync(processorInstance.parse(markdown)) as MDAST.Root;
};
