# @stoplight/markdown

Useful functions when working with Markdown.

- Explore the interfaces: [TSDoc](https://stoplightio.github.io/markdown)
- View the changelog: [Releases](https://github.com/stoplightio/markdown/releases)

### Installation

Supported in modern browsers and node.

```bash
# latest stable
yarn add @stoplight/markdown
```

### Usage


#### Example `parseWithPointers`

_Note: Unlike most of the other functions, parseWithPointers is not exported from root. You must import by name._

```ts
import { parseWithPointers } from "@stoplight/markdown/parseWithPointers";

const result = parseWithPointers('**markdown**');

console.log(result.data); // => the MDAST compliant tree
console.log(result.pointers); // => the source map with pointers
```

### Contributing

1. Clone repo.
2. Create / checkout `feature/{name}`, `chore/{name}`, or `fix/{name}` branch.
3. Install deps: `yarn`.
4. Make your changes.
5. Run tests: `yarn test.prod`.
6. Stage relevant files to git.
7. Commit: `yarn commit`. _NOTE: Commits that don't follow the [conventional](https://github.com/marionebl/commitlint/tree/master/%40commitlint/config-conventional) format will be rejected. `yarn commit` creates this format for you, or you can put it together manually and then do a regular `git commit`._
8. Push: `git push`.
9. Open PR targeting the `develop` branch.
