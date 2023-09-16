ePub-Clean
==========

## Config

Tasks are defined in a JSON file, and passed to epub-clean command-line using the required `-c/--config` option.

Example config JSON:


```json
[
  {
    "name": "Remove span tags",
    "task": "remove-elements",
    "selector": "span",
    "args": [
      "keep-contents"
    ]
  }
]
```

### Config properties

* `name`: a unique name for the task
* `task`: the type of task being configured
    *  TODO: change to `type`
* `selector`: a CSS selector string to select which nodes to perform the task on. Anything supported by `document.querySelectorAll` is supported (see [querySelectorAll (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll))
* `args`: Array of arguments required by the task type


## Task Modules

### `amend-attrs` - Amend Attributes

Args:

1. Array of attribute modification objects:
    1. `op`: one of ( `add` | `remove` | `replace` | `regex` )
    2. `attribute`: Any attribute whose value can be obtained by calling `element.getAttribute` (see [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttribute))
    3. `value`: 
        1. for `add`: `<new attribute value>`
        2. for `replace`: `<new attribute value>`
        3. for `regex`: `[ <regex string>, <replacement string> ]`
        2. for `remove`: no argument supplied


### `change-case` - Change Case


Args:

1. one of ( `title-case` | `lower-case` | `upper-case` )


### `map-elements` - Map Elements

Converts elements/classes from one type to another.

#### § Preservation of matching CSS classes

By default **all CSS classes are removed**.

Preserve the **non-matching** CSS classes by adding the namespace `other`.

Example:

```json
[
  { "div.chp": "section.chapter|other" },
]
```

Produces:

```html
<div class="chp ch1 ch-title">
<!-- becomes -->
<section class="chapter ch1 ch-title">
```


Preserve **all** original CSS classes by adding the namespace `all`.

Example:

```json
[
  { "div.chp": "section.chapter|all" },
]
```

Produces:

```html
<div class="chp ch1 ch-title">
<!-- becomes -->
<section class="chapter chp ch1 ch-title">
```

#### § Change element type with new CSS classes:

```json
[
  { 
    "div.chapter": "section[epub:type=\"chapter\"]",
    "p.h2": "h2.chapter-title",
    "p.h3": "h3",
    "p.tx": "p",
    "span.small": "small"
  }
]
```

Produces:

```html
<div class="chapter"> → <section epub:type="chapter"> <!-- todo: -->
<p class="h2"> → <h2 class="chapter-title">
<p class="h3"> → <h3>
<p class="tx"> → <p>
<span class="small"> → <small>
```


### `remove-elements` - Remove Elements

Args:

1. One of:( `keep-content` | `discard-content` )

`keep-content` will copy the element's innerHTML to its parent node

Example:

```json

```