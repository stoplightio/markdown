import { Dictionary } from '@stoplight/types';
import * as Yaml from '@stoplight/yaml';
import * as unified from 'unified';

import { MDAST } from '../../ast-types';

const { parse } = Yaml;

// When we have bandwidth, might make sense to look into the new lower level pattern made possible by micromark ecosystem
// Example in the gfm plugin - https://github.com/remarkjs/remark-gfm/blob/main/index.js#L30-L32
export const smdAnnotations: unified.Attacher = function () {
  return function transform($root) {
    const root = $root as MDAST.Root;
    const nodes = root.children;

    const processed: MDAST.Content[] = [];

    let inTab: boolean = false;

    // temporary variable for storing current tabContainer
    let tabPlaceholder: MDAST.Tabs = {
      type: 'tabs',
      data: {
        hName: 'tabs',
      },
      children: [
        {
          type: 'tab',
          data: {
            hName: 'tab',
          },
          children: [],
        },
      ],
    };

    const entries = nodes.entries()[Symbol.iterator]();
    for (const [i, node] of entries) {
      // next node
      const next = nodes[i + 1] ?? null;

      // collect annotations, if this is an html node
      const anno = captureAnnotations(node);

      if ('type' in anno) {
        const { type } = anno;

        if (type === 'tab') {
          const { children } = tabPlaceholder;

          if (inTab && tabPlaceholder) {
            // already inside of a tab, so this is a new one
            children.push({
              type: 'tab',
              data: {
                hName: 'tab',
              },
              children: [],
            });
          } else {
            // not inside a tab already
            inTab = true;
          }

          // set annotations if present
          if (Object.keys(anno).length > 0) {
            Object.assign(children[children.length - 1].data, {
              hProperties: normalizeAnnotationsForHast(anno),
            });
          }

          tabPlaceholder.children = children;

          continue;
        } else if (type === 'tab-end') {
          // finalize tabContainer
          processed.push(tabPlaceholder);

          // reset tabPlaceholder
          inTab = false;
          tabPlaceholder = {
            type: 'tabs',
            data: {
              hName: 'tabs',
            },
            children: [
              {
                type: 'tab',
                data: {
                  hName: 'tab',
                },
                children: [],
              },
            ],
          };

          continue;
        }
      }

      let root = processed;

      if (inTab) {
        // if we're in a tab, push this node as a child of the last tab
        const size = tabPlaceholder.children.length;
        if (tabPlaceholder.children[size - 1]) {
          root = tabPlaceholder.children[size - 1].children as MDAST.Content[];
        } else {
          continue;
        }
      }

      if (Object.keys(anno).length > 0 && next) {
        // annotations apply to next node, process next node now and skip next iteration
        root.push(processNode(next, anno));
        entries.next();
      } else {
        root.push(processNode(node));
      }
    }

    return {
      ...root,
      children: processed,
    };
  };
};

function captureAnnotations<T extends Dictionary<any>>(node: MDAST.Content | undefined): T | {} {
  if (!node?.value) return {};

  if (
    // @ts-expect-error
    node.type === 'mdxFlowExpression' &&
    // @ts-expect-error
    (node.value as string).startsWith('/*') &&
    // @ts-expect-error
    (node.value as string).endsWith('*/')
  ) {
    // remove comments and whitespace
    // @ts-expect-error
    const raw = (node.value as string)
      // @ts-expect-error
      .substr('/*'.length, (node.value as string).length - '*/'.length - '/*'.length)
      .trim();

    // load contents of annotation into yaml
    try {
      const contents = parse<T>(raw);
      if (contents && typeof contents === 'object') {
        for (const key in contents) {
          if (typeof contents[key] === 'string') {
            // babel will crap out if certain characters, like ", are not escaped
            const escapedContent = contents[key].replace('"', '%22');
            contents[key] = escapedContent as any;
          }
        }

        // annotations must be objects, otherwise it's just a regular ol html comment
        return contents;
      }
    } catch (error) {
      console.error(`Markdown.captureAnnotations parse YAML error: ${String(error)}`, error);
      // ignore invalid YAML
    }
  } else if (node.type === 'html' && isHTMLComment(node.value)) {
    // remove comments and whitespace
    const raw = node.value.slice(node.value.indexOf('<!--') + 4, node.value.lastIndexOf('-->')).trim();

    // load contents of annotation into yaml
    try {
      const contents = parse<T>(raw);
      if (contents && typeof contents === 'object') {
        // annotations must be objects, otherwise it's just a regular ol html comment
        return contents;
      }
    } catch (error) {
      // ignore invalid YAML
    }
  }

  return {};
}

function processNode(node: MDAST.Content, annotations?: object): MDAST.Content {
  if (annotations) {
    return {
      ...node,
      annotations,
      data: {
        ...(node.data || {}),
        hProperties: normalizeAnnotationsForHast(annotations),
      },
    };
  }

  return node;
}

// micromark ecosystem passes data through html, and then to react
// HTML does not allow for boolean properties, so here we stringify boolean values so that they can pass through
// the html layer
export function normalizeAnnotationsForHast(annotations?: object) {
  if (!annotations) return annotations;

  const cleaned = {};
  for (const key in annotations) {
    const annotation = annotations[key];
    if (typeof annotation === 'boolean') {
      cleaned[key] = String(annotation);
    } else {
      cleaned[key] = annotation;
    }
  }

  return cleaned;
}

function isHTMLComment(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const trimmedValue = value.trim();

  return trimmedValue.startsWith('<!--') && trimmedValue.endsWith('-->');
}
