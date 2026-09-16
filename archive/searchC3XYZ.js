// searchC3XYZ.js
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

function generateC3Seed(box = 3, minCells = 4, maxCells = 16) {
  for (let t = 0; t < 60; t++) {
    const points = new Set();
    const add = (x, y, z) => points.add(`${x},${y},${z}`);

    // Main diagonal
    for (let i = 0; i < box; i++) {
      if (Math.random() < 0.4) add(i, i, i);
    }

    // 3-orbits for C3 symmetry: (x,y,z), (y,z,x), (z,x,y)
    for (let x = 0; x < box; x++) {
      for (let y = 0; y < box; y++) {
        for (let z = 0; z < box; z++) {
          if (x === y && y === z) continue;
          if (Math.random() < 0.10) {
            add(x, y, z);
            add(y, z, x);
            add(z, x, y);
          }
        }
      }
    }

    const pts = Array.from(points).map(k => k.split(',').map(Number));
    if (pts.length >= minCells && pts.length <= maxCells) {
      const comps = findConnectedComponents(pts);
      if (comps.length === 1) {
        return pts;
      }
    }
  }
  return null;
}

if (!isMainThread) {
  const { maxTrials } = workerData;
  let trials = 0;
  const bPool = [2, 3, 4, 5, 6];
  const sPool = [1, 2, 3, 4, 5, 6, 7];

  while (trials < maxTrials) {
    trials++;
    const box = Math.random() < 0.7 ? 3 : 4;
    const c0 = generateC3Seed(box, 4, 15);
    if (!c0) continue;

    const bSample = bPool.filter(() => Math.random() < 0.35);
    const sSample = sPool.filter(() => Math.random() < 0.35);
    if (bSample.length === 0) bSample.push(3);
    if (sSample.length === 0) sSample.push(4);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    const c0Size = c0.length;
    const signatures = generateSymmetrySignatures(c0);
    let pts = c0;
    const history = [pts];

    for (let t = 1; t <= 12; t++) {
      pts = simulateStep(pts, rule);
      history.push(pts);

      if (pts.length === 0 || pts.length > 8 * c0Size) break;

      // Case 1: 2-Cluster Split along diagonal (X=Y=Z)
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
              const dx = Math.abs(gA[0] - gB[0]);
              const dy = Math.abs(gA[1] - gB[1]);
              const dz = Math.abs(gA[2] - gB[2]);
              parentPort.postMessage({
                type: 'FOUND',
                rep: {
                  mode: '2-split-screw',
                  ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
                  rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
                  splitStep: t,
                  cellCount: c0Size,
                  centroidDist: d,
                  dispVector: [dx, dy, dz],
                  c0,
                  history
                }
              });
              break;
            }
          }
        }
      }

      // Case 2: 3-Cluster Split (True 3-Axis Tripod Replication! X, Y, Z simultaneous!)
      if (t >= 2 && pts.length === 3 * c0Size) {
        const comps = findConnectedComponents(pts);
        if (comps.length === 3 && comps.every(c => c.length === c0Size)) {
          const hashes = comps.map(c => normalizeAndHash(c));
          if (hashes.every(h => signatures.has(h))) {
            const centroids = comps.map(c => getCentroid(c));
            parentPort.postMessage({
              type: 'FOUND',
              rep: {
                mode: '3-split-tripod-XYZ',
                ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
                rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
                splitStep: t,
                cellCount: c0Size,
                centroids,
                c0,
                history
              }
            });
            break;
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
  console.log(`=============================================================`);
  console.log(`🚀 Searching for 3-Axis C3 (X -> Y -> Z) Cyclic Replicators`);
  console.log(`Workers: ${numWorkers} | Modes: 2-split-screw & 3-split-tripod`);
  console.log(`=============================================================\n`);

  let totalTrials = 0;
  let activeWorkers = numWorkers;
  const foundList = [];
  const startTime = Date.now();

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: { maxTrials: 25000 }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'PROGRESS') {
        totalTrials += 1000;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(totalTrials / elapsed);
        process.stdout.write(`\r[Searching C3 XYZ] Trials: ${totalTrials.toLocaleString()} | Speed: ${speed} evals/s | Found: ${foundList.length}`);
      } else if (msg.type === 'FOUND') {
        foundList.push(msg.rep);
        console.log(`\n\n🎯 [C3 CYCLIC HIT #${foundList.length}!]`);
        console.log(`  Mode: ${msg.rep.mode}`);
        console.log(`  Rule: ${msg.rep.ruleStr} | Step: ${msg.rep.splitStep} | Cells: ${msg.rep.cellCount} -> ${msg.rep.cellCount * (msg.rep.mode.includes('3-split') ? 3 : 2)}`);
        if (msg.rep.dispVector) {
          console.log(`  Displacement Vector (dx, dy, dz): [${msg.rep.dispVector.map(v=>v.toFixed(1)).join(', ')}]`);
        }
      } else if (msg.type === 'DONE') {
        activeWorkers--;
        if (activeWorkers === 0) {
          console.log(`\n\n=== Search Complete ===`);
          console.log(`Total Trials: ${totalTrials.toLocaleString()}`);
          console.log(`Hits: ${foundList.length}`);
          fs.writeFileSync(path.join(__dirname, 'c3_xyz_results.json'), JSON.stringify(foundList, null, 2), 'utf-8');
          console.log('Saved to c3_xyz_results.json!');
        }
      }
    });

    worker.on('error', (err) => console.error('Worker error:', err));
  }
}
