const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

const vm = require('vm');
const context = vm.createContext({});
// Run from start of scriptContent up to let currentReplicator = null;
const endIdx = scriptContent.indexOf('let currentReplicator = null;');
const code = scriptContent.slice(0, endIdx);
vm.runInContext(code, context);

context.PRESET_REPLICATORS.forEach((r, i) => {
  console.log(`[${i}] ID: ${r.id}, Name: ${r.name}`);
  if (!r.rule) console.log("   --> RULE IS MISSING!");
  else console.log(`   Rule: B${r.rule.B}/S${r.rule.S}`);
});
