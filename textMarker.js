class StringDimension {
  constructor(logical=0, physical=0) {
    this.logical = logical;  // [...string].length
    this.physical = physical;  // string.length
  }
  static plus(x, y) {
    return new StringDimension(
      x.logical + y.logical,
      x.physical + y.physical
    );
  }
  static addChar(x, char) {
    return new StringDimension(
      x.logical + 1,
      x.physical + char.length
    );
  }
}

function* charIterator(string, end=true) {
  let index = new StringDimension();
  for (let char of string) {
    yield [index, char];
    index = StringDimension.addChar(index, char);
  }
  if (end)
    yield [index, ''];
}


class SymbolManager {
  constructor() {
    this.trie = new Map();
    this.dict = new Map();
  }
  take(symbol) {
    if (!this.dict.has(symbol)) {
      this.trieAdd(symbol);
      this.dict.set(symbol, {
        opening: false,
        closing: false,
        alone: false,
        view: undefined
      })
    }
    return this.dict.get(symbol);
  }
  setView(symbol, view) {
    this.take(symbol).view = view;
  }
  trieAdd(symbol) {
    let trie = this.trie;
    for (let char of symbol)
      trie = trie.get(char) || trie.set(char, new Map()).get(char);
    trie.set('END', symbol);
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


function mkTextObj(rawContent, start, symbolId) {
  return {
    isSymbol: symbolId !== undefined,
    symbolId: symbolId,
    raw: rawContent,
    view: rawContent,
    start: start
  };
}
function newBranch(trie, start) {
  return {
    currNode: trie,
    achieved: undefined,
    start: start,
    currText: '',
    currTextLength: new StringDimension(),
    inactive: false
  };
}
function walkBranches(branchList, char) {
  let nextBranchList = [];
  for (let branch of branchList) {
    if (!branch.currNode.has(char))
      branch.inactive = true;
    if (branch.inactive) {
      if (branch.achieved !== undefined)
        nextBranchList.push(branch);
      continue;
    }
    nextBranchList.push(branch);
    branch.currNode = branch.currNode.get(char);
    branch.currText += char;
    branch.currTextLength = StringDimension.addChar(branch.currTextLength, char);
    if (branch.currNode.has('END')) {
      branch.achieved = {
        symbolId: branch.currNode.get('END'),
        text: branch.currText,
        textLength: branch.currTextLength
      };
      break;  // we don't need the branches in the rest of the list
    }
  }
  return nextBranchList;
}
function* checkBranches(branchList, buffer) {
  while (branchList.length && branchList[0].inactive) {
    let branch = branchList.shift();
    let prefixLength = branch.start.logical - buffer.start.logical;
    if (prefixLength > 0) {
      let text = buffer.chars.splice(0, prefixLength).join('');
      yield mkTextObj(text, buffer.start);
    }
    buffer.chars.splice(0, branch.achieved.textLength.logical);
    buffer.start = StringDimension.plus(branch.start, branch.achieved.textLength);
    yield mkTextObj(branch.achieved.text, branch.start, branch.achieved.symbolId);
  }
  return [branchList, buffer];
}
function* textObjGenerator(symbolManager, wholeContent) {
  let branchList = [];
  let buffer = {
    chars: [],
    start: new StringDimension(),
  };
  for (let [index, char] of charIterator(wholeContent)) {
    buffer.chars.push(char);
    if (symbolManager.trie.has(char))
      branchList.push(newBranch(symbolManager.trie, index));
    branchList = walkBranches(branchList, char);
    [branchList, buffer] = yield* checkBranches(branchList, buffer);
  }
  let remainder = buffer.chars.join('');
  if (remainder.length > 0)
    yield mkTextObj(remainder, buffer.start);
}


function mkTextMark(textObj, markList) {
  textObj.markList = markList;
  textObj.startOffset = textObj.start.physical;
  return textObj;
}
function* textMarkGenerator(ctxManager, wholeContent) {
  ctxManager.Mark.refresh();
  for (let textObj of textObjGenerator(ctxManager.Symbol, wholeContent)) {
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
