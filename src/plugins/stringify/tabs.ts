import * as Yaml from '@stoplight/yaml';
import { Handler } from 'mdast-util-to-markdown';
// @ts-expect-error
import flow from 'mdast-util-to-markdown/lib/util/container-flow';

const { safeStringify } = Yaml;

export const tabsHandler: Handler = function (node, _, context) {
  const exit = context.enter('tabs');
  const value = flow(node, context);
  exit();
  return `${value}

<!-- type: tab-end -->`;
};

export const tabHandler: Handler = function (node, _, context) {
  const exit = context.enter('tab');

  const { type, ...annotations } = (node.data?.hProperties || {}) as any;

  const value = flow(node, context);

  exit();

  return `<!--
type: tab
${safeStringify(annotations, { skipInvalid: true }).trim()}
-->

${value}`;
};
