const MarkType_HTMLClass = new Map([
  ['INIT', 'tag'],
  ['TEXT', ''],
  ['SYMBOL', '-SYMBOL'],
  ['GROUP', '-G'],
  ['CURSOR', '-CURSOR'],
  ['SELECT', '-SELECT'],
]);

function addMarkType(type, className) {
  MarkType_HTMLClass.set(type, className);
}
function getMarkClass(type) {
  return MarkType_HTMLClass.get(type) || '';
}
function addMark(symbol, type, on='both', view=undefined) {
  if (view === undefined)
    view = symbol;
  addSymbol(symbol, {
    type: type,
    on: on,
    raw: symbol,
    view: view,
    scale: view.length / symbol.length
  });
}
function addMarkBetween(type, openingSymbol, closingSymbol) {
  if (closingSymbol === undefined) {
    addMark(openingSymbol, type, on='both');
  } else {
    addMark(openingSymbol, type, on='start');
    addMark(closingSymbol, type, on='end');
  }
}
function addMarkAfter(type, leadingSymbol) {
  addMark(leadingSymbol, type, on='lead');
}
function mkTextObj(text) {
  return {
    type: 'TEXT',
    raw: text,
    view: text,
    scale: 1
  };
}
addMarkType('LINEBREAK', '-BR');
addMark('\n', 'LINEBREAK', '');


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
  let classString = `class="${getMarkClass('INIT')} ${classList}"`;
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
      classList.push(getMarkClass(type));
    
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
    let endIdx = startIdx + textObj.raw.length;
    let spanStr = (...classList) =>
      mkSpanStr(textObj.view, startIdx, endIdx, textObj.scale, ...classList);
    
    if (textObj.type !== 'TEXT') {
      let on = textObj.on;
      let act = on === 'lead' ? 'lead' : 'normal';
      let amount = typeAmount.get(`${textObj.type}@${act}`) || 0;
      
      let bound = '';
      if (on === 'start' ||
          (on === 'both' && amount < 1))
        bound = 'start';
      if ((on === 'end' && amount > 0) ||
          (on === 'both' && amount > 0))
        bound = 'end';
      if (on === 'lead')
        bound = on;
      
      let symbolClass = getMarkClass(textObj.type);
      let classList = updateTypeAmount(typeAmount, textObj.type, bound);
      yield spanStr(`${symbolClass}-${bound}`,
                    getMarkClass('SYMBOL'), ...classList);
    } else {
      let classList = updateTypeAmount(typeAmount);
      yield spanStr(getMarkClass('TEXT'), ...classList);
    }
    
    startIdx = endIdx;
  }
}

