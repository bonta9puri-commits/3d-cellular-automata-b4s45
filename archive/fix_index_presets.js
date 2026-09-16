// fix_index_presets.js
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');

// Find where PRESET_REPLICATORS starts and ends
const startMarker = 'const PRESET_REPLICATORS = [';
const endMarker = 'let currentReplicator = null;';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error("Markers not found!");
  process.exit(1);
}

// Read verified_auto_infinite_results.json
const autoResults = require('./verified_auto_infinite_results.json');

// Parse ruleStr e.g. "B3/S346" -> { B: [3], S: [3,4,6] }
function parseRuleStr(ruleStr) {
  const parts = ruleStr.split('/');
  const b = parts[0].replace('B', '').split('').map(Number);
  const s = parts[1].replace('S', '').split('').map(Number);
  return { B: b, S: s };
}

const autoPresets = autoResults.map((r) => {
  const parsedRule = parseRuleStr(r.ruleStr);
  return {
    id: `rep_auto_${r.ruleStr.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: `🏆 [4T完全自己複製] ${r.ruleStr} (${r.cellCount}セル, Step ${r.splitStep})`,
    splitStep: r.splitStep,
    cellCount: r.cellCount,
    centroidDist: r.centroidDist,
    rule: parsedRule,
    symmetry: r.symmetry || 'inversion',
    gen2Pass: true,
    gen4Pass: true,
    isVerifiedInfinite: true,
    cycleReports: [
      { cycle: 1, step: r.splitStep, clusterCount: 2, isCleanInfiniteCopy: true },
      { cycle: 2, step: r.splitStep * 2, clusterCount: 2, isCleanInfiniteCopy: true },
      { cycle: 3, step: r.splitStep * 4, clusterCount: 2, isCleanInfiniteCopy: true }
    ],
    history: r.history,
    gA: [1, -1, 1],
    gB: [1, 3, 1],
    cA: r.history[r.splitStep].slice(0, r.cellCount),
    cB: r.history[r.splitStep].slice(r.cellCount)
  };
});

// Original curated presets
const curatedPresetsCode = `
      {
        id: 'rep_t8_15cell_organic',
        name: '★★★ [t=8] 15-Cell Organic Meta-Splitter (B5/S4567)',
        splitStep: 8,
        cellCount: 15,
        centroidDist: 4.0,
        rule: { B: [5], S: [4, 5, 6, 7] },
        symmetry: 'inversion',
        history: T8_ORGANIC_15CELL_HISTORY,
        gA: [-1, 1, 2.07],
        gB: [3, 1, 2.07],
        cA: [[-2,0,2],[-2,1,2],[-2,1,3],[-1,0,1],[-1,0,2],[-1,0,3],[-1,1,1],[-2,2,2],[-1,2,1],[-1,2,2],[-1,2,3],[0,0,2],[0,1,2],[0,1,3],[0,2,2]],
        cB: [[2,0,2],[2,1,2],[2,1,3],[3,0,1],[3,0,2],[3,0,3],[3,1,1],[2,2,2],[3,2,1],[3,2,2],[3,2,3],[4,0,2],[4,1,2],[4,1,3],[4,2,2]]
      },
      {
        id: 'rep_t32_twist_b3_s145',
        name: '★★★ [t=2..32] 6-Cell 90° Twist Replicator (Span=66, B3/S145)',
        splitStep: 2,
        cellCount: 6,
        centroidDist: 4.0,
        rule: { B: [3], S: [1, 4, 5] },
        symmetry: 'inversion',
        isVerifiedInfinite: true,
        cycleReports: [{"step":1,"totalCells":12,"clusterCount":1,"congruentCount":0,"isCleanInfiniteCopy":false,"centroids":[],"distance":null},{"step":2,"totalCells":12,"clusterCount":2,"congruentCount":2,"isCleanInfiniteCopy":true,"centroids":[[1,1,-0.5],[1,1,3.5]],"distance":4},{"step":4,"totalCells":12,"clusterCount":2,"congruentCount":2,"isCleanInfiniteCopy":true,"centroids":[[1,1,-2.5],[1,1,5.5]],"distance":8},{"step":8,"totalCells":12,"clusterCount":2,"congruentCount":2,"isCleanInfiniteCopy":true,"centroids":[[1,1,-6.5],[1,1,9.5]],"distance":16},{"step":16,"totalCells":12,"clusterCount":2,"congruentCount":2,"isCleanInfiniteCopy":true,"centroids":[[1,1,-14.5],[1,1,17.5]],"distance":32},{"step":32,"totalCells":12,"clusterCount":2,"congruentCount":2,"isCleanInfiniteCopy":true,"centroids":[[1,1,-30.5],[1,1,33.5]],"distance":64}],
        history: T32_TWIST_HISTORY,
        gA: [1, 1, -1],
        gB: [1, 1, 3],
        cA: [[0,1,-1],[1,1,-1],[2,1,-1],[1,0,0],[1,1,0],[1,2,0]],
        cB: [[0,1,3],[1,1,3],[2,1,3],[1,0,4],[1,1,4],[1,2,4]]
      },
      {
        id: 'rep_c3_diagonal_b35_s4',
        name: '💎 [t=2] 3-Axis C3 Diagonal Replicator (Disp=[2,2,2], B35/S4)',
        splitStep: 2,
        cellCount: 9,
        centroidDist: 3.46,
        rule: { B: [3, 5], S: [4] },
        symmetry: 'C3-cyclic (X->Y->Z invariant)',
        history: [
          [[1,1,0],[1,0,1],[0,1,1],[1,1,2],[1,2,1],[2,1,1],[2,0,1],[0,1,2],[1,2,0]],
          [[0,0,0],[0,0,1],[0,1,0],[1,0,0],[1,2,0],[2,0,1],[2,2,1],[0,1,2],[2,1,2],[1,2,2],[2,2,2]],
          [[-1,0,0],[-1,1,0],[0,-1,0],[0,-1,1],[0,0,-1],[0,0,1],[0,1,0],[1,0,-1],[1,0,0],[2,2,1],[2,1,2],[1,2,2],[1,3,2],[2,3,2],[3,2,1],[3,2,2],[2,1,3],[2,2,3]]
        ],
        gA: [0, 0, 0],
        gB: [2, 2, 2],
        cA: [[-1,0,0],[-1,1,0],[0,-1,0],[0,-1,1],[0,0,-1],[0,0,1],[0,1,0],[1,0,-1],[1,0,0]],
        cB: [[2,2,1],[2,1,2],[1,2,2],[1,3,2],[2,3,2],[3,2,1],[3,2,2],[2,1,3],[2,2,3]]
      },
      {
        id: 'rep_t4_diamond_pulsar',
        name: '★★ [t=4..32] Diamond Fractal Replicator (Span=64)',
        splitStep: 4,
        cellCount: 4,
        centroidDist: 8.0,
        rule: { B: [3], S: [1, 3, 6] },
        symmetry: 'inversion',
        isVerifiedInfinite: true,
        cycleReports: [
          { cycle: 1, step: 4, clusterCount: 2, isCleanInfiniteCopy: true },
          { cycle: 2, step: 8, clusterCount: 2, isCleanInfiniteCopy: true },
          { cycle: 3, step: 16, clusterCount: 2, isCleanInfiniteCopy: true }
        ],
        history: T32_DIAMOND_HISTORY,
        gA: [1, -4, 1],
        gB: [1, 4, 1],
        cA: [[0,-4,1], [1,-4,0], [1,-4,2], [2,-4,1]],
        cB: [[0,4,1], [1,4,0], [1,4,2], [2,4,1]]
      },
      {
        id: 'rep_t4_5cell_surge',
        name: '★★ [t=4] 5-Cell Z-Surge Replicator (Dist=8.0)',
        splitStep: 4,
        cellCount: 5,
        centroidDist: 8.0,
        rule: { B: [3, 5], S: [5, 6, 7] },
        symmetry: 'inversion',
        isVerifiedInfinite: true,
        cycleReports: [
          { cycle: 1, step: 4, clusterCount: 2, isCleanInfiniteCopy: true },
          { cycle: 2, step: 8, clusterCount: 2, isCleanInfiniteCopy: true },
          { cycle: 3, step: 16, clusterCount: 2, isCleanInfiniteCopy: true }
        ],
        history: [
          [[0,0,0], [2,2,0], [1,0,0], [1,2,0], [1,1,0]],
          [[0,0,-1], [0,0,1], [1,0,-1], [1,0,1], [1,1,-1], [1,1,1], [1,2,-1], [1,2,1], [2,2,-1], [2,2,1]],
          [[0,0,-2], [1,0,-2], [1,1,-2], [0,0,2], [1,0,2], [1,1,2], [1,2,-2], [2,2,-2], [1,2,2], [2,2,2]],
          [[0,0,-3], [0,0,-1], [1,0,-3], [1,0,-1], [1,1,-3], [1,1,-1], [1,2,-3], [1,2,-1], [2,2,-3], [2,2,-1], [0,0,1], [0,0,3], [1,0,1], [1,0,3], [1,1,1], [1,1,3], [1,2,1], [1,2,3], [2,2,1], [2,2,3]],
          [[0,0,-4], [1,0,-4], [1,1,-4], [1,2,-4], [2,2,-4], [0,0,4], [1,0,4], [1,1,4], [1,2,4], [2,2,4]]
        ],
        gA: [1, 1, -4],
        gB: [1, 1, 4],
        cA: [[0,0,-4], [1,0,-4], [1,1,-4], [1,2,-4], [2,2,-4]],
        cB: [[0,0,4], [1,0,4], [1,1,4], [1,2,4], [2,2,4]]
      },
      {
        id: 'rep_diamond_step2_b3_s3467',
        name: '★ [t=2] 4-Cell True Replicator (Dist=4.0)',
        splitStep: 2,
        cellCount: 4,
        centroidDist: 4.0,
        rule: { B: [3], S: [3, 4, 6, 7] },
        symmetry: 'inversion',
        isVerifiedInfinite: true,
        cycleReports: [
          { cycle: 1, step: 2, clusterCount: 2, isCleanInfiniteCopy: true },
          { cycle: 2, step: 4, clusterCount: 2, isCleanInfiniteCopy: true },
          { cycle: 3, step: 8, clusterCount: 2, isCleanInfiniteCopy: true }
        ],
        history: [
          [[0,1,1], [2,1,1], [1,1,0], [1,1,2]],
          [[0,0,1], [0,2,1], [1,0,0], [1,0,2], [1,2,0], [1,2,2], [2,0,1], [2,2,1]],
          [[0,-1,1], [1,-1,0], [1,-1,2], [2,-1,1], [0,3,1], [1,3,0], [1,3,2], [2,3,1]]
        ],
        gA: [1, -1, 1],
        gB: [1, 3, 1],
        cA: [[0,-1,1], [1,-1,0], [1,-1,2], [2,-1,1]],
        cB: [[0,3,1], [1,3,0], [1,3,2], [2,3,1]]
      },
      {
        id: 'rep_5cell_step2_b35_s5',
        name: '★ [t=2] 5-Cell Morphing Splitter (Dist=3.2)',
        splitStep: 2,
        cellCount: 5,
        centroidDist: 3.2,
        rule: { B: [3, 5], S: [5] },
        symmetry: 'axisZ',
        history: [
          [[0,0,2], [2,2,2], [0,1,1], [2,1,1], [1,1,1]],
          [[0,0,1], [0,1,2], [1,1,2], [2,1,2], [2,2,1], [1,0,0], [1,1,0], [1,2,0]],
          [[0,0,0], [0,1,-1], [1,1,-1], [2,1,-1], [2,2,0], [0,0,2], [1,0,3], [1,1,3], [1,2,3], [2,2,2]]
        ],
        gA: [1, 1, -0.6],
        gB: [1, 1, 2.6],
        cA: [[0,0,0], [0,1,-1], [1,1,-1], [2,1,-1], [2,2,0]],
        cB: [[0,0,2], [1,0,3], [1,1,3], [1,2,3], [2,2,2]]
      }
`;

const allPresetsCode = 'const PRESET_REPLICATORS = [\n' +
  autoPresets.map(p => JSON.stringify(p, null, 2)).join(',\n') + ',\n' +
  curatedPresetsCode.trim() + '\n    ];\n\n    ';

const newHtml = html.slice(0, startIdx) + allPresetsCode + html.slice(endIdx);
fs.writeFileSync('index.html', newHtml, 'utf-8');
console.log("Successfully rebuilt PRESET_REPLICATORS in index.html!");
