const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

const vm = require('vm');
const context = {};
const end = scriptContent.indexOf('let currentReplicator = null;');
const code = scriptContent.slice(0, end) + '; var EXPORT_PRESETS = PRESET_REPLICATORS;';
vm.runInNewContext(code, context);

console.log("EXPORT_PRESETS length:", context.EXPORT_PRESETS ? context.EXPORT_PRESETS.length : "null");
if (context.EXPORT_PRESETS) {
  context.EXPORT_PRESETS.forEach((r, i) => {
    console.log(`[${i}] ${r.name}`);
  });
}
