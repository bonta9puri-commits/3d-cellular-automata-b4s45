// searchT5NoEarlySplit.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const fs = require('fs');

if (!isMainThread) {
  const { batchTrials, minStep } = workerData;
  const {
    simulateStep,
    findConnectedComponents,
    generateSymmetrySignatures,
    normalizeAndHash,
    getCentroid,
    dist,
    generateSymmetricSeed
  } = require('./replicatorCore.js');

  const symmetries = ['inversion', 'mirrorX', 'axisZ'];
  const bPool = [2, 3, 4, 5, 6];
  const sPool = [1, 2, 3, 4, 5, 6, 7];

  for (let i = 0; i < batchTrials; i++) {
    const sym = symmetries[i % symmetries.length];
    const box = (i % 2 === 0) ? 3 : 4;
    const seed = generateSymmetricSeed(box, box, box, 6, 20, sym);
    if (!seed) continue;

    const bSample = bPool.filter(() => Math.random() < 0.35);
    const sSample = sPool.filter(() => Math.random() < 0.38);
    if (bSample.length === 0) bSample.push(bPool[Math.floor(Math.random() * bPool.length)]);
    if (sSample.length === 0) sSample.push(sPool[Math.floor(Math.random() * sPool.length)]);

    const rule = { B: new Set(bSample), S: new Set(sSample) };
    const sigs = generateSymmetrySignatures(seed);
    const c0Size = seed.length;

    let pts = seed;
    let hadEarlySplit = false;
    let foundHit = null;

    for (let t = 1; t <= 12; t++) {
      pts = simulateStep(pts, rule);
      if (pts.length === 0 || pts.length > 8 * c0Size + 100) break;

      const comps = findConnectedComponents(pts);
      // Check if any clean replication occurred
      const congruentComps = comps.filter(c => c.length === c0Size && sigs.has(normalizeAndHash(c)));

      if (t < minStep) {
        if (congruentComps.length >= 2) {
          hadEarlySplit = true;
          break; // Discard immediately
        }
      } else {
        // t >= minStep
        if (comps.length === 2 && congruentComps.length === 2) {
          const gA = getCentroid(comps[0]);
          const gB = getCentroid(comps[1]);
          const d = dist(gA, gB);
          if (d >= 2.5) {
            foundHit = {
              ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
              rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
              splitStep: t,
              cellCount: c0Size,
              centroidDist: d,
              symmetry: sym,
              c0: seed
            };
            break;
          }
        }
      }
    }

    if (foundHit && !hadEarlySplit) {
      parentPort.postMessage({ type: 'FOUND', hit: foundHit });
    }
    if ((i + 1) % 2000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS', count: 2000 });
    }
  }
  parentPort.postMessage({ type: 'DONE' });
}

if (isMainThread) {
  const numWorkers = Math.max(1, os.cpus().length - 1);
  const minStep = 5;
  console.log(`Searching for pure t >= 5 splitters (discarding any early splits)...`);
  let total = 0;
  let finished = 0;
  const hits = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, { workerData: { batchTrials: 40000, minStep } });
    worker.on('message', (msg) => {
      if (msg.type === 'FOUND') {
        hits.push(msg.hit);
        console.log(`\n🌟 FOUND PURE DEEP REPLICATOR! Step t = ${msg.hit.splitStep}, Rule = ${msg.hit.ruleStr}, Cells = ${msg.hit.cellCount}`);
      } else if (msg.type === 'PROGRESS') {
        total += msg.count;
        process.stdout.write(`\rTrials: ${total.toLocaleString()} | Pure Hits: ${hits.length}`);
      } else if (msg.type === 'DONE') {
        finished++;
        if (finished === numWorkers) {
          console.log(`\nCompleted! Found: ${hits.length}`);
          fs.writeFileSync('pure_deep_hits.json', JSON.stringify(hits, null, 2));
        }
      }
    });
  }
}
