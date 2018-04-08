# Text Revealer
Text Revealer is a tool for people to display their text.

Just like screen-message but has more features such as styling the text.

*Read this in other languages: [English](README.md), [正體中文](README.zh-Hant-TW.md)*

## Features
### Style
Wrap text by the symbols listed below to add style to the text.

| Symbol         | Start   | End     | Style        |
| -------------- | :-----: | :-----: | ------------ |
| Asterisk       | `*`     | `*`     | Italic       |
| Asterisk × 2   | `**`    | `**`    | Bold         |
| Asterisk × 3   | `***`   | `***`   | Bold Italic  |
| Double quote   | `"`     | `"`     | Serif        |
| Grave          | `` ` `` | `` ` `` | Monospace    |
| Underscore × 2 | `__`    | `__`    | Underline    |
| Hyphen × 2     | `--`    | `--`    | Line-through |
| Tilde × 2      | `~~`    | `~~`    | Line-through |
| Angle          | `<`     | `>`     | Monospace    |
| CJK quote      | `「`    | `」`    | Serif        |
| CJK quote      | `『`    | `』`    | Serif        |

### Vertical Writing Direction
Press `Tab` key to switch writing direction between horizontal and vertical (vertical-RL).


## Customization
### Customize Style
Change the CSS of the HTML classes to customize the style.

Those HTML class names are in the form of:

* Wrapped text: `-name`
* Start symbol: `-name-start`
* End symbol: `-name-end`

Where the `-name` is the HTML class name of each symbol.

Here are the HTML Class names of default symbols:

| Symbol         | Start   | End     | HTML Class Name |
| -------------- | :-----: | :-----: | --------------- |
| Asterisk       | `*`     | `*`     | `-ast`          |
| Asterisk × 2   | `**`    | `**`    | `-ast2`         |
| Asterisk × 3   | `***`   | `***`   | `-ast3`         |
| Double quote   | `"`     | `"`     | `-dblq`         |
| Grave          | `` ` `` | `` ` `` | `-grave`        |
| Underscore × 2 | `__`    | `__`    | `-under`        |
| Hyphen × 2     | `--`    | `--`    | `-hyphen`       |
| Tilde × 2      | `~~`    | `~~`    | `-tilde`        |
| Parenthesis    | `(`     | `)`     | `-paren`        |
| Bracket        | `[`     | `]`     | `-bracket`      |
| Brace          | `{`     | `}`     | `-brace`        |
| Angle          | `<`     | `>`     | `-angle`        |
| CJK quote      | `「`    | `」`    | `-cjkq`         |
| CJK quote      | `『`    | `』`    | `-cjkq`         |

### Customize Symbol
Use the JavaScript methods listed below to customize symbols.

#### 1. `setHTMLClass(type, className)`
  - **type** -  Classification of the symbol.
  - **className** _(String)_ - HTML class name.

#### 2. `addSymbol(symbol, type, on='both', view=undefined)`
  - **symbol** _(String)_ - The text which people key in.
  - **type** -  Classification of the symbol.
  - **on** - The symbol will wrap on which side.
    - `'both'`, `'start'`, `'end'`
    - default: `'both'`
  - **view** _(String)_ - Displayed text.
    - default: `undefined`, will be the same as **symbol**.

For example, to add `##` as a symbol on both side of text, we need add two lines of JS code (after the reference of `textRevealer.js`) like:

```HTML
<script src="./textMarker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  setHTMLClass('NUMBERSIGN', '-numsign');
  addSymbol('##', 'NUMBERSIGN');
</script>
```

And, to add `«` and `»` as symbols on both side of text, we need add three lines of JS code like:

```HTML
<script src="./textMarker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  setHTMLClass('GUILLEMET', '-guillemet');
  addSymbol('«', 'GUILLEMET', 'start');
  addSymbol('»', 'GUILLEMET', 'end');
</script>
```

