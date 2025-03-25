const DefaultClass = new Map([
  ['INIT', 'tag'],
  ['TEXT', '-TEXT'],
  ['SYMBOL', '-SYMBOL'],
  ['CURSOR', '-CURSOR'],
  ['SELECT', '-SELECT'],
]);
function getDefaultClass(type) {
  return DefaultClass.get(type) || '';
}

class TextPack {
  constructor(viewContent='', rawContent='', start=0, markList=[]) {
    this.viewContent = viewContent;
    this.start = start;
    this.end = start + rawContent.length;
    this.rawContent = rawContent;
    this.scale = viewContent.length / rawContent.length;
    this.markList = markList;
  }
  split() {}
}
function* textPackGenerator(textMarkGenerator) {
  for (let textMark of textMarkGenerator) {
    let markList = [
      getDefaultClass('INIT'),
      getDefaultClass(textMark.isSymbol ? 'SYMBOL' : 'TEXT')
    ].concat(textMark.markList);
    yield new TextPack(
      textMark.view,
      textMark.raw,
      textMark.startOffset,
      markList
    );
  }
}

function mkSpan(textPack) {
  let span = document.createElement('span');
  span.textContent = textPack.viewContent;
  span.dataset['start'] = textPack.start;
  span.dataset['end'] = textPack.end;
  span.dataset['scale'] = textPack.scale;
  span.dataset['content'] = textPack.viewContent.replace('\n', '\\n');
  span.classList.add(...textPack.markList);
  return span;
}
function* spanElementGenerator(textMarkGenerator) {
  for (let textPack of textPackGenerator(textMarkGenerator)) {
    yield mkSpan(textPack);
  }
}