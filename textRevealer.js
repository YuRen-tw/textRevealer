const HTMLCLASS = {
  INIT: 'tag',
  TEXT: '',
  CURSOR: '-cursor',
  SELECT: '-select',
  SYMBOL: '-symbol',
  ASTERISK: '-ast',
  ASTERISK_2: '-ast2',
  ASTERISK_3: '-ast3',
  DBLQUOTE: '-dblq',
  GRAVE: '-grave',
  UNDERSCORE: '-under',
  HYPHEN: '-hyphen',
  TILDE: '-tilde',
  PARENTHESIS: '-paren',
  BRACKET: '-bracket',
  BRACE: '-brace',
  ANGLE: '-angle',
  ZHQUOTE: '-zhq'
}
const SYMBOLOBJ = {
  '*': { inner: '*', length: 1, type: 'ASTERISK', on: 'both' },
  '**': { inner: '**', length: 2, type: 'ASTERISK_2', on: 'both' },
  '***': { inner: '***', length: 3, type: 'ASTERISK_3', on: 'both' },
  '"': { inner: '"', length: 1, type: 'DBLQUOTE', on: 'both' },
  '`': { inner: '`', length: 1, type: 'GRAVE', on: 'both' },
  '~~': { inner: '~~', length: 2, type: 'TILDE', on: 'both' },
  '__': { inner: '__', length: 2, type: 'UNDERSCORE', on: 'both' },
  '--': { inner: '--', length: 2, type: 'HYPHEN', on: 'both' },
  '(': { inner: '(', length: 1, type: 'PARENTHESIS', on: 'start' },
  ')': { inner: ')', length: 1, type: 'PARENTHESIS', on: 'end' },
  '[': { inner: '[', length: 1, type: 'BRACKET', on: 'start' },
  ']': { inner: ']', length: 1, type: 'BRACKET', on: 'end' },
  '{': { inner: '{', length: 1, type: 'BRACE', on: 'start' },
  '}': { inner: '}', length: 1, type: 'BRACE', on: 'end' },
  '<': { inner: '<', length: 1, type: 'ANGLE', on: 'start' },
  '>': { inner: '>', length: 1, type: 'ANGLE', on: 'end' },
  '「': { inner: '「', length: 1, type: 'ZHQUOTE', on: 'start' },
  '」': { inner: '」', length: 1, type: 'ZHQUOTE', on: 'end' },
  '『': { inner: '『', length: 1, type: 'ZHQUOTE', on: 'start' },
  '』': { inner: '』', length: 1, type: 'ZHQUOTE', on: 'end' }
}
const SYMBOLCHAR = Object.keys(SYMBOLOBJ).join('');
function charType(char) {
  return (SYMBOLCHAR.indexOf(char) !== -1) ? 'SYMBOL' : 'TEXT';
}

function pureTextObj(text='') {
  return { inner: text, length: text.length, type: 'TEXT' };
}
function mkTextObj(charList) {
  let text = charList.join('');
  return (text in SYMBOLOBJ) ? SYMBOLOBJ[text] : pureTextObj(text);
}
function* textObjGen(charGen) {
  let charList = [];
  let status = 'text';
  for (let char of charGen) {
    let ctype = charType(char);
    if (ctype === 'SYMBOL' && status !== char ||
        ctype !== 'SYMBOL' && status !== 'text') {
      yield mkTextObj(charList);
      charList = [];
    }
    
    if (ctype === 'SYMBOL' && status !== char)
      status = char;
    else if (ctype !== 'SYMBOL' && status !== 'text')
      status = 'text';
    
    charList.push(char);
  }
  yield mkTextObj(charList);
  charList = [];
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
function mkSpanStr(inner, startIdx, endIdx, ...classList) {
  classList = classList || [];
  let classString = `class="${HTMLCLASS.INIT} ${classList.join(' ')}"`;
  let idx = `data-start="${startIdx}" data-end="${endIdx}"`;
  return `<span ${classString} ${idx}>${toHTML(inner)}</span>`;
}
function* spanStrGenerator(textObjGen, inherit) {
  for (let textObj of textObjGen) {
    let inner = textObj.inner;
    let startIdx = inherit.startIdx;
    let endIdx = startIdx + textObj.length;
    
    if (textObj.type !== 'TEXT') {
      let symbolClass = HTMLCLASS[textObj.type];
      let amount = inherit.classAmount[symbolClass] || 0;
      
      let bound = '';      
      if (textObj.on === 'start' ||
          (textObj.on === 'both' && amount < 1))
        bound = 'start';
      if (textObj.on === 'end' ||
          (textObj.on === 'both' && amount > 0))
        bound = 'end';
      
      if (bound === 'end')
        inherit.classAmount[symbolClass] = amount - 1;
      
      let classList = (Object.keys(inherit.classAmount)
                       .filter(k => inherit.classAmount[k] > 0));
      let symbolBoundClass = `${symbolClass}-${bound}`;
      yield mkSpanStr(inner, startIdx, endIdx, symbolBoundClass, ...classList);
      
      if (bound === 'start')
        inherit.classAmount[symbolClass] = amount + 1;
      
    } else {
      let classList = (Object.keys(inherit.classAmount)
                       .filter(k => inherit.classAmount[k] > 0));
      yield mkSpanStr(inner, startIdx, endIdx, HTMLCLASS.TEXT, ...classList);
    }
    
    inherit.startIdx = endIdx;
  }
}


function getTextContainer() { return document.getElementById('textContainer'); }
function getTextRevealer() { return document.getElementById('textRevealer'); }
function getTextArea() { return document.getElementById('textArea'); }

function getWidth(element) { return element.clientWidth; }
function getHeight(element) { return element.clientHeight; }


function putHTMLToReveal() {
  let text = getTextArea().value;
  let inherit = {
    startIdx: 0,
    classAmount: {}
  };
  let HTML = [...spanStrGenerator(textObjGen(text), inherit)].join('');
  getTextRevealer().innerHTML = HTML;
}

function mkCursorElement() {
  let cursor = document.createElement('span');
  cursor.classList.add(HTMLCLASS.INIT, HTMLCLASS.CURSOR);
  return cursor;
}
function splitSelectElement(originalElement, bound, inner='right') {
  let after = originalElement;
  let before = after.cloneNode();
  let text = after.textContent;
  bound = bound - after.dataset.start * 1;
  
  if (inner === 'right')
    before.classList.remove(HTMLCLASS.SELECT);
  if (inner === 'left')
    after.classList.remove(HTMLCLASS.SELECT);
  
  before.textContent = text.slice(0, bound);
  after.textContent = text.slice(bound);
  before.dataset.end = before.dataset.start * 1 + bound;
  after.dataset.start = before.dataset.end;
    
  getTextRevealer().insertBefore(before, after);
}
function putSelectOnRevealer() {
  let TextArea = getTextArea();
  let TextRevealer = getTextRevealer();
  let [start, end] = [TextArea.selectionStart, TextArea.selectionEnd];
  let childs = [...TextRevealer.childNodes];
  let selectedChilds = childs.filter(node => {
    return (node.dataset.start * 1 < end &&
            node.dataset.end * 1 > start);
  });
  selectedChilds.forEach(node => node.classList.add(HTMLCLASS.SELECT));
  
  let selectStart = selectedChilds[0];
  let selectEnd = selectedChilds[selectedChilds.length - 1];
  if (selectStart && selectStart.dataset.start * 1 < start)
    splitSelectElement(selectStart, start, 'right');
  if (selectEnd && selectEnd.dataset.end * 1 > end)
    splitSelectElement(selectEnd, end, 'left');
  
  let afterSelect = childs.filter(node => node.dataset.start * 1 >= end)[0];
  if (afterSelect === undefined)
    TextRevealer.appendChild(mkCursorElement());
  else
    TextRevealer.insertBefore(mkCursorElement(), afterSelect);
}

function revealerResize() {
  let TextContainer = getTextContainer();
  let TextRevealer = getTextRevealer();
  let scaleW = getWidth(TextRevealer) / getWidth(TextContainer);
  let scaleH = getHeight(TextRevealer) / getHeight(TextContainer);
  
  if (scaleW > 1 || scaleH > 1) {
    let scale = 1 / Math.max(scaleW, scaleH);
    TextRevealer.style.transform = `scale(${scale})`;
  } else {
    TextRevealer.style.transform = 'scale(1)';
  }
}

function reveal() {
  putHTMLToReveal();
  putSelectOnRevealer();
  revealerResize();
}


function getSelectionRangeFromRevealer() {
  let selection = window.getSelection();
  let [start, end] = [0, 0];
  
  let startNode = selection.anchorNode.parentNode;
  end = start = startNode.dataset.start * 1 + selection.anchorOffset;
  
  if (!selection.isCollapsed) {
    let endNode = selection.focusNode.parentNode;
    end = endNode.dataset.start * 1 + selection.focusOffset;
  }
  
  return start <= end ? [start, end] : [end, start];
}
function selectionMappingFromRevealer() {
  let selectionRange = getSelectionRangeFromRevealer();
  getTextArea().setSelectionRange(...selectionRange);
}


window.addEventListener('keydown', e => {
  if (e.key === 'Tab') {
    getTextRevealer().classList.toggle('v-rl');
    e.preventDefault();
  }
  setTimeout(reveal, 9);
}, false);

window.addEventListener('click', e => {
  selectionMappingFromRevealer();
  getTextArea().focus();
  reveal();
}, false);

window.onload = function () {
  getTextArea().focus();
  reveal();
}

