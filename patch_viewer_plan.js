// update_t8_viewer_with_offset_toggle.js
const fs = require('fs');
let html = fs.readFileSync('t8_organic_viewer.html', 'utf-8');

// We want to add an interactive toggle button:
// "🚀 中央クリア (+2拡張で孫分裂)"
// When ON: at t=8, the clusters are cleared with +2 separation, and the timeline shows t=8..16 splitting cleanly into 4 clones!
console.log("Adding interactive 'Central Separation / Grandchild Split' mode to t8 viewer...");
