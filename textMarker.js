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

function addSymbol(symbol, item) {
  SymbolMap.set(symbol, item);
  
  let Trie = SymbolTrie;
  for (let char of symbol) {
    if (!Trie.has(char))
      Trie.set(char, new Map());
    Trie = Trie.get(char);
  }
  Trie.set('END', symbol);
}

function* textObjGen(charGen, mkTextObj) {
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

