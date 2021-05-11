import * as fs from 'fs';
import * as path from 'path';
import remarkStringify, { RemarkStringifyOptions } from 'remark-stringify';
import unified from 'unified';

import { MDAST } from '../../../ast-types';
import { parse, parseAsync } from '../../../parse';
import { stringify } from '../../../stringify';
import { resolveCodeBlocks } from '../resolver';

function replaceRefs(obj: object) {
  for (const value of Object.values(obj)) {
    if (typeof value !== 'object' || value === null) continue;
    if ('$ref' in value) {
      value.$ref = '<replaced>';
    } else {
      replaceRefs({ ...value });
    }
  }

  return obj;
}

describe('Resolver plugin', () => {
  describe('parsing', () => {
    it('should resolve $refs for jsonSchema & http', async () => {
      const parsed = parse(fs.readFileSync(path.join(__dirname, '__fixtures__/references.md'), 'utf8'));

      expect(
        await unified()
          .use(resolveCodeBlocks, {
            async resolver(node, data) {
              return replaceRefs({ ...data });
            },
          })
          .run(parsed),
      ).toStrictEqual({
        type: 'root',
        children: [
          expect.objectContaining({
            type: 'heading',
          }),
          expect.objectContaining({
            type: 'paragraph',
          }),
          expect.objectContaining({
            type: 'code',
            lang: 'yaml',
            meta: 'jsonSchema',
            value: `type: object
properties:
  user:
    $ref: #/definitions/User
definitions:
  User:
    $ref: ../reference/models/user.v1.yaml`,
            resolved: {
              type: 'object',
              properties: {
                user: {
                  $ref: '<replaced>',
                },
              },
              definitions: {
                User: {
                  $ref: '<replaced>',
                },
              },
            },
          }),
          expect.objectContaining({
            type: 'heading',
          }),
          expect.objectContaining({
            type: 'paragraph',
          }),
          expect.objectContaining({
            type: 'code',
            lang: 'json',
            meta: 'http',
            value: `{
  "request": {
    "method": "get",
    "url": "https://next-api.stoplight.io/projects/45",
    "headers": {
      "$ref": "#/foo"
    },
    "query": {
      "page": 2
    }
  }
}`,
            resolved: {
              request: {
                method: 'get',
                url: 'https://next-api.stoplight.io/projects/45',
                headers: {
                  $ref: '<replaced>',
                },
                query: {
                  page: 2,
                },
              },
            },
          }),
          expect.objectContaining({
            type: 'heading',
          }),
          expect.objectContaining({
            type: 'code',
            lang: 'json',
            meta: 'jsonSchema',
            resolved: {
              type: 'object',
              properties: {
                street: {
                  $ref: '<replaced>',
                },
              },
            },
            value: `{
  "type": "object",
  "properties": {
    "street": {
      "$ref": "#/test"
    }
  }
}`,
          }),
        ],
        position: expect.any(Object),
      });
    });

    it('should handle resolving failures gracefully', async () => {
      const parsed = parse(fs.readFileSync(path.join(__dirname, '__fixtures__/references.md'), 'utf8'));

      expect(
        await unified()
          .use(resolveCodeBlocks, {
            async resolver() {
              throw new Error('Cannot resolve');
            },
          })
          .run(parsed),
      ).toStrictEqual({
        type: 'root',
        children: [
          expect.objectContaining({
            type: 'heading',
          }),
          expect.objectContaining({
            type: 'paragraph',
          }),
          expect.objectContaining({
            type: 'code',
            lang: 'yaml',
            meta: 'jsonSchema',
            value: `type: object
properties:
  user:
    $ref: #/definitions/User
definitions:
  User:
    $ref: ../reference/models/user.v1.yaml`,
            resolved: null,
          }),
          expect.objectContaining({
            type: 'heading',
          }),
          expect.objectContaining({
            type: 'paragraph',
          }),
          expect.objectContaining({
            type: 'code',
            lang: 'json',
            meta: 'http',
            value: `{
  "request": {
    "method": "get",
    "url": "https://next-api.stoplight.io/projects/45",
    "headers": {
      "$ref": "#/foo"
    },
    "query": {
      "page": 2
    }
  }
}`,
            resolved: null,
          }),
          expect.objectContaining({
            type: 'heading',
          }),
          expect.objectContaining({
            type: 'code',
            lang: 'json',
            meta: 'jsonSchema',
            resolved: null,
            value: `{
  "type": "object",
  "properties": {
    "street": {
      "$ref": "#/test"
    }
  }
}`,
          }),
        ],
        position: expect.any(Object),
      });
    });
  });

  describe('stringifying', () => {
    it('should dump original blocks', async () => {
      const input = fs.readFileSync(path.join(__dirname, '__fixtures__/references.md'), 'utf8');
      const tree = await parseAsync(input, {
        settings: {
          resolver: async (node, data) => {
            return replaceRefs({ ...data });
          },
        },
      });

      expect(stringify(tree)).toMatchInlineSnapshot(`
        "# My article with $refs

        The beginning of an awesome article...

        \`\`\`yaml jsonSchema
        type: object
        properties:
          user:
            $ref: <replaced>
        definitions:
          User:
            $ref: <replaced>

        \`\`\`

        ## HTTP Try It Out

        A smd http try it out block is a smd code block with the \`http\` language tag. The contents of the code fence should be
        the http object to be rendered.

        \`\`\`json http
        {
          \\"request\\": {
            \\"method\\": \\"get\\",
            \\"url\\": \\"https://next-api.stoplight.io/projects/45\\",
            \\"headers\\": {
              \\"$ref\\": \\"<replaced>\\"
            },
            \\"query\\": {
              \\"page\\": 2
            }
          }
        }
        \`\`\`

        ### Example response

        \`\`\`json jsonSchema
        {
          \\"type\\": \\"object\\",
          \\"properties\\": {
            \\"street\\": {
              \\"$ref\\": \\"<replaced>\\"
            }
          }
        }
        \`\`\`
        "
      `);
    });

    it('given failed resolving, should dump original blocks', async () => {
      const parsed = parse(fs.readFileSync(path.join(__dirname, '__fixtures__/references.md'), 'utf8'));

      const processor = await unified()
        .use<RemarkStringifyOptions[]>(remarkStringify)
        .use(resolveCodeBlocks, {
          async resolver() {
            throw new Error('Cannot resolve');
          },
        });

      const tree = (await processor.run(JSON.parse(JSON.stringify(parsed)))) as MDAST.Root;

      expect(processor.stringify(tree)).toEqual(stringify(tree));
      expect(processor.stringify(tree)).toEqual(
        unified().use<RemarkStringifyOptions[]>(remarkStringify).stringify(parsed),
      );
    });
  });
});
