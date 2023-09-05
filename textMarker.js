function* addEndOf(iterable, end) {
  yield* iterable;
  yield end;
}
function* enumerate(iterable, start=0) {
  let idx = start;
  for (let element of iterable) {
    yield [idx, element];
    idx += 1;
  }
}

class SymbolManager {
  constructor() {
    this.trie = new Map();
    this.dict = new Map();
  }
  take(symbol) {
    if (!this.dict.has(symbol)) {
      let charsLength = this.trieAdd(symbol);
      this.dict.set(symbol, {
        opening: false,
        closing: false,
        alone: false,
        view: undefined,
        charsLength: charsLength
      })
    }
    return this.dict.get(symbol);
  }
  setView(symbol, view) {
    this.take(symbol).view = view;
  }
  trieAdd(symbol) {
    let trie = this.trie;
    let charsLength, char;
    for ([charsLength, char] of enumerate(symbol, 1))
      trie = trie.get(char) || trie.set(char, new Map()).get(char);
    trie.set('END', symbol);
    return charsLength;
  }
}

class MarkManager {
  constructor() {
    this.dict = new Map();
    this.refresh();
  }
  refresh() {
    this.list = [];
    this.amount = new Map();
  }
  take(symbol, mark='-UNDEFINED') {
    if (!this.dict.has(symbol))
      this.dict.set(symbol, {
        mark: mark,
        closedBy: [],
        consume: true
      });
    return this.dict.get(symbol);
  }
  getUnduplicatedList() {
    return Array.from(this.amount.keys(), symbol => this.dict.get(symbol).mark);
  }
  open(symbol) {
    let amount = this.amount.get(symbol) || 0;
    this.amount.set(symbol, amount + 1);
    this.list.push(symbol);
  }
  close(symbol) {
    let notYetClosedMarks = [];
    let closedMarks = [];
    while (this.list.length) {
      let opening = this.list.pop();
      if (!this.take(opening).closedBy.includes(symbol)) {
        notYetClosedMarks.unshift(opening);
        continue;
      }
      this.amountDec(opening);
      closedMarks.push(opening);
      if (this.take(opening).consume)
        break;
    }
    this.list = this.list.concat(notYetClosedMarks);
    return closedMarks;
  }
  amountDec(symbol) {
    let amount = this.amount.get(symbol) || 1;
    this.amount.set(symbol, amount - 1);
    if (amount === 1)
      this.amount.delete(symbol);
  }
}

class ContextManager {
  constructor() {
    this.Symbol = new SymbolManager();
    this.Mark = new MarkManager();
  }
  setSymbolView(symbol, view) {
    this.Symbol.setView(symbol, view);
  }
  addMarkOnly(mark, symbol) {
    this.Symbol.take(symbol).alone = true;
    this.Mark.take(symbol, mark);
  }
  addMarkBetween(mark, opening, closing=opening, consume=true) {
    this.Symbol.take(opening).opening = true;
    this.Symbol.take(closing).closing = true;
    this.Mark.take(opening, mark).closedBy.push(closing);
    if (!consume)
      this.Mark.take(opening).consume = false;
  }
  addMarkAfter(mark, leading, closedBySpace=false) {
    this.addMarkBetween(mark, leading, '\n', false);
    if (closedBySpace)
      this.addMarkBetween(mark, leading, ' ', false);
  }
}


function mkTextObj(content, offset, symbolId) {
  return {
    isSymbol: symbolId === undefined,
    symbolId: symbolId,
    raw: content,
    view: content,
    offset: offset
  };
}
function newBranch(trie, index, offset) {
  return {
    currentNode: trie,
    achieved: undefined,
    offset: offset,
    currentText: '',
    index: index,
    currentCharsLength: 0,
    alive: true
  };
}
function walkBranches(branchList, char) {
  for (let [bIdx, branch] of enumerate(branchList)) {
    if (!branch.alive) continue;
    if (!branch.currentNode.has(char)) {
      branch.alive = false;
      continue;
    }
    branch.currentNode = branch.currentNode.get(char);
    branch.currentText += char;
    branch.currentCharsLength += 1;
    if (branch.currentNode.has('END')) {
      branch.achieved = {
        symbolId: branch.currentNode.get('END'),
        text: branch.currentText,
        charsLength: branch.currentCharsLength
      };
      branchList.splice(bIdx + 1);  // remove the rest of the list
    }
  }
  return branchList;
}
function* checkBranches(branchList, buffer, index, offset) {
  while (branchList.length && !branchList[0].alive) {
    let branch = branchList.shift();
    if (branch.achieved === undefined) continue;
    if (branch.index > index) {
      let text = buffer.splice(0, branch.index - index).join('');
      yield mkTextObj(text, offset);
    }
    buffer.splice(0, branch.achieved.charsLength);
    index = branch.index + branch.achieved.charsLength;
    offset = branch.offset + branch.achieved.text.length;
    yield mkTextObj(branch.achieved.text, branch.offset, branch.achieved.symbolId);
  }
  return [branchList, buffer, index, offset];
}
function* textObjGenerator(symbolManager, charGenerator) {
  let branchList = [];
  let buffer = [];
  let index = 0;   // index of buffer[0] in the whole content ([...str])
  let offset = 0;  // index of buffer[0] in the whole content (str)
  let currOffset = 0;
  charGenerator = addEndOf(charGenerator, '');
  for (let [currIndex, char] of enumerate(charGenerator)) {
    buffer.push(char);
    if (symbolManager.trie.has(char))
      branchList.push(newBranch(symbolManager.trie, currIndex, currOffset));
    currOffset = currOffset + char.length;
    branchList = walkBranches(branchList, char);
    [branchList, buffer, index, offset] = yield* checkBranches(branchList, buffer, index, offset);
  }
  yield mkTextObj(buffer.join(''), offset);
}


function mkTextMark(textObj, markList) {
  textObj.markList = markList;
  return textObj;
}
function* textMarkGenerator(ctxManager, charGenerator) {
  ctxManager.Mark.refresh();
  for (let textObj of textObjGenerator(ctxManager.Symbol, charGenerator)) {
    if (!textObj.isSymbol) {
      yield mkTextMark(textObj, ctxManager.Mark.getUnduplicatedList());
      continue;
    }
    let markList = [];
    let symbol = textObj.symbolId;
    let symbolData = ctxManager.Symbol.take(symbol);
    if (symbolData.view)
      textObj.view = symbolData.view;
    if (symbolData.alone)
      markList.push(`${ctxManager.Mark.take(symbol).mark}`);
    if (symbolData.closing) {
      for (let opening of ctxManager.Mark.close(symbol))
        markList.push(`${ctxManager.Mark.take(opening).mark}-end`);
    }
    let symbolUsed = markList.length > 0;
    markList = markList.concat(ctxManager.Mark.getUnduplicatedList());
    if (!symbolUsed && symbolData.opening) {
      ctxManager.Mark.open(symbol);
      markList.push(`${ctxManager.Mark.take(symbol).mark}-start`);
    }
    yield mkTextMark(textObj, markList);
  }
}
