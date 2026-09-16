const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

const vm = require('vm');
const context = vm.createContext({
  console: console
});

const start = scriptContent.indexOf('const PRESET_REPLICATORS = [');
const end = scriptContent.indexOf('let currentReplicator = null;');
const code = scriptContent.slice(start, end);

try {
  vm.runInContext(code, context);
  console.log("context.PRESET_REPLICATORS is:", typeof context.PRESET_REPLICATORS);
  if (context.PRESET_REPLICATORS) {
    console.log("Length:", context.PRESET_REPLICATORS.length);
  }
} catch (e) {
  console.error("Evaluation error:", e);
}
