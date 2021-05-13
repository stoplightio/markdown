import * as Yaml from '@stoplight/yaml';
import { Handler } from 'mdast-util-to-markdown';
// @ts-expect-error
import code from 'mdast-util-to-markdown/lib/handle/code';

const { safeStringify } = Yaml;

export const codeHandler: Handler = function (node, _, context) {
  const { lang, meta: _meta, ...annotations } = (node.data?.hProperties || {}) as any;

  // if node has resolved prop we want to replace value with resolved value when stringifying
  if (node.resolved) {
    node.value =
      node.lang === 'json' ? JSON.stringify(node.resolved, null, 2) : safeStringify(node.resolved, { indent: 2 });
  }

  const metaProps = computeMetaProps(annotations);
  if (metaProps.length) {
    node.meta = metaProps.join(' ');
  }

  return code(node, _, context);
};

function computeMetaProps(annotations: object) {
  const metaProps = [];
  if (Object.keys(annotations).length) {
    for (const key in annotations) {
      const annotationVal = annotations[key];

      if (typeof annotationVal === 'boolean' || annotationVal === 'true' || annotationVal === 'false') {
        if (annotationVal || annotationVal === 'true') {
          metaProps.push(key);
        }

        // don't add falsey val to meta string
        continue;
      } else if (key === 'type') {
        // this is the only old val we support
        if (annotationVal === 'json_schema') {
          // camelCase to be consistent with rest of annotation props
          metaProps.push('jsonSchema');
        }
      } else if (key === 'highlightLines') {
        // handle deprecated way of adding highlightLines via array annotation
        if (Array.isArray(annotationVal)) {
          const rangeVals = [];
          for (const val of annotationVal) {
            if (Array.isArray(val)) {
              rangeVals.push(`${val[0]}-${val[1]}`);
            } else {
              rangeVals.push(val);
            }
          }
          if (rangeVals.length) {
            metaProps.push(`{${rangeVals.join(',')}}`);
          }
        } else {
          // else we're dealing with the new {1,3} style highlightLines
          metaProps.push(`{${annotationVal}}`);
        }
      } else {
        metaProps.push(`${key}="${annotationVal}"`);
      }
    }
  }

  return metaProps;
}
