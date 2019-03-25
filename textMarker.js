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

const SymbolType_HTMLClass = new Map([
  ['INIT', 'tag'],
  ['TEXT', ''],
  ['SYMBOL', '-SYMBOL'],
  ['GROUP', '-G'],
  ['CURSOR', '-CURSOR'],
  ['SELECT', '-SELECT'],
]);
const SymbolTrie = new Map();

function addSymbolType(type, className) {
  SymbolType_HTMLClass.set(type, className);
}
function getSymbolClass(type) {
  return SymbolType_HTMLClass.get(type) || '';
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
addSymbolType('LINEBREAK', '-BR')
addSymbol('\n', 'LINEBREAK', '');

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
  classList = (classList || []).join(' ');
  let classString = `class="${getSymbolClass('INIT')} ${classList}"`;
  let data = (`data-start="${startIdx}" ` +
              `data-end="${endIdx}" ` +
              `data-scale="${scale}"` +
              `data-content="${inner}"`);
  return `<span ${classString} ${data}>${toHTML(inner)}</span>`;
}

function addTypeAmount(typeAmount, type, act, add) {
  let amount = typeAmount.get(`${type}@${act}`) || 0;
  if (add > 0 || amount >= add)
    typeAmount.set(`${type}@${act}`, amount + add);
}
function updateTypeAmount(typeAmount, currType, on) {
  let classList = [];
  if (on === 'end')
    addTypeAmount(typeAmount, currType, 'normal', -1);
  for (let [type_act, amount] of typeAmount) {
    let [type, act] = type_act.split('@');
    if (amount > 0)
      classList.push(getSymbolClass(type));
    
    if (act === 'lead' && amount > 0) {
      addTypeAmount(typeAmount, type, 'lead', -1);
      if (currType === 'GROUP' && on === 'start')
        addTypeAmount(typeAmount, type, 'lock', 1);
    }
    if (act === 'lock' && amount > 0 && currType === 'GROUP' && on === 'end')
        addTypeAmount(typeAmount, type, 'lock', -1);
  }
  if (on === 'start')
    addTypeAmount(typeAmount, currType, 'normal', 1);
  if (on === 'lead')
    addTypeAmount(typeAmount, currType, 'lead', 1);
  return classList;
}

function* spanStrGenerator(textObjGen) {
  let typeAmount = new Map();
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
      let act = on === 'lead' ? 'lead' : 'normal';
      let amount = typeAmount.get(`${type}@${act}`) || 0;
      
      let bound = '';
      if (on === 'start' ||
          (on === 'both' && amount < 1))
        bound = 'start';
      if ((on === 'end' && amount > 0) ||
          (on === 'both' && amount > 0))
        bound = 'end';
      if (on === 'lead')
        bound = on;
      
      let symbolClass = getSymbolClass(type);
      let classList = updateTypeAmount(typeAmount, type, bound);
      yield spanStr(`${symbolClass}-${bound}`,
                    getSymbolClass('SYMBOL'), ...classList);
    } else {
      let classList = updateTypeAmount(typeAmount);
      yield spanStr(getSymbolClass('TEXT'), ...classList);
    }
    
    startIdx = endIdx;
  }
}

