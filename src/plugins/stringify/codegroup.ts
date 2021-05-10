import { Handler } from 'mdast-util-to-markdown';
// @ts-expect-error
import flow from 'mdast-util-to-markdown/lib/util/container-flow';

export const codeGroupHandler: Handler = (node, _, context) => {
  const exit = context.enter('codegroup');
  const value = flow(node, context);
  exit();
  return value;
};
