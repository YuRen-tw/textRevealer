# Text Revealer
Text Revealer is a tool for people to display their text.

Just like screen-message but has more features such as styling the text.

*Read this in other languages: [English](README.md), [正體中文](README.zh-Hant-TW.md)*

## Features
### Style
Wrap text by the symbols listed below to add style to the text.

| Symbol         | Opening | Closing | Style        |
| -------------- | :-----: | :-----: | ------------ |
| GROUP          | `{`     | `}`     | None         |
| Asterisk       | `*`     | `*`     | Italic       |
| Asterisk × 2   | `**`    | `**`    | Bold         |
| Asterisk × 3   | `***`   | `***`   | Bold Italic  |
| Double quote   | `"`     | `"`     | Serif        |
| Grave          | `` ` `` | `` ` `` | Monospace    |
| Underscore × 2 | `__`    | `__`    | Underline    |
| Hyphen × 2     | `--`    | `--`    | Line-through |
| Tilde × 2      | `~~`    | `~~`    | Line-through |
| CJK quote      | `「`    | `」`    | Serif        |
| CJK quote      | `『`    | `』`    | Serif        |

Or add the symbols listed below in front of a "bolck of text".

| Symbol         | Leading | Style        |
| -------------- | :-----: | ------------ |
| Number sign    | `#`     | Header       |

> A block of text is:
>    1. line of text excluding symbols and line break
>    2. text wrapped by `GROUP` symbols

### Vertical Writing Direction
Press `Tab` key to switch writing direction between horizontal and vertical (vertical-RL).


## Customization
### Customize Style
Change the CSS of the HTML classes to customize the style.

Those HTML class names are in the form of:

* Wrapped text: `-name`
* Opening symbol: `-name-start`
* Closing symbol: `-name-end`
* Leading symbol: `-name-lead`

> Leading symbol will only affect the **adjacent** "block of text" follow it.

Where the `-name` is the HTML class name of each symbol.

Here are the HTML Class names of default symbols:

| Symbol         | Opening | Closing | Leading | HTML Class Name |
| -------------- | :-----: | :-----: | :-----: | --------------- |
| GROUP          | `{`     | `}`     |         | `-G`            |
| Number Sign    |         |         | `#`     | `-numsign`      |
| Asterisk       | `*`     | `*`     |         | `-ast`          |
| Asterisk × 2   | `**`    | `**`    |         | `-ast2`         |
| Asterisk × 3   | `***`   | `***`   |         | `-ast3`         |
| Double quote   | `"`     | `"`     |         | `-dblq`         |
| Grave          | `` ` `` | `` ` `` |         | `-grave`        |
| Underscore × 2 | `__`    | `__`    |         | `-under`        |
| Hyphen × 2     | `--`    | `--`    |         | `-hyphen`       |
| Tilde × 2      | `~~`    | `~~`    |         | `-tilde`        |
| Parenthesis    | `(`     | `)`     |         | `-paren`        |
| Bracket        | `[`     | `]`     |         | `-bracket`      |
| Angle          | `<`     | `>`     |         | `-angle`        |
| CJK quote      | `「`    | `」`    |         | `-cjkq`         |
| CJK quote      | `『`    | `』`    |         | `-cjkq`         |

### Customize Symbol
Use the JavaScript methods listed below to customize symbols.

#### 1. `addSymbolType(type, className)`
  - **type** -  Classification of the symbol.
  - **className** _(String)_ - HTML class name.

#### 2. `addSymbol(symbol, type, on='both', view=undefined)`
  - **symbol** _(String)_ - The text which people key in.
  - **type** -  Classification of the symbol.
  - **on** - The symbol will wrap on which side.
    - `'both'`, `'start'`, `'end'`, `'lead'`
    - default: `'both'`
  - **view** _(String)_ - Displayed text.
    - default: `undefined`, will be the same as **symbol**.

For example, to add `$$` as a symbol on both side of text, we need add two lines of JS code (after the reference of `textRevealer.js`) like:

```HTML
<script src="./textMarker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  addSymbolType('DOLLARSIGN', '-dollarsign');
  addSymbol('$$', 'DOLLARSIGN');
</script>
```

And, to add `«` and `»` as symbols on both side of text, we need add three lines of JS code like:

```HTML
<script src="./textMarker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  addSymbolType('GUILLEMET', '-guillemet');
  addSymbol('«', 'GUILLEMET', 'start');
  addSymbol('»', 'GUILLEMET', 'end');
</script>
```

