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

Or add the symbols listed below in front of a line of words.

| Symbol          | Leading | Style                      |
| --------------- | :-----: | -------------------------- |
| Number sign     | `#`     | `2em` size, weight `900`   |
| Number sign × 2 | `##`    | `1.5em` size, weight `700` |
| At sign         | `@`     | Blue text                  |

> At sign `@` can also be closed by a space.

### Vertical Writing Direction
Press `Tab` key to switch writing direction between horizontal and vertical (vertical-RL).


## Customization
### Customize Style
Change the CSS of the HTML classes to customize the style.

Those HTML class names are in the form of:

* Wrapped text: `-name`
* Opening symbol: `-name-start`
* Closing symbol: `-name-end`
* Leading symbol: `-name-start`
* Line break (or space) after a leading symbol: `-name-end`

Where the `-name` is the HTML class name of each symbol.

Here are the HTML Class names of default symbols:

| Symbol          | Opening | Closing | HTML Class Name |
| --------------- | :-----: | :-----: | --------------- |
| Asterisk        | `*`     | `*`     | `-ast`          |
| Asterisk × 2    | `**`    | `**`    | `-ast2`         |
| Asterisk × 3    | `***`   | `***`   | `-ast3`         |
| Double quote    | `"`     | `"`     | `-dblq`         |
| Grave           | `` ` `` | `` ` `` | `-grave`        |
| Underscore × 2  | `__`    | `__`    | `-under`        |
| Hyphen × 2      | `--`    | `--`    | `-hyphen`       |
| Tilde × 2       | `~~`    | `~~`    | `-tilde`        |
| Parenthesis     | `(`     | `)`     | `-paren`        |
| Bracket         | `[`     | `]`     | `-bracket`      |
| Angle           | `<`     | `>`     | `-angle`        |
| CJK quote       | `「`    | `」`    | `-cjkq`         |
| CJK quote       | `『`    | `』`    | `-cjkq`         |
| Number Sign     | `#`     |         | `-numsign`      |
| Number Sign × 2 | `##`    |         | `-numsign2`     |
| At Sign         | `@`     |         | `-at`           |

### Customize Symbol and Mark
Use the JavaScript methods listed below to customize symbols and marks.

#### 1. `addMarkOnly(mark, symbol)`
  - Add a new mark into the textMarker parser.
  - **mark** (_String_) - HTML class name of the mark.
  - **symbol** (_String_) - The symbol.

#### 2. `addMarkBetween(mark, opening, closing)`
  - Add a new mark into the textMarker parser.
  - **mark** (_String_) - HTML class name of the mark.
  - **opening** (_String_) - The opening symbol.
  - **closing** (_String_) - The closing symbol.
    - default: `undefined`, will be the same as **opening**.

#### 3. `addMarkAfter(mark, leading, closedBySpace)`
  - Add a new mark into the textMarker parser.
  - **mark** (_String_) - HTML class name of the mark.
  - **leading** (_String_) - The leading symbol.
  - **closedBySpace** _(Bool)_ - This mark can also be closed by a space.
    - default: `false`, this mark can only be closed by a line break.

#### 4. `setSymbolView(symbol, view)`
  - Set the view of a symbol.
  - **symbol** (_String_) - The symbol which people key in.
  - **view** (_String_) - The symbol which people will see.

For example, to add a mark where the text is in between `«` and `»`, we need add one line of JS code (after the reference of `textRevealer.js`) like:

```HTML
<script src="./textMarker.js"></script>
<script src="./textPacker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  addMarkBetween('-guillemet', '«', '»');
</script>
```

