Simple block on one line:

<div>foo</div>

And nested without indentation:

<div>
<div>
<div>
foo
</div>
</div>
<div>bar</div>
</div>

Here's a simple block:

<div>
	foo
</div>

This should be a code block, though:

```
<div>
	foo
</div>
```

As should this:

```
<div>foo</div>
```

Now, nested:

<div>
	<div>
		<div>
			foo
		</div>
	</div>
</div>

This should just be an HTML comment:

<!-- Comment -->

Multiline:

<!--
Blah
Blah
-->

Code block:

```
<!-- Comment -->
```

Just plain comment, with trailing spaces on the line:

<!-- foo -->

Code:

```
<hr />
```

Hr's:

<hr>

<hr/>

<hr />

<hr>

<hr/>

<hr />

<hr class="foo" id="bar" />

<hr class="foo" id="bar"/>

<hr class="foo" id="bar" >

Paragraph one.

<!-- This is a simple comment -->

<!--
	This is another comment.
-->

Paragraph two.

<!-- one comment block -- -- with two comments -->

The end.
