## Code Blocks

A smd code block is md code fence with an optional annotation to tweak the presentation of the code block.

<!--
title: Fibonacci In Javascript
lineNumbers: false
highlightLines:
  - - 1
    - 2
  - - 4
    - 5
-->

```javascript
function fibonacci(num){
  var a = 1, b = 0, temp;

  while (num >= 0){
    temp = a;
    a = a + b;
    b = temp;
    num--;
  }

  return b;
}
```

## JSON Schema

A smd json schema block is a smd code block with the `json_schema` language tag. The contents of the code fence should
be the json schema object to be rendered.

<!-- type: json_schema -->

```json
{
  "title": "User",
  "type": "object",
    "properties": {
    "name": {
      "type": "string"
    }
  }
}
```
