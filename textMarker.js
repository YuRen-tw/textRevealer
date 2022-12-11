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
      let [trie, charsLength] = this.trieAdd(symbol);
      this.dict.set(symbol, {
        opening: false,
        closing: false,
        alone: false,
        raw: symbol,
        view: symbol,
        charsLength: charsLength
      })
      trie.set('END', this.dict.get(symbol));
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
    return [trie, charsLength];
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


function mkTextObj(content, offset, isSymbol=false, view=content) {
  return {
    isSymbol: isSymbol,
    raw: content,
    view: view,
    offset: offset
  };
}
function newBranch(trie, index, offset) {
  return {
    currentTrie: trie,
    END: undefined,
    offset: offset,
    index: index,
    alive: true
  };
}
function walkBranches(branchList, char) {
  for (let [bIdx, branch] of enumerate(branchList)) {
    if (!branch.alive) continue;
    if (!branch.currentTrie.has(char)) {
      branch.alive = false;
      continue;
    }
    branch.currentTrie = branch.currentTrie.get(char);
    if (branch.currentTrie.has('END')) {
      branch.END = branch.currentTrie.get('END');
      branchList.splice(bIdx + 1);  // remove the rest of the list
    }
  }
}
function* checkBranches(branchList, buffer, index, offset) {
  while (branchList.length && !branchList[0].alive) {
    let branch = branchList.shift();
    if (branch.END === undefined) continue;
    if (branch.index > index) {
      let text = buffer.splice(0, branch.index - index).join('')
      yield mkTextObj(text, offset);
    }
    let symbolData = branch.END;
    buffer.splice(0, symbolData.charsLength);
    index = branch.index + symbolData.charsLength;
    offset = branch.offset + symbolData.raw.length;
    yield mkTextObj(symbolData.raw, branch.offset, true, symbolData.view);
  }
  return [index, offset];
}
function* textObjGenerator(trie, charGenerator) {
  let branchList = [];
  let buffer = [];
  let index = 0;   // index of buffer[0] in the whole content ([...str])
  let offset = 0;  // index of buffer[0] in the whole content (str)
  let currOffset = 0;
  charGenerator = addEndOf(charGenerator, '');
  for (let [currIndex, char] of enumerate(charGenerator)) {
    buffer.push(char);
    if (trie.has(char))
      branchList.push(newBranch(trie, currIndex, currOffset));
    currOffset = currOffset + char.length;
    walkBranches(branchList, char);
    [index, offset] = yield* checkBranches(branchList, buffer, index, offset);
  }
  yield mkTextObj(buffer.join(''), offset);
}


function mkTextMark(textObj, markList) {
  textObj.markList = markList;
  return textObj;
}
function* textMarkGenerator(Context, charGenerator) {
  Context.Mark.refresh();
  for (let textObj of textObjGenerator(Context.Symbol.trie, charGenerator)) {
    if (!textObj.isSymbol) {
      yield mkTextMark(textObj, Context.Mark.getUnduplicatedList());
      continue;
    }
    let markList = [];
    let symbol = textObj.raw;
    let symbolData = Context.Symbol.take(symbol);
    if (symbolData.alone)
      markList.push(`${Context.Mark.take(symbol).mark}`);
    if (symbolData.closing) {
      for (let opening of Context.Mark.close(symbol))
        markList.push(`${Context.Mark.take(opening).mark}-end`);
    }
    let symbolUsed = markList.length > 0;
    markList = markList.concat(Context.Mark.getUnduplicatedList());
    if (!symbolUsed && symbolData.opening) {
      Context.Mark.open(symbol);
      markList.push(`${Context.Mark.take(symbol).mark}-start`);
    }
    yield mkTextMark(textObj, markList);
  }
}
