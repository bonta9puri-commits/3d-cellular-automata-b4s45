// targetedDeepSearch.js
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
  dist,
  generateSymmetricSeed
} = require('./replicatorCore.js');

if (!isMainThread) {
  const { maxTrials, minStep } = workerData;
  let trials = 0;
  const verifiedDeepHits = [];
  const symmetries = ['inversion', 'mirrorX', 'axisZ'];
  
  // Rule pool with B odd numbers (like B3, B13, B35) which are famous for Sierpinski/parity replicating dynamics
  const bPool = [1, 3, 5];
  const sPool = [0, 1, 2, 3, 4, 5, 6, 7];

  while (trials < maxTrials) {
    trials++;
    const sym = symmetries[Math.floor(Math.random() * symmetries.length)];
    const boxW = 3 + Math.floor(Math.random() * 2);
    const boxH = 3 + Math.floor(Math.random() * 2);
    const boxD = 3 + Math.floor(Math.random() * 2);
    const minC = 6;
    const maxC = 16;
    const seed = generateSymmetricSeed(boxW, boxH, boxD, minC, maxC, sym);
    if (!seed) continue;

    const c0Size = seed.length;
    // B must include 3 or 5 or 1
    const bSample = bPool.filter(() => Math.random() < 0.45);
    if (bSample.length === 0) bSample.push(bPool[Math.floor(Math.random() * bPool.length)]);
    const sSample = sPool.filter(() => Math.random() < 0.35);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    const signatures = generateSymmetrySignatures(seed);
    let currentPoints = seed;
    const history = [currentPoints];
    let splitCandidate = null;
    let earlySplit = false;

    for (let step = 1; step <= 20; step++) {
      currentPoints = simulateStep(currentPoints, rule);
      history.push(currentPoints);

      if (currentPoints.length === 0 || currentPoints.length > 8 * c0Size + 60) break;

      // Check if it already split into 2 congruent copies before minStep
      if (step < minStep && currentPoints.length === 2 * c0Size) {
        const comps = findConnectedComponents(currentPoints);
        if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
          if (signatures.has(normalizeAndHash(comps[0]))) {
            earlySplit = true;
            break; // Skip! This is early split (t < 5)
          }
        }
      }

      // Candidate at step >= minStep: 2 congruent copies separated
      if (step >= minStep && currentPoints.length === 2 * c0Size) {
        const comps = findConnectedComponents(currentPoints);
        if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
          const gA = getCentroid(comps[0]);
          const gB = getCentroid(comps[1]);
          const d = dist(gA, gB);

          if (d >= 2.5) {
            const hA = normalizeAndHash(comps[0]);
            const hB = normalizeAndHash(comps[1]);
            if (signatures.has(hA) && signatures.has(hB)) {
              // Now test 2T and 4T
              const splitT = step;
              let vPts = currentPoints;
              let gen2Pass = false;
              let gen4Pass = false;
              const maxT = splitT * 4;

              for (let vt = splitT + 1; vt <= maxT; vt++) {
                vPts = simulateStep(vPts, rule);
                history.push(vPts);
                if (vPts.length === 0 || vPts.length > 16 * c0Size + 100) break;

                if (vt === splitT * 2) {
                  const comps2 = findConnectedComponents(vPts);
                  const m2 = comps2.filter(c => c.length === c0Size && signatures.has(normalizeAndHash(c))).length;
                  gen2Pass = (comps2.length === m2 && m2 >= 2);
                }
                if (vt === splitT * 4) {
                  const comps4 = findConnectedComponents(vPts);
                  const m4 = comps4.filter(c => c.length === c0Size && signatures.has(normalizeAndHash(c))).length;
                  gen4Pass = (comps4.length === m4 && m4 >= 2);
                }
              }

              splitCandidate = {
                ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
                rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
                splitStep: splitT,
                cellCount: c0Size,
                centroidDist: d,
                symmetry: sym,
                gen2Pass,
                gen4Pass,
                isVerifiedInfinite: (gen2Pass && gen4Pass),
                c0: seed,
                history
              };
              break;
            }
          }
        }
      }
    }

    if (splitCandidate) {
      verifiedDeepHits.push(splitCandidate);
      parentPort.postMessage({ type: 'FOUND_DEEP', rep: splitCandidate });
    }
    if (trials % 1000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS' });
    }
  }

  parentPort.postMessage({ type: 'DONE', verifiedDeepHits });
}

if (isMainThread) {
  const numWorkers = Math.max(2, os.cpus().length - 1);
  const minStepTarget = 5;
  console.log(`Searching for pure t >= 5 splitters with parity-friendly rules...`);
  let totalTrials = 0;
  let activeWorkers = numWorkers;
  const allHits = [];
  const startTime = Date.now();

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: { maxTrials: 30000, minStep: minStepTarget }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'PROGRESS') {
        totalTrials += 1000;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(totalTrials / elapsed);
        process.stdout.write(`\r[t>=5 Parity Search] Trials: ${totalTrials.toLocaleString()} | Speed: ${speed}/s | Deep Hits: ${allHits.length}`);
      } else if (msg.type === 'FOUND_DEEP') {
        const r = msg.rep;
        allHits.push(r);
        console.log(`\n\n🎯 [FOUND PURE t=${r.splitStep} SPLITTER!]`);
        console.log(`  Rule: ${r.ruleStr} | Cells: ${r.cellCount} -> ${r.cellCount * 2} | Dist: ${r.centroidDist.toFixed(1)}`);
        console.log(`  Multi-Cycle Verification: 2T(t=${r.splitStep*2}): ${r.gen2Pass ? 'PASS ✨' : 'FAIL'} | 4T(t=${r.splitStep*4}): ${r.gen4Pass ? 'PASS 🏆' : 'FAIL'}`);
      } else if (msg.type === 'DONE') {
        activeWorkers--;
        if (activeWorkers === 0) {
          console.log(`\n\n=== Search Complete ===`);
          console.log(`Total Trials: ${totalTrials.toLocaleString()} | Deep Hits: ${allHits.length}`);
          fs.writeFileSync(path.join(__dirname, 'targeted_deep_results.json'), JSON.stringify(allHits, null, 2), 'utf-8');
        }
      }
    });
    worker.on('error', (err) => console.error(err));
  }
}
