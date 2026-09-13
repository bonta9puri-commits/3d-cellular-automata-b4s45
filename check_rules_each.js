const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

const vm = require('vm');
const context = {};
const end = scriptContent.indexOf('let currentReplicator = null;');
const code = scriptContent.slice(0, end) + '; var EXPORT_PRESETS = PRESET_REPLICATORS;';
vm.runInNewContext(code, context);

context.EXPORT_PRESETS.forEach((r, i) => {
  if (!r.rule) {
    console.log(`ERROR at [${i}]: r.rule is undefined! Preset:`, r.name);
  } else if (!r.rule.B || !r.rule.S) {
    console.log(`ERROR at [${i}]: r.rule.B or S is undefined! Preset:`, r.name, r.rule);
  } else {
    console.log(`OK [${i}]: ${r.name} -> B${r.rule.B.join('')}/S${r.rule.S.join('')}`);
  }
});
