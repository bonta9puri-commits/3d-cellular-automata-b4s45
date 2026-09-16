// searchTrueXYZ.js - Dedicated Search for 3-Phase Spiral & Orthogonal 3-Axis Cascade (X -> Y -> Z)
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
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

function getDominantAxis(points) {
  let minX=Infinity, maxX=-Infinity;
  let minY=Infinity, maxY=-Infinity;
  let minZ=Infinity, maxZ=-Infinity;
  for (const p of points) {
    if (p[0]<minX) minX=p[0]; if (p[0]>maxX) maxX=p[0];
    if (p[1]<minY) minY=p[1]; if (p[1]>maxY) maxY=p[1];
    if (p[2]<minZ) minZ=p[2]; if (p[2]>maxZ) maxZ=p[2];
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dz = maxZ - minZ;

  if (dx > dy && dx > dz) return 'X';
  if (dy > dx && dy > dz) return 'Y';
  if (dz > dx && dz > dy) return 'Z';
  return '=';
}

// Generate 3D Chiral Helix and Tripod Seeds
function generateChiralCandidateSeed() {
  const mode = Math.random();
  const points = new Set();
  const add = (x, y, z) => points.add(`${x},${y},${z}`);

  if (mode < 0.4) {
    // 3-Phase Helix: 3 segments along X, then Y, then Z
    const len = 2 + Math.floor(Math.random() * 2);
    let x=0, y=0, z=0;
    add(x,y,z);
    for (let i=0; i<len; i++) { x++; add(x,y,z); }
    for (let i=0; i<len; i++) { y++; add(x,y,z); }
    for (let i=0; i<len; i++) { z++; add(x,y,z); }
    // Optional branch
    if (Math.random() > 0.5) add(x+1, y, z);
  } else if (mode < 0.7) {
    // Tripod with chiral offsets
    add(1, 1, 1);
    add(0, 1, 1); add(2, 1, 1); // X-arm
    add(1, 0, 1); add(1, 2, 1); // Y-arm
    add(1, 1, 0); add(1, 1, 2); // Z-arm
    // Break symmetry chirally: (2, 2, 1), (1, 2, 2), (2, 1, 2)
    const chiralFlag = Math.floor(Math.random() * 3);
    if (chiralFlag === 0) { add(2, 2, 1); add(1, 2, 2); add(2, 1, 2); }
    else if (chiralFlag === 1) { add(2, 2, 1); }
    else { add(2, 1, 0); add(0, 2, 1); }
  } else {
    // 3D twisted cross / staircase
    const size = 5 + Math.floor(Math.random() * 6);
    let cx = 1, cy = 1, cz = 1;
    add(cx, cy, cz);
    const dirs = [[1,0,0], [0,1,0], [0,0,1]];
    for (let s = 0; s < size; s++) {
      const d = dirs[s % 3];
      cx += d[0]; cy += d[1]; cz += d[2];
      add(cx, cy, cz);
    }
  }

  const result = Array.from(points).map(k => k.split(',').map(Number));
  if (result.length < 4 || result.length > 16) return generateChiralCandidateSeed();
  return result;
}

if (!isMainThread) {
  const { maxTrials } = workerData;
  let trials = 0;
  const bPool = [2, 3, 4, 5, 6];
  const sPool = [1, 2, 3, 4, 5, 6, 7];

  while (trials < maxTrials) {
    trials++;
    const c0 = generateChiralCandidateSeed();
    const c0Size = c0.length;

    const comps0 = findConnectedComponents(c0);
    if (comps0.length !== 1) continue;

    const bSample = bPool.filter(() => Math.random() < 0.35);
    const sSample = sPool.filter(() => Math.random() < 0.35);
    if (bSample.length === 0) bSample.push(3);
    if (sSample.length === 0) sSample.push(4);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    const signatures = generateSymmetrySignatures(c0);
    let pts = c0;
    const history = [pts];
    const axisHistory = [getDominantAxis(pts)];

    for (let t = 1; t <= 12; t++) {
      pts = simulateStep(pts, rule);
      history.push(pts);
      axisHistory.push(getDominantAxis(pts));

      if (pts.length === 0 || pts.length > 8 * c0Size) break;

      // Check if replication occurred
      if (t >= 2 && pts.length === 2 * c0Size) {
        const comps = findConnectedComponents(pts);
        if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
          const hA = normalizeAndHash(comps[0]);
          const hB = normalizeAndHash(comps[1]);
          if (signatures.has(hA) && signatures.has(hB)) {
            const gA = getCentroid(comps[0]);
            const gB = getCentroid(comps[1]);
            const d = dist(gA, gB);
            if (d >= 2.5) {
              // Analyze 3-axis characteristics
              const axisSeq = axisHistory.join('->');
              const uniqueAxes = new Set(axisHistory.filter(a => a !== '='));
              const hasSpiral = (
                axisSeq.includes('X->Y->Z') ||
                axisSeq.includes('Y->Z->X') ||
                axisSeq.includes('Z->X->Y') ||
                axisSeq.includes('X->Z->Y')
              );

              // Check multi-axis displacement
              const dx = Math.abs(gA[0] - gB[0]);
              const dy = Math.abs(gA[1] - gB[1]);
              const dz = Math.abs(gA[2] - gB[2]);
              const nonzeroCount = [dx, dy, dz].filter(v => v > 0.4).length;

              if (hasSpiral || nonzeroCount >= 2 || uniqueAxes.size >= 3) {
                parentPort.postMessage({
                  type: 'FOUND_XYZ',
                  rep: {
                    ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
                    rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
                    splitStep: t,
                    cellCount: c0Size,
                    centroidDist: d,
                    dispVector: [dx, dy, dz],
                    axisSeq,
                    hasSpiral,
                    uniqueAxesCount: uniqueAxes.size,
                    c0,
                    history
                  }
                });
                break;
              }
            }
          }
        }
      }
    }

    if (trials % 1000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS' });
    }
  }

  parentPort.postMessage({ type: 'DONE' });
}

if (isMainThread) {
  const numWorkers = Math.max(2, os.cpus().length - 1);
  console.log(`================================================================`);
  console.log(`🚀 Dedicated 3-Phase Spiral & Orthogonal XYZ Replicator Search`);
  console.log(`Targeting: X->Y->Z Sequence & 3D Non-planar Displacement`);
  console.log(`Workers: ${numWorkers} parallel cores`);
  console.log(`================================================================\n`);

  let totalTrials = 0;
  let activeWorkers = numWorkers;
  const hits = [];
  const startTime = Date.now();

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: { maxTrials: 30000 }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'PROGRESS') {
        totalTrials += 1000;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(totalTrials / elapsed);
        process.stdout.write(`\r[Searching XYZ] Trials: ${totalTrials.toLocaleString()} | Speed: ${speed} evals/s | Hits: ${hits.length}`);
      } else if (msg.type === 'FOUND_XYZ') {
        const r = msg.rep;
        hits.push(r);
        console.log(`\n\n✨ [XYZ HIT #${hits.length}!]`);
        console.log(`  Rule: ${r.ruleStr} | Step: ${r.splitStep} | Cells: ${r.cellCount} -> ${r.cellCount * 2} | Dist: ${r.centroidDist.toFixed(1)}`);
        console.log(`  Axis Sequence: ${r.axisSeq}`);
        console.log(`  Has Spiral Pattern: ${r.hasSpiral ? 'YES! ★★★' : 'No'}`);
        console.log(`  Displacement: dx=${r.dispVector[0].toFixed(1)}, dy=${r.dispVector[1].toFixed(1)}, dz=${r.dispVector[2].toFixed(1)}`);
      } else if (msg.type === 'DONE') {
        activeWorkers--;
        if (activeWorkers === 0) {
          console.log(`\n\n=== Search Complete ===`);
          console.log(`Total Trials: ${totalTrials.toLocaleString()} | Total Hits: ${hits.length}`);
          fs.writeFileSync(path.join(__dirname, 'true_xyz_results.json'), JSON.stringify(hits, null, 2), 'utf-8');
          console.log('Saved to true_xyz_results.json!');
        }
      }
    });

    worker.on('error', (err) => console.error('Worker error:', err));
  }
}
