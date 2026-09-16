// search_b5_infinite.js
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const fs = require('fs');

if (!isMainThread) {
  const { batchTrials } = workerData;
  const {
    simulateStep,
    findConnectedComponents,
    generateSymmetrySignatures,
    normalizeAndHash,
    getCentroid,
    dist,
    generateSymmetricSeed
  } = require('./replicatorCore.js');

  const symmetries = ['axisZ', 'inversion', 'mirrorX'];
  // Rules around B5/S4567, B45/S4567, B5/S34567, B56/S4567
  const bPool = [4, 5, 6];
  const sPool = [3, 4, 5, 6, 7];

  for (let i = 0; i < batchTrials; i++) {
    const sym = symmetries[i % symmetries.length];
    // Try 3x3x3, 4x3x3, 4x4x4
    const boxX = 3 + (i % 3 === 0 ? 1 : 0);
    const boxY = 3;
    const boxZ = 3;
    const seed = generateSymmetricSeed(boxX, boxY, boxZ, 8, 20, sym);
    if (!seed) continue;

    // Rule must have 5 in B, and survival around 4,5,6,7
    const bSample = [5];
    if (Math.random() < 0.3) bSample.push(4);
    if (Math.random() < 0.2) bSample.push(6);

    const sSample = [4, 5, 6, 7];
    if (Math.random() < 0.25) sSample.push(3);

    const rule = { B: new Set(bSample), S: new Set(sSample) };
    const sigs = generateSymmetrySignatures(seed);
    const c0Size = seed.length;

    let pts = seed;
    let hit = null;

    for (let t = 1; t <= 12; t++) {
      pts = simulateStep(pts, rule);
      if (pts.length === 0 || pts.length > 8 * c0Size + 80) break;

      const comps = findConnectedComponents(pts);
      if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
        if (sigs.has(normalizeAndHash(comps[0])) && sigs.has(normalizeAndHash(comps[1]))) {
          const gA = getCentroid(comps[0]);
          const gB = getCentroid(comps[1]);
          const d = dist(gA, gB);

          // We want distance >= 5.5 to avoid inner child collision!
          if (d >= 5.5) {
            // Test 2T cycle (t*2)
            let vPts = pts;
            let gen2Pass = false;
            let gen4Pass = false;

            for (let vt = t + 1; vt <= t * 4; vt++) {
              vPts = simulateStep(vPts, rule);
              if (vPts.length === 0 || vPts.length > 16 * c0Size + 100) break;

              if (vt === t * 2) {
                const comps2 = findConnectedComponents(vPts);
                const m2 = comps2.filter(c => c.length === c0Size && sigs.has(normalizeAndHash(c))).length;
                gen2Pass = (comps2.length === m2 && m2 >= 2);
              }
              if (vt === t * 4) {
                const comps4 = findConnectedComponents(vPts);
                const m4 = comps4.filter(c => c.length === c0Size && sigs.has(normalizeAndHash(c))).length;
                gen4Pass = (comps4.length === m4 && m4 >= 2);
              }
            }

            hit = {
              ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
              rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
              splitStep: t,
              cellCount: c0Size,
              centroidDist: d,
              symmetry: sym,
              gen2Pass,
              gen4Pass,
              isVerifiedInfinite: (gen2Pass && gen4Pass),
              c0: seed
            };
            break;
          }
        }
      }
    }

    if (hit) {
      parentPort.postMessage({ type: 'FOUND', hit });
    }
    if ((i + 1) % 3000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS', count: 3000 });
    }
  }
  parentPort.postMessage({ type: 'DONE' });
}

if (isMainThread) {
  const numWorkers = Math.max(1, os.cpus().length - 1);
  console.log(`Starting High-Propulsion B5 Replicator Search on ${numWorkers} cores...`);
  let total = 0;
  let finished = 0;
  const hits = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, { workerData: { batchTrials: 35000 } });
    worker.on('message', (msg) => {
      if (msg.type === 'FOUND') {
        hits.push(msg.hit);
        console.log(`\n🚀 FOUND HIGH-PROPULSION SPLITTER! t=${msg.hit.splitStep}, Cells=${msg.hit.cellCount}, Dist=${msg.hit.centroidDist.toFixed(1)}, 2T=${msg.hit.gen2Pass ? 'PASS ✨' : 'FAIL'}, 4T=${msg.hit.gen4Pass ? 'PASS 🏆' : 'FAIL'}`);
      } else if (msg.type === 'PROGRESS') {
        total += msg.count;
        process.stdout.write(`\rTrials: ${total.toLocaleString()} | Hits: ${hits.length}`);
      } else if (msg.type === 'DONE') {
        finished++;
        if (finished === numWorkers) {
          console.log(`\nSearch complete! Found ${hits.length} high-propulsion splitters.`);
          fs.writeFileSync('high_propulsion_hits.json', JSON.stringify(hits, null, 2));
        }
      }
    });
  }
}
