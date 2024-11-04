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

class TextPack {
  constructor(viewContent='', rawContent='', start=0, markList=[]) {
    this.viewContent = viewContent;
    this.start = start;
    this.end = start + rawContent.length;
    this.rawContent = rawContent;
    this.scale = viewContent.length / rawContent.length;
    this.markList = markList;
  }
  reveal(mkElement, setData, setClassList, strNormalizer) {
    let elem = mkElement(strNormalizer(this.viewContent));
    setData(elem, 'start', this.start);
    setData(elem, 'end', this.end);
    setData(elem, 'scale', this.scale);
    setData(elem, 'content', strNormalizer(this.viewContent.replace('\n', '\\n')));
    setClassList(elem, this.markList);
    return elem;
  }
  split() {}
}
function* textPackGenerator(textMarkGenerator) {
  for (let textMark of textMarkGenerator) {
    let markList = [
      getHTMLClass('INIT'),
      getHTMLClass(textMark.isSymbol ? 'SYMBOL' : 'TEXT')
    ].concat(textMark.markList);
    yield new TextPack(
      textMark.view,
      textMark.raw,
      textMark.startOffset,
      markList
    );
  }
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
function* spanElementGenerator(textMarkGenerator) {
  for (let textPack of textPackGenerator(textMarkGenerator)) {
    yield textPack.reveal(
      (content) => {
        let elem = document.createElement('span');
        elem.textContent = content;
        return elem;
      },
      (elem, key, value) => {
        elem.dataset[key] = value;
      },
      (elem, classList) => {
        elem.classList.add(...classList);
      },
      toHTML
    );
  }
}