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
  SymbolViewMap.set(symbol, {
    view: view,
    scale: view.length / symbol.length
  });
}
function getSymbolView(symbol) {
  return SymbolViewMap.get(symbol) || {
    view: symbol,
    scale: 1
  }
}

function addSymbol(symbol, view=undefined) {
  if (view !== undefined)
    setSymbolView(symbol, view);
  mkSymbol(symbol);
}
function addMarkBetween(mark, opening, closing, openingView, closingView) {
  if (openingView !== undefined)
    setSymbolView(opening, openingView);
  if (closingView !== undefined)
    setSymbolView(closing, closingView);
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
function mkSpanStr(inner, startIdx, endIdx, scale, ...classList) {
  classList = (classList || []).join(' ');
  let classString = `class="${getHTMLClass('INIT')} ${classList}"`;
  let data = (`data-start="${startIdx}" ` +
              `data-end="${endIdx}" ` +
              `data-scale="${scale}"` +
              `data-content="${toHTML(inner.replace('\n', '\\n'))}"`);
  return `<span ${classString} ${data}>${toHTML(inner)}</span>`;
}

function* spanStrGenerator(charGen) {
  let startIdx = 0;
  for (let textMark of textMarkGenerator(charGen)) {
    let endIdx = startIdx + textMark.content.length;
    if (textMark.isSymbol) {
      let symbolView = getSymbolView(textMark.content);
      yield mkSpanStr(symbolView.view, startIdx, endIdx, symbolView.scale,
                      getHTMLClass('SYMBOL'), ...textMark.marks);
    } else {
      yield mkSpanStr(textMark.content, startIdx, endIdx, 1,
                      getHTMLClass('TEXT'), ...textMark.marks);
    }
    startIdx = endIdx;
  }
}

