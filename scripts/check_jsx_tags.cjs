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
  if (closing) {
    if (stack.length === 0 || stack[stack.length - 1] !== tag) {
      console.log('mismatch-closing', tag, 'at', m.index);
      break;
    }
    stack.pop();
  } else {
    // ignore self-closing tags like <div ... />
    if (/\/\s*>$/.test(full) || /\/\s*>$/.test(rest)) continue;
    stack.push(tag);
  }
}
console.log('remaining stack (top last):', stack);
if (stack.length > 0) {
  // Find last unmatched opening tag position
  const lastTag = stack[stack.length - 1];
  const idx = s.lastIndexOf('<' + lastTag);
  const before = s.slice(Math.max(0, idx - 120), idx + 120);
  console.log('last unmatched tag:', lastTag);
  console.log('context around last unmatched tag:\n', before);
}
