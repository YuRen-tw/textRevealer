function* addEndOf(iterable, end) {
  for (let element of iterable)
    yield element;
  yield end;
}
function* enumerate(iterable, start=0) {
  let idx = start;
  for (let element of iterable) {
    yield [idx, element];
    idx += 1;
  }
}

const HTMLClass = new Map([
  ['INIT', 'tag'],
  ['TEXT', ''],
  ['SYMBOL', '-symbol'],
  ['CURSOR', '-cursor'],
  ['SELECT', '-select'],
]);
const SymbolTrie = new Map();

function setHTMLClass(type, className) {
  HTMLClass.set(type, className);
}
function addSymbol(symbol, type, on='both', view=undefined) {
  let Trie = SymbolTrie;
  for (let char of symbol) {
    if (!Trie.has(char))
      Trie.set(char, new Map());
    Trie = Trie.get(char);
  }
  if (view === undefined)
    view = symbol;
  Trie.set('END', {
    type: type,
    on: on,
    raw: symbol,
    view: view,
    rawLength: symbol.length,
    scale: view.length / symbol.length
  });
}

function mkTextObj(text) {
  return {
    type: 'TEXT',
    raw: text,
    view: text,
    rawLength: text.length,
    scale: 1
  };
}
function* textObjGen(charGen) {
  let charList = [];
  let bList = [];  // [[start, alive, currEND, branch], ...]
  let yieldStartIdx = 0;
  
  for (let [charIdx, char] of enumerate(addEndOf(charGen, ''))) {
    let yieldMode = false;
    charList.push(char);
    
    if (SymbolTrie.has(char))
      bList.push([charIdx, true, undefined, SymbolTrie]);
    for (let [bIdx, [start, alive, currEND, branch]] of enumerate(bList)) {
      if (!alive) continue;
      
      if (branch.has(char)) {
        bList[bIdx][3] = branch = branch.get(char);
        if (branch.has('END')) {
          bList[bIdx][2] = currEND = branch.get('END');
          bList.splice(bIdx + 1);
        }
      } else {
        bList[bIdx][1] = alive = false;
        if (bIdx === 0)
          yieldMode = true;
      }
    }
    
    while (yieldMode && bList.length) {
      let [start, alive, currEND, branch] = bList[0];
      if (alive) break;
      bList.shift();
      if (currEND === undefined) continue;
      let len = currEND.rawLength;
      let textList = charList.splice(0, start - yieldStartIdx);
      let symbolList = charList.splice(0, len);
      yieldStartIdx = start + len;
      if (textList.length)
        yield mkTextObj(textList.join(''));
      yield currEND;
    }
  }
  yield mkTextObj(charList.join(''));
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
  classList = classList || [];
  let classString = `class="${HTMLClass.get('INIT')} ${classList.join(' ')}"`;
  let data = (`data-start="${startIdx}" ` +
              `data-end="${endIdx}" ` +
              `data-scale="${scale}"` +
              `data-content="${inner}"`);
  return `<span ${classString} ${data}>${toHTML(inner)}</span>`;
}

function addClassAmount(classAmount, symbolClass, add) {
  let amount = classAmount[symbolClass] || 0;
  if (add > 0 || amount >= add)
    classAmount[symbolClass] = amount + add;
}
function updateClassAmount(classAmount, currClass, on) {
  if (on === 'end')
    addClassAmount(classAmount, currClass, -1);
  let classList = (Object.keys(classAmount)
                   .filter(k => classAmount[k] > 0));
  if (on === 'start')
    addClassAmount(classAmount, currClass, 1);
  return classList;
}

function* spanStrGenerator(textObjGen) {
  let classAmount = {};
  let startIdx = 0;
  
  for (let textObj of textObjGen) {
    let type = textObj.type;
    let inner = textObj.view;
    let endIdx = startIdx + textObj.rawLength;
    let scale = textObj.scale;
    let spanStr = (...classList) =>
      mkSpanStr(inner, startIdx, endIdx, scale, ...classList);
    
    if (type !== 'TEXT') {
      let on = textObj.on;
      let symbolClass = HTMLClass.get(type);
      let amount = classAmount[symbolClass] || 0;
      
      let bound = '';      
      if (on === 'start' ||
          (on === 'both' && amount < 1))
        bound = 'start';
      if ((on === 'end' && amount > 0) ||
          (on === 'both' && amount > 0))
        bound = 'end';
      
      let classList = updateClassAmount(classAmount, symbolClass, bound);
      yield spanStr(`${symbolClass}-${bound}`, ...classList);
    } else {
      let classList = updateClassAmount(classAmount);
      yield spanStr(HTMLClass.get('TEXT'), ...classList);
    }
    
    startIdx = endIdx;
  }
}

