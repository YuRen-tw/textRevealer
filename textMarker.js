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

const SymbolTrie = new Map();
const SymbolMap = new Map();
const MarkMap = new Map();

function mkSymbol(symbol) {
  if (SymbolMap.has(symbol)) return;
  SymbolMap.set(symbol, {
    isSymbol: true,
    canOpening: false,
    canClosing: false,
    multipleClosing: false,
    content: symbol
  });
  
  let Trie = SymbolTrie;
  for (let char of symbol) {
    if (!Trie.has(char))
      Trie.set(char, new Map());
    Trie = Trie.get(char);
  }
  Trie.set('END', symbol);
}
function mkMarkBetween(mark, opening, closing, canClosingMultiple) {
  if (closing === undefined)
    closing = opening;
  
  mkSymbol(opening);
  mkSymbol(closing);
  SymbolMap.get(opening).canOpening = true;
  SymbolMap.get(closing).canClosing = true;
  
  if (canClosingMultiple)
    SymbolMap.get(closing).multipleClosing = true;
  
  if (!MarkMap.has(opening))
    MarkMap.set(opening, {
      mark: mark,
      closedBy: []
    });
  MarkMap.get(opening).closedBy.push(closing);
}

function mkTextObj(text) {
  return {
    isSymbol: false,
    content: text,
  };
}
function* textObjGen(charGen) {
  let charList = [];
  let branchList = [];
  let charListHeadIdx = 0;
  
  charGen = addEndOf(charGen, '');
  for (let [charIdx, char] of enumerate(charGen)) {
    charList.push(char);
    
    if (SymbolTrie.has(char))
      branchList.push({
        currTrie: SymbolTrie,
        END: undefined,
        startIdx: charIdx,
        alive: true
      });
    for (let [bIdx, branch] of enumerate(branchList)) {
      if (!branch.alive) continue;
      
      if (branch.currTrie.has(char)) {
        branch.currTrie = branch.currTrie.get(char);
        if (branch.currTrie.has('END')) {
          branch.END = branch.currTrie.get('END');
          branchList.splice(bIdx + 1);
        }
      } else {
        branch.alive = false;
      }
    }
    
    while (branchList.length && !branchList[0].alive) {
      let branch = branchList.shift();
      if (branch.END === undefined) continue;
      let textLength = branch.startIdx - charListHeadIdx;
      if (textLength > 0)
        yield mkTextObj(charList.splice(0, textLength).join(''));
      charList.splice(0, branch.END.length);
      charListHeadIdx = branch.startIdx + branch.END.length;
      yield SymbolMap.get(branch.END);
    }
  }
  yield mkTextObj(charList.join(''));
}


function getMarkList(markAmount) {
  let result = [];
  for (let [opening, amount] of markAmount)
      if (amount > 0)
        result.push(MarkMap.get(opening).mark);
  return result
}
function addMarkAmount(markAmount, opening, add) {
  let amount = markAmount.get(opening) || 0;
  if (add >= 0 || amount >= -add)
    markAmount.set(opening, amount + add);
  else
    markAmount.set(opening, 0);
}

function mkTextMark(textObj, marks) {
  return {
    isSymbol: textObj.isSymbol,
    content: textObj.content,
    marks: marks
  }
}
function* textMarkGenerator(charGen) {
  let markAmount = new Map();
  let markStack = [];
  
  for (let textObj of textObjGen(charGen)) {
    if (textObj.isSymbol) {
      let markList = [];
      let done = false;
      
      if (textObj.canClosing) {
        let closing = textObj.content;
        let notYetClosedMarkStack = [];
        while (!done && markStack.length > 0) {
          let opening = markStack.pop();
          if (MarkMap.get(opening).closedBy.includes(closing)) {
            addMarkAmount(markAmount, opening, -1);
            markList.push(`${MarkMap.get(opening).mark}-end`);
            if (!textObj.multipleClosing)
              done = true;
          } else {
            notYetClosedMarkStack.unshift(opening);
          }
        }
        markStack = markStack.concat(notYetClosedMarkStack);
        if (markList.length > 0)
          done = true;
      }
      markList = markList.concat(getMarkList(markAmount));
      if (!done && textObj.canOpening) {
        let opening = textObj.content;
        markStack.push(opening);
        addMarkAmount(markAmount, opening, 1);
        markList.push(`${MarkMap.get(opening).mark}-start`);
      }
      yield mkTextMark(textObj, markList);
    } else {
      yield mkTextMark(textObj, getMarkList(markAmount));
    }
  }
}
