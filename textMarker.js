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

function letSymbol(symbol) {
  if (!SymbolMap.has(symbol)) {
    SymbolMap.set(symbol, {
      isSymbol: true,
      opening: false,
      closing: false,
      multiClosing: false,
      alone: false
    });
    
    let Trie = SymbolTrie;
    for (let char of symbol) {
      if (!Trie.has(char))
        Trie.set(char, new Map());
      Trie = Trie.get(char);
    }
    Trie.set('END', symbol);
  }
  return SymbolMap.get(symbol);
}
function letMark(mark, symbol) {
  if (!MarkMap.has(symbol))
    MarkMap.set(symbol, {
      mark: mark,
      closedBy: []
    });
  return MarkMap.get(symbol);
}
function mkMarkOnly(mark, symbol) {
  letSymbol(symbol).alone = true;
  letMark(mark, symbol);
}
function mkMarkBetween(mark, opening, closing, multiClosing) {
  if (closing === undefined)
    closing = opening;
  
  letSymbol(opening).opening = true;
  letSymbol(closing).closing = true;
  if (multiClosing)
    letSymbol(closing).multiClosing = true;
  letMark(mark, opening).closedBy.push(closing);
}

function mkTextObj(content, startIdx, isSymbol=false) {
  return {
    isSymbol: isSymbol,
    content: content,
    startIdx: startIdx,
    endIdx: startIdx + content.length,
    length: content.length
  };
}
function* textObjGenerator(charGenerator) {
  let temp = [];
  let tempHeadIdx = 0;
  let branchList = [];
  
  charGenerator = addEndOf(charGenerator, '');
  for (let [charIdx, char] of enumerate(charGenerator)) {
    temp.push(char);
    
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
      if (branch.startIdx > tempHeadIdx) {
        let text = temp.splice(0, branch.startIdx - tempHeadIdx).join('')
        yield mkTextObj(text, tempHeadIdx);
      }
      temp.splice(0, branch.END.length);
      tempHeadIdx = branch.startIdx + branch.END.length;
      yield mkTextObj(branch.END, branch.startIdx, true);
    }
  }
  yield mkTextObj(temp.join(''), tempHeadIdx);
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
  textObj.marks = marks;
  return textObj;
}
function* textMarkGenerator(charGenerator) {
  let markAmount = new Map();
  let markStack = [];
  
  for (let textObj of textObjGenerator(charGenerator)) {
    if (textObj.isSymbol) {
      let markList = [];
      let done = false;
      let symbolData = SymbolMap.get(textObj.content);
      
      if (symbolData.alone) {
        markList.push(`${MarkMap.get(textObj.content).mark}`);
      }
      if (symbolData.closing) {
        let closing = textObj.content;
        let notYetClosedMarkStack = [];
        while (!done && markStack.length > 0) {
          let opening = markStack.pop();
          if (MarkMap.get(opening).closedBy.includes(closing)) {
            addMarkAmount(markAmount, opening, -1);
            markList.push(`${MarkMap.get(opening).mark}-end`);
            if (!symbolData.multiClosing)
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
      if (!done && symbolData.opening) {
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
