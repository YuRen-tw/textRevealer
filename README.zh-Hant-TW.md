# Text Revealer
Text Revealer 是一個讓人顯示文字的工具。

就像是 screen-message，但有更多功能，比如說幫文字加樣式。

*其他語言： [English](README.md), [正體中文](README.zh-Hant-TW.md)*

## 功能
### 樣式
用下列的符號包住文字來為文字加上樣式。

| 符號       | 開始    | 結束    | 樣式     |
| ---------- | :-----: | :-----: | -------- |
| 星號       | `*`     | `*`     | 斜體     |
| 星號 × 2   | `**`    | `**`    | 粗體     |
| 星號 × 3   | `***`   | `***`   | 粗斜體   |
| 雙引號     | `"`     | `"`     | 襯線字體 |
| 反引號     | `` ` `` | `` ` `` | 等寬字體 |
| 底線 × 2   | `__`    | `__`    | 底線     |
| 連字號 × 2 | `--`    | `--`    | 刪除線   |
| 波浪號 × 2 | `~~`    | `~~`    | 刪除線   |
| 角括號     | `<`     | `>`     | 等寬字體 |
| 漢字單引號 | `「`    | `」`    | 襯線字體 |
| 漢字雙引號 | `『`    | `』`    | 襯線字體 |

### 文字直書
按下 `Tab` 鍵在橫書與直書中切換。


## 客製化
### 自定義樣式
更改 HTML classes 的 CSS 來自定義樣式。

這些 HTML class 名稱依照以下格式：

* 被包住的文字：`-name`
* 開始符號：`-name-start`
* 結束符號：`-name-end`

其中，`-name` 是符號的 HTML class 名稱。

下列是預設的符號的 HTML Class 名稱：

| 符號       | 開始    | 結束    | HTML Class 名稱 |
| ---------- | :-----: | :-----: | --------------- |
| 星號       | `*`     | `*`     | `-ast`          |
| 星號 × 2   | `**`    | `**`    | `-ast2`         |
| 星號 × 3   | `***`   | `***`   | `-ast3`         |
| 雙引號     | `"`     | `"`     | `-dblq`         |
| 反引號     | `` ` `` | `` ` `` | `-grave`        |
| 底線 × 2   | `__`    | `__`    | `-under`        |
| 連字號 × 2 | `--`    | `--`    | `-hyphen`       |
| 波浪號 × 2 | `~~`    | `~~`    | `-tilde`        |
| 圓括號     | `(`     | `)`     | `-paren`        |
| 方括號     | `[`     | `]`     | `-bracket`      |
| 花括號     | `{`     | `}`     | `-brace`        |
| 角括號     | `<`     | `>`     | `-angle`        |
| 漢字單引號 | `「`    | `」`    | `-cjkq`         |
| 漢字雙引號 | `『`    | `』`    | `-cjkq`         |

### 自定義符號
利用下列的 JavaScript 方法來自定義符號。

#### 1. `setHTMLClass(type, className)`
  - **type** - 符號的分類。
  - **className** _(String)_ - HTML class 名稱。

#### 2. `addSymbol(symbol, type, on='both', view=undefined)`
  - **symbol** _(String)_ - 使用者輸入的文字。
  - **type** -  符號的分類。
  - **on** - 符號包在文字的哪一邊。
    - `'both'`, `'start'`, `'end'`
    - 預設：`'both'`
  - **view** _(String)_ - 顯示的文字。
    - 預設：`undefined`，會跟 **symbol** 一樣。

例如，要加入 `##` 做為包在文字兩邊的符號，我們需要加入兩行 JS 程式碼（在 `textRevealer.js` 的引用之後），像是：

```HTML
<script src="./textMarker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  setHTMLClass('NUMBERSIGN', '-numsign');
  addSymbol('##', 'NUMBERSIGN');
</script>
```

而要加入 `«` 和 `»` 做為包在文字兩邊的符號，我們需要加入三行 JS 程式碼，像是：

```HTML
<script src="./textMarker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  setHTMLClass('GUILLEMET', '-guillemet');
  addSymbol('«', 'GUILLEMET', 'start');
  addSymbol('»', 'GUILLEMET', 'end');
</script>
```

