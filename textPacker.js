const HTMLClass = new Map([
  ['INIT', 'tag'],
  ['TEXT', '-TEXT'],
  ['SYMBOL', '-SYMBOL'],
  ['CURSOR', '-CURSOR'],
  ['SELECT', '-SELECT'],
]);
function getHTMLClass(type) {
  return HTMLClass.get(type) || '';
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
function mkSpanStr(textMark, classList=[]) {
  let inner = textMark.view;
  let classString = `class="${classList.join(' ')}"`;
  let data = (`data-start="${textMark.startOffset}" ` +
              `data-end="${textMark.startOffset + textMark.raw.length}" ` +
              `data-scale="${inner.length / textMark.raw.length}"` +
              `data-content="${toHTML(inner.replace('\n', '\\n'))}"`);
  return `<span ${classString} ${data}>${toHTML(inner)}</span>`;
}
function* spanStringGenerator(textMarkGenerator) {
  for (let textMark of textMarkGenerator) {
    let classList = [
      getHTMLClass('INIT'),
      getHTMLClass(textMark.isSymbol ? 'SYMBOL' : 'TEXT')
    ].concat(textMark.markList);
    yield mkSpanStr(textMark, classList);
  }
}

