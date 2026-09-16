const fs = require('fs');
const path = require('path');

const data32 = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified_twist_b3_s145_t32.json'), 'utf-8'));
let indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');

// Define T32_TWIST_HISTORY string
const twistHistoryCode = `    // Precomputed t=0..32 history for B3/S145 90-degree twist replicator
    const T32_TWIST_HISTORY = ${JSON.stringify(data32.history)};
`;

// Insert before PRESET_REPLICATORS
const targetAnchor = '    const PRESET_REPLICATORS = [';
indexHtml = indexHtml.replace(targetAnchor, twistHistoryCode + targetAnchor);

// Replace rep_t8_6cell_beam with full t=32 version
const oldPresetAnchor = "id: 'rep_t8_6cell_beam',";
const newPresetEntry = `id: 'rep_t32_twist_b3_s145',
        name: '★★★ [t=2..32] 6-Cell 90° Twist Replicator (Span=66, B3/S145)',
        splitStep: 2,
        cellCount: 6,
        centroidDist: 4.0,
        rule: { B: [3], S: [1, 4, 5] },
        symmetry: 'inversion',
        isVerifiedInfinite: true,
        cycleReports: ${JSON.stringify(data32.cycleReports)},
        history: T32_TWIST_HISTORY,
        gA: [1, 1, -1],
        gB: [1, 1, 3],
        cA: [[0,1,-1],[1,1,-1],[2,1,-1],[1,0,0],[1,1,0],[1,2,0]],
        cB: [[0,1,3],[1,1,3],[2,1,3],[1,0,4],[1,1,4],[1,2,4]]
      },
      /* old preset removed */ {
        id: 'rep_t8_deprecated',
        splitStep: 999, cellCount: 0, centroidDist: 0, rule: {B:[],S:[]}, history: []`;

// Note: let's replace the whole rep_t8_6cell_beam block cleanly
const blockStart = indexHtml.indexOf("id: 'rep_t8_6cell_beam'");
if (blockStart !== -1) {
  const blockEnd = indexHtml.indexOf("id: 'rep_t4_diamond_pulsar'", blockStart);
  if (blockEnd !== -1) {
    const prevBlock = indexHtml.substring(blockStart, blockEnd);
    // Find the closing brace of that object
    const lastBrace = prevBlock.lastIndexOf("},");
    const toReplace = prevBlock.substring(0, lastBrace + 2);
    
    const replacement = `id: 'rep_t32_twist_b3_s145',
        name: '★★★ [t=2..32] 6-Cell 90° Twist Replicator (Span=66, B3/S145)',
        splitStep: 2,
        cellCount: 6,
        centroidDist: 4.0,
        rule: { B: [3], S: [1, 4, 5] },
        symmetry: 'inversion',
        isVerifiedInfinite: true,
        cycleReports: ${JSON.stringify(data32.cycleReports)},
        history: T32_TWIST_HISTORY,
        gA: [1, 1, -1],
        gB: [1, 1, 3],
        cA: [[0,1,-1],[1,1,-1],[2,1,-1],[1,0,0],[1,1,0],[1,2,0]],
        cB: [[0,1,3],[1,1,3],[2,1,3],[1,0,4],[1,1,4],[1,2,4]]
      },`;
      
    indexHtml = indexHtml.replace(toReplace, replacement);
    fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml, 'utf-8');
    console.log('Successfully updated index.html with T32_TWIST_HISTORY!');
  }
}
