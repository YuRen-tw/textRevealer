const HTMLClass = new Map([
  ['INIT', 'tag'],
  ['TEXT', ''],
  ['SYMBOL', '-SYMBOL'],
  ['CURSOR', '-CURSOR'],
  ['SELECT', '-SELECT'],
]);
function getHTMLClass(type) {
  return HTMLClass.get(type) || '';
}

const SymbolViewMap = new Map();

function setSymbolView(symbol, view) {
  letSymbol(symbol);
  SymbolViewMap.set(symbol, view);
}
function getSymbolView(symbol) {
  return SymbolViewMap.get(symbol) || symbol;
}

function addMarkOnly(mark, symbol) {
  mkMarkOnly(mark, symbol);
}
function addMarkBetween(mark, opening, closing=undefined) {
  mkMarkBetween(mark, opening, closing);
}
function addMarkAfter(mark, leading, closedBySpace=false) {
  if (closedBySpace)
    mkMarkBetween(mark, leading, ' ', true);
  mkMarkBetween(mark, leading, '\n', true);
}

function toHTML(str) {
  return (
    str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
  );
}
function mkSpanStr(inner, classList, textMark) {
  let classString = `class="${(classList || []).join(' ')}"`;
  let data = (`data-start="${textMark.startIdx}" ` +
              `data-end="${textMark.endIdx}" ` +
              `data-scale="${inner.length / textMark.length}"` +
              `data-content="${toHTML(inner.replace('\n', '\\n'))}"`);
  return `<span ${classString} ${data}>${toHTML(inner)}</span>`;
}

function* spanStringGenerator(charGenerator) {
  for (let textMark of textMarkGenerator(charGenerator)) {
    let classList = [
      getHTMLClass('INIT'),
      getHTMLClass(textMark.isSymbol ? 'SYMBOL' : 'TEXT')
    ].concat(textMark.marks);
    yield mkSpanStr(getSymbolView(textMark.content), classList, textMark);
  }
}

