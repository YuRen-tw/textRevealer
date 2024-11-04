function getTextContainer() { return document.getElementById('textContainer'); }
function getTextRevealer() { return document.getElementById('textRevealer'); }
function getTextArea() { return document.getElementById('textArea'); }

function getWidth(element) { return element.clientWidth; }
function getHeight(element) { return element.clientHeight; }

const ctxManager = new ContextManager();

function setSymbolView(symbol, view) {
  ctxManager.setSymbolView(symbol, view);
}
function addMarkOnly(mark, symbol) {
  ctxManager.addMarkOnly(mark, symbol);
}
function addMarkBetween(mark, opening, closing=undefined) {
  ctxManager.addMarkBetween(mark, opening, closing);
}
function addMarkAfter(mark, leading, closedBySpace=false) {
  ctxManager.addMarkAfter(mark, leading, closedBySpace);
}

function putHTMLToReveal() {
  let text = getTextArea().value;
  let TextRevealer = getTextRevealer();
  TextRevealer.innerHTML = '';
  for (let span of spanElementGenerator(textMarkGenerator(ctxManager, text))) {
    TextRevealer.appendChild(span);
  }
}

function mkCursorElement() {
  let cursor = document.createElement('span');
  cursor.classList.add(getHTMLClass('INIT'), getHTMLClass('CURSOR'));
  return cursor;
}
function splitSelectElement(originalElement, bound, inner='right') {
  let after = originalElement;
  let before = after.cloneNode();
  let text = after.textContent;
  bound = bound - after.dataset.start * 1;
  let revealBound = Math.floor(bound * after.dataset.scale * 1);
  
  if (inner === 'right')
    before.classList.remove(getHTMLClass('SELECT'));
  if (inner === 'left')
    after.classList.remove(getHTMLClass('SELECT'));
  
  before.textContent = text.slice(0, revealBound);
  after.textContent = text.slice(revealBound);
  before.dataset.content = before.textContent;
  after.dataset.content = after.textContent;
  before.dataset.end = before.dataset.start * 1 + bound;
  after.dataset.start = before.dataset.end;
    
  getTextRevealer().insertBefore(before, after);
}
function putSelectOnRevealer() {
  let TextArea = getTextArea();
  let TextRevealer = getTextRevealer();
  let [start, end] = [TextArea.selectionStart, TextArea.selectionEnd];
  let nodes = [...TextRevealer.childNodes];
  let selectedNodes = nodes.filter(node => {
    return (node.dataset.start * 1 < end && node.dataset.end * 1 > start);
  });
  selectedNodes.forEach(node => node.classList.add(getHTMLClass('SELECT')));
  
  let selectStart = selectedNodes[0];
  let selectEnd = selectedNodes[selectedNodes.length - 1];
  if (selectStart && selectStart.dataset.start * 1 < start)
    splitSelectElement(selectStart, start, 'right');
  if (selectEnd && selectEnd.dataset.end * 1 > end)
    splitSelectElement(selectEnd, end, 'left');
  
  let afterSelect = nodes.filter(node => node.dataset.start * 1 >= end)[0];
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
  let startOffset = selection.anchorOffset / (startNode.dataset.scale * 1);
  end = start = (startNode.dataset.start * 1 + Math.floor(startOffset));
  
  if (!selection.isCollapsed) {
    let endNode = selection.focusNode.parentNode;
    let endOffset = selection.focusOffset / (endNode.dataset.scale * 1);
    end = (endNode.dataset.start * 1 + Math.floor(endOffset));
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

