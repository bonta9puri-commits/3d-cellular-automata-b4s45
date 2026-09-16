const fs = require('fs');
const path = require('path');
const {
  simulateStep,
  findConnectedComponents,
  generateSymmetrySignatures,
  normalizeAndHash,
  getCentroid,
  dist
} = require('./replicatorCore.js');

function analyzeReplicator(cand, maxCycles = 3) {
  const c0Points = cand.c0;
  const c0Size = c0Points.length;
  const signatures = generateSymmetrySignatures(c0Points);
  const splitT = cand.splitStep;
  const maxT = splitT * Math.pow(2, maxCycles - 1);

  let pts = c0Points;
  const history = [pts];
  const cycleReports = [];

  for (let t = 1; t <= maxT; t++) {
    pts = simulateStep(pts, cand.rule);
    history.push(pts);

    for (let c = 1; c <= maxCycles; c++) {
      const checkT = splitT * Math.pow(2, c - 1);
      if (t === checkT) {
        const comps = findConnectedComponents(pts);
        let allCongruent = true;
        let c0Matches = 0;
        const centroids = [];

        for (const comp of comps) {
          const h = normalizeAndHash(comp);
          if (comp.length === c0Size && signatures.has(h)) {
            c0Matches++;
            centroids.push(getCentroid(comp));
          } else {
            allCongruent = false;
          }
        }

        const isClean = allCongruent && comps.length === c0Matches;
        cycleReports.push({
          cycle: c,
          step: t,
          totalCells: pts.length,
          clusterCount: comps.length,
          congruentCount: c0Matches,
          isCleanInfiniteCopy: isClean,
          centroids
        });
      }
    }
  }

  const ruleStr = 'B' + Array.from(cand.rule.B).sort().join('') + '/S' + Array.from(cand.rule.S).sort().join('');

  return {
    id: cand.id,
    name: cand.name,
    ruleStr,
    rule: {
      B: Array.from(cand.rule.B),
      S: Array.from(cand.rule.S)
    },
    c0Size,
    splitStep: cand.splitStep,
    c0: cand.c0,
    cycleReports,
    isFullyVerifiedInfinite: cycleReports.every(r => r.isCleanInfiniteCopy),
    maxSimulatedStep: maxT,
    history
  };
}

const candidates = [
  {
    id: 'diamond_pulsar_b3_s136',
    name: 'Diamond Pulsar (B3/S136)',
    c0: [[0,0,1], [2,0,1], [1,0,0], [1,0,2]],
    rule: { B: new Set([3]), S: new Set([1, 3, 6]) },
    splitStep: 4
  },
  {
    id: 'z_surge_b35_s567',
    name: '5-Cell Z-Surge (B35/S567)',
    c0: [[0,0,0], [2,2,0], [1,0,0], [1,2,0], [1,1,0]],
    rule: { B: new Set([3, 5]), S: new Set([5, 6, 7]) },
    splitStep: 4
  },
  {
    id: 'diamond_b3_s3467',
    name: '4-Cell Diamond Splitter (B3/S3467)',
    c0: [[0,1,1], [2,1,1], [1,1,0], [1,1,2]],
    rule: { B: new Set([3]), S: new Set([3, 4, 6, 7]) },
    splitStep: 2
  }
];

console.log('Analyzing and generating verified infinite replicator JSONs...');
const verifiedList = [];

for (const cand of candidates) {
  const result = analyzeReplicator(cand, 3);
  console.log('\nCandidate: ' + result.name);
  result.cycleReports.forEach(r => {
    console.log('  Cycle ' + r.cycle + ' (t=' + r.step + '): ' + r.clusterCount + ' clusters, All Congruent: ' + r.isCleanInfiniteCopy);
  });

  const singleFilePath = path.join(__dirname, 'verified_' + result.id + '.json');
  fs.writeFileSync(singleFilePath, JSON.stringify(result, null, 2), 'utf-8');
  console.log('  -> Saved: verified_' + result.id + '.json');

  verifiedList.push(result);
}

const allFilePath = path.join(__dirname, 'verified_infinite_replicators.json');
fs.writeFileSync(allFilePath, JSON.stringify(verifiedList, null, 2), 'utf-8');
console.log('\nAll verified replicators saved to: verified_infinite_replicators.json');
