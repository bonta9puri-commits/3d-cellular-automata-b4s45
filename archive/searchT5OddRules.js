// searchT5OddRules.js
// Broad search with rule pool: B odd numbers or specific patterns, seeds of 4-12 cells.
// We allow t in [5, 6, 7, 8], requiring:
// 1) Exactly 2 clusters at t
// 2) Both congruent to c0
// 3) At all steps t_prev < t, NOT 2 congruent clusters (no early split)
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
  const bNumbers = [1, 2, 3, 4, 5, 6];
  const sNumbers = [1, 2, 3, 4, 5, 6, 7];

  for (let i = 0; i < batchTrials; i++) {
    const sym = symmetries[i % symmetries.length];
    const box = 3;
    const seed = generateSymmetricSeed(box, box, box, 4, 12, sym);
    if (!seed) continue;

    // Sample rule: 1 to 3 birth conditions, 1 to 4 survival conditions
    const bSample = bNumbers.filter(() => Math.random() < 0.35);
    const sSample = sNumbers.filter(() => Math.random() < 0.40);
    if (bSample.length === 0) bSample.push(3);

    const rule = { B: new Set(bSample), S: new Set(sSample) };
    const sigs = generateSymmetrySignatures(seed);
    const c0Size = seed.length;

    let pts = seed;
    let hadEarly = false;
    let hit = null;

    for (let t = 1; t <= 12; t++) {
      pts = simulateStep(pts, rule);
      if (pts.length === 0 || pts.length > 10 * c0Size + 100) break;

      const comps = findConnectedComponents(pts);
      const matches = comps.filter(c => c.length === c0Size && sigs.has(normalizeAndHash(c))).length;

      if (t < minStep) {
        if (comps.length === 2 && matches === 2) {
          hadEarly = true;
          break;
        }
      } else {
        if (comps.length === 2 && matches === 2) {
          const gA = getCentroid(comps[0]);
          const gB = getCentroid(comps[1]);
          const d = dist(gA, gB);
          if (d >= 2.5) {
            // Test 2T
            let vPts = pts;
            let gen2 = false;
            for (let vt = t + 1; vt <= t * 2; vt++) {
              vPts = simulateStep(vPts, rule);
              if (vPts.length === 0 || vPts.length > 20 * c0Size) break;
              if (vt === t * 2) {
                const comps2 = findConnectedComponents(vPts);
                const m2 = comps2.filter(c => c.length === c0Size && sigs.has(normalizeAndHash(c))).length;
                gen2 = (comps2.length === m2 && m2 >= 2);
              }
            }

            hit = {
              ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
              rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
              splitStep: t,
              cellCount: c0Size,
              centroidDist: d,
              symmetry: sym,
              gen2Pass: gen2,
              c0: seed
            };
            break;
          }
        }
      }
    }

    if (hit && !hadEarly) {
      parentPort.postMessage({ type: 'FOUND', hit });
    }
    if ((i + 1) % 5000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS', count: 5000 });
    }
  }
  parentPort.postMessage({ type: 'DONE' });
}

if (isMainThread) {
  const numWorkers = Math.max(1, os.cpus().length - 1);
  const minStep = 5;
  console.log(`Starting searchT5OddRules with ${numWorkers} workers (4-12 cells in 3x3x3)...`);
  let total = 0;
  let finished = 0;
  const hits = [];

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, { workerData: { batchTrials: 40000, minStep } });
    worker.on('message', (msg) => {
      if (msg.type === 'FOUND') {
        hits.push(msg.hit);
        console.log(`\n🎉 FOUND t=${msg.hit.splitStep} REPLICATOR! Rule: ${msg.hit.ruleStr}, Cells: ${msg.hit.cellCount}, 2T: ${msg.hit.gen2Pass ? 'PASS' : 'FAIL'}`);
      } else if (msg.type === 'PROGRESS') {
        total += msg.count;
        process.stdout.write(`\rTrials: ${total.toLocaleString()} | Hits: ${hits.length}`);
      } else if (msg.type === 'DONE') {
        finished++;
        if (finished === numWorkers) {
          console.log(`\nFinished! Found ${hits.length} replicators.`);
          fs.writeFileSync('t5_odd_hits.json', JSON.stringify(hits, null, 2));
        }
      }
    });
  }
}
