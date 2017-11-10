# Text Revealer
Text Revealer is a tool for people to display their text.

Just like screen-message but has more features like styling the text.

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
Edit the JavaScript file `textRevealer.js` to customize symbols.

The const `HTMLCLASS` define the HTML class name of each symbol by classification;
and the const `SYMBOLOBJ` define the data of each symbol.

For example, to add `##` as a symbol in both side of text, we need to edit the JS file like:

```JavaScript
const HTMLCLASS = {
  // ...
  NUMBERSIGN: '-numsign'  // Classification: HTML class name
}
const SYMBOLOBJ = {
  // ...
  '##': {           // The text which people key in
    inner: '##',        // Displayed text
    type: 'NUMBERSIGN', // Classification of the symbol, see HTMLCLASS
    on: 'both'          // Wrap on which side
  }
}
```
