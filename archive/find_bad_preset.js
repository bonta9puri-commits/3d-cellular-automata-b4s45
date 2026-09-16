const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

const vm = require('vm');
const context = vm.createContext({});
const startIdx = scriptContent.indexOf('const PRESET_REPLICATORS = [');
const endIdx = scriptContent.indexOf('let currentReplicator = null;');
const code = scriptContent.slice(startIdx, endIdx);
vm.runInContext(code, context);

context.PRESET_REPLICATORS.forEach((r, i) => {
  if (!r.rule || !r.rule.B || !r.rule.S) {
    console.log(`Bad preset at index ${i}:`, r.id, r.name, r.rule);
  } else {
    console.log(`OK [${i}]:`, r.name, 'rule:', r.rule);
  }
});
