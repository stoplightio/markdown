import remarkFrontmatter from 'remark-frontmatter';
import remarkGFM from 'remark-gfm';
import remarkParse, { RemarkParseOptions } from 'remark-parse';
import unified from 'unified';
import type { VFileCompatible } from 'vfile';

import { MDAST } from './ast-types';
import {
  blockquoteMdast2Hast,
  inlineCodeMdast2Hast,
  inlineImages,
  resolveCodeBlocks,
  Resolver,
  slug,
  smdAnnotations,
  smdCode,
  unwrapImages,
} from './plugins/run';
import { replaceThirdPartyBlocks } from './replaceThirdPartyBlocks';

export type ParseSettings = RemarkParseOptions;

export type ParseOptions = {
  remarkPlugins?: unified.PluggableList<unified.Settings>;
  settings?: ParseSettings;
};

export type AsyncParseOptions = {
  remarkPlugins?: unified.PluggableList<unified.Settings>;
  settings?: ParseSettings & {
    resolver?: Resolver;
  };
};

export const remarkParsePreset: unified.Preset<ParseSettings> = {
  plugins: [
    [remarkFrontmatter, ['yaml']],
    remarkGFM,
    slug,
    unwrapImages,
    smdAnnotations,
    smdCode,
    inlineImages,
    inlineCodeMdast2Hast,
    blockquoteMdast2Hast,
  ],
  settings: {},
};

const defaultProcessor = unified().use(remarkParse).use(remarkParsePreset);

export const parse = (
  input: VFileCompatible,
  opts: Partial<ParseOptions> = {},
  processor: unified.Processor = defaultProcessor,
): MDAST.Root => {
  const markdown = replaceThirdPartyBlocks(input);

  const processorInstance = processor()
    .data('settings', Object.assign({}, remarkParsePreset.settings, opts.settings))
    .use(opts.remarkPlugins || []);

  // return the parsed remark ast
  return processorInstance.runSync(processorInstance.parse(markdown)) as MDAST.Root;
};

export const parseAsync = (
  input: VFileCompatible,
  opts: Partial<AsyncParseOptions> = {},
  processor: unified.Processor = defaultProcessor,
): Promise<MDAST.Root> => {
  const markdown = replaceThirdPartyBlocks(input);

  const processorInstance = processor()
    .data('settings', Object.assign({}, remarkParsePreset.settings, opts.settings))
    .use(resolveCodeBlocks, { resolver: opts.settings?.resolver })
    .use(opts.remarkPlugins || []);

  // return the parsed remark ast
  return processorInstance.run(processorInstance.parse(markdown)) as Promise<MDAST.Root>;
};
