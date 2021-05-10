# My article with $refs

The beginning of an awesome article...

```yaml json_schema
type: object
properties:
  user:
    $ref: #/definitions/User
definitions:
  User:
    $ref: ../reference/models/user.v1.yaml
```

## HTTP Try It Out

A smd http try it out block is a smd code block with the `http` language tag. The contents of the code fence should
be the http object to be rendered.

```json http
{
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
}
```

### Example response

```json json_schema
{
  "type": "object",
  "properties": {
    "street": {
      "$ref": "#/test"
    }
  }
}
```
