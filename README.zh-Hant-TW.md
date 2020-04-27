# Text Revealer
Text Revealer 是一個讓人顯示文字的工具。

就像是 screen-message，但有更多功能，比如說幫文字加樣式。

*其他語言： [English](README.md), [正體中文](README.zh-Hant-TW.md)*

## 功能
### 樣式
用下列的符號包住文字來為文字加上樣式。

| 符號       | 開始    | 結束    | 樣式     |
| ---------- | :-----: | :-----: | -------- |
| 群組 GROUP | `{`     | `}`     | 無       |
| 星號       | `*`     | `*`     | 斜體     |
| 星號 × 2   | `**`    | `**`    | 粗體     |
| 星號 × 3   | `***`   | `***`   | 粗斜體   |
| 雙引號     | `"`     | `"`     | 襯線字體 |
| 反引號     | `` ` `` | `` ` `` | 等寬字體 |
| 底線 × 2   | `__`    | `__`    | 底線     |
| 連字號 × 2 | `--`    | `--`    | 刪除線   |
| 波浪號 × 2 | `~~`    | `~~`    | 刪除線   |
| 漢字單引號 | `「`    | `」`    | 襯線字體 |
| 漢字雙引號 | `『`    | `』`    | 襯線字體 |

或在一段文字前加入下列符號。

| 符號       | 領頭    | 樣式                     |
| ---------- | :-----: | ------------------------ |
| 井字號     | `#`     | 大小 `2em`、字重 `900`   |
| 井字號 × 2 | `##`    | 大小 `1.5em`、字重 `700` |
| At 號      | `@`     | 藍色文字                 |

> At 號 `@` 也可以用空白結束。

### 文字直書
按下 `Tab` 鍵在橫書與直書中切換。


## 客製化
### 自定義樣式
更改 HTML classes 的 CSS 來自定義樣式。

這些 HTML class 名稱依照以下格式：

* 被包住的文字：`-name`
* 開始符號：`-name-start`
* 結束符號：`-name-end`
* 領頭符號：`-name-start`
* 領頭符號之後的換行（或空白）：`-name-end`

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
| 角括號     | `<`     | `>`     | `-angle`        |
| 漢字單引號 | `「`    | `」`    | `-cjkq`         |
| 漢字雙引號 | `『`    | `』`    | `-cjkq`         |
| 井字號     | `#`     |         | `-numsign`      |
| 井字號 × 2 | `##`    |         | `-numsign2`     |
| At 號      | `@`     |         | `-at`           |

### 自定義符號與標記
利用下列的 JavaScript 方法來自定義符號與標記。

#### 1. `addMarkOnly(mark, symbol)`
  - 新增一個標記到 textMarker 分析器。
  - **mark** (_String_) - 標記的 HTML class 名稱。
  - **symbol** (_String_) - 符號。

#### 2. `addMarkBetween(mark, opening, closing)`
  - 新增一個標記到 textMarker 分析器。
  - **mark** (_String_) - 標記的 HTML class 名稱。
  - **opening** (_String_) - 開始的符號。
  - **closing** (_String_) - 結束的符號。
    - 預設：`undefined`，會跟 **opening** 一樣。

#### 3. `addMarkAfter(mark, leading, closedBySpace)`
  - 新增一個標記到 textMarker 分析器。
  - **mark** (_String_) - 標記的 HTML class 名稱。
  - **leading** (_String_) - 領頭的符號。
  - **closedBySpace** _(Bool)_ - 這個標記也可以用空白結束。
    - 預設：`false`，這個標記只能用換行結束。

#### 4. `setSymbolView(symbol, view)`
  - 設定符號的外觀。
  - **symbol** (_String_) - 使用者輸入的符號。
  - **view** (_String_) - 使用者看見的符號。


例如，要加入一個將文字包在 `«` 和 `»` 之間的標記，我們需要加入一行 JS 程式碼（在 `textRevealer.js` 的引用之後），像是：

```HTML
<script src="./textMarker.js"></script>
<script src="./textPacker.js"></script>
<script src="./textRevealer.js"></script>
<script>
  addMarkBetween('-guillemet', '«', '»');
</script>
```

