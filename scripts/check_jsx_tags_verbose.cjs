const fs = require('fs');
const path = process.argv[2] || 'src/components/GameRoom.tsx';
const s = fs.readFileSync(path, 'utf8');
const re = /<\s*(\/?)\s*([A-Za-z0-9_:-]+)([^>]*)>/g;
let m;
const stack = [];
while ((m = re.exec(s))) {
  const closing = m[1];
  const tag = m[2];
  const rest = m[3];
  const full = m[0];
  const line = s.slice(0, m.index).split('\n').length;
  if (closing) {
    if (stack.length === 0 || stack[stack.length - 1].tag !== tag) {
      console.log('mismatch-closing', tag, 'at index', m.index, 'line', line);
      break;
    }
    stack.pop();
  } else {
    // ignore self-closing tags like <div ... />
    if (/\/\s*>$/.test(full) || /\/\s*>$/.test(rest)) continue;
    stack.push({ tag, line, index: m.index });
  }
}
console.log('remaining stack (top last):', stack.map(x => x.tag));
if (stack.length > 0) {
  const last = stack[stack.length - 1];
  console.log('last unmatched tag:', last.tag, 'at line', last.line, 'index', last.index);
  const idx = Math.max(0, last.index - 120);
  const context = s.slice(idx, last.index + 120);
  console.log('context around last unmatched tag:\n', context);
}
