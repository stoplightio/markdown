# Stoplight Flavored Markdown (smd)

### The Two Laws

1. smd is human readable. A human with a simple text editor can easily read and comprehend smd.
2. smd degrades gracefully. An smd document rendered on `github.com` should be readable and clean.

### The Approach

1. Stoplight flavored markdown extends github flavor markdown with inline comment annotations.
2. The value inside of the annotations is a yaml object, and the annotation affects the following markdown block.

By leveraging comments to store annotations, Stoplight flavored markdown degrades gracefully to any other markdown
renderer (Github, for example).

> [MDX](https://github.com/mdx-js/mdx) is an interesting project that might allow our users to add more interactivity to
> their docs, at the cost of complexity (this is a more advanced use case). We would have to figure out a way to
> introduce this WITHOUT impacting those users that do not need the feature.

## Tabs

A smd tab container is a `tab` annotation, followed by the tab content, and closed by a final `tab-end` annotation.

Tab containers cannot be nested.

<!--
type: tab
title: My First Tab
-->

The contents of tab 1.

<!--
type: tab
title: My Second Tab
-->

The contents of tab 2.

<!-- type: tab-end -->

#### Markdown Sample

```md
<!--
type: tab
title: My First Tab
-->

The contents of tab 1.

<!--
type: tab
title: My Second Tab
-->

The contents of tab 2.

<!-- type: tab-end -->
```

## Callouts

A callout is a md block quote with an optional annotation that indicates intent.

<!-- theme: danger -->

> ### Danger Will Robinson!
>
> Here is my danger callout!

<!-- theme: warning -->

> ### Watch Out!
>
> Here is my warning callout!

<!-- theme: success -->

> ### Mission Accomplished!
>
> Here is my success callout!

<!-- theme: info -->

> ### A thing to know
>
> Here is my info callout

#### Markdown Sample

```md
<!-- theme: danger -->

> ### Danger Will Robinson!
>
> Here is my danger callout!

<!-- theme: warning -->

> ### Watch Out!
>
> Here is my warning callout!

<!-- theme: success -->

> ### Mission Accomplished!
>
> Here is my success callout!

<!-- theme: info -->

> ### A thing to know
>
> Here is my info callout
```

## Code Blocks

A smd code block is md code fence with an optional annotation to tweak the presentation of the code block.

<!--
title: "Fibonacci In Javascript"
lineNumbers: false
highlightLines: [[1,2], [4,5]]
-->

```bash
# hello
```

## Raw HTML

```
<div>Hello world!</div>
```

<div>Hello world!</div>

## Inline Links

[foo], [foo][], [bar][foo].

[foo]: http://example.com 'Example Domain'
