const SymbolType_HTMLClass = new Map([
  ['INIT', 'tag'],
  ['TEXT', ''],
  ['SYMBOL', '-SYMBOL'],
  ['GROUP', '-G'],
  ['CURSOR', '-CURSOR'],
  ['SELECT', '-SELECT'],
]);

function addSymbolType(type, className) {
  SymbolType_HTMLClass.set(type, className);
}
function getSymbolClass(type) {
  return SymbolType_HTMLClass.get(type) || '';
}
function addSymbol(symbol, type, on='both', view=undefined) {
  if (view === undefined)
    view = symbol;
  SymbolTrieInsert(symbol, {
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
addSymbolType('LINEBREAK', '-BR');
addSymbol('\n', 'LINEBREAK', '');


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
              `data-content="${toHTML(inner)}"`);
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

function* spanStrGenerator(charGen) {
  let typeAmount = new Map();
  let startIdx = 0;
  
  for (let textObj of textObjGen(charGen, mkTextObj)) {
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

