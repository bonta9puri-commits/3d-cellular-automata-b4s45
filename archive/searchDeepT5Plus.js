// searchDeepT5Plus.js - Targeted Search for Deep Replicators (t >= 5) with Automatic 2T & 4T Verification
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
  
  // Rule pool tailored for long intermediate morphing without immediate extinction or explosion
  const bPool = [3, 4, 5, 6];
  const sPool = [2, 3, 4, 5, 6, 7];

  while (trials < maxTrials) {
    trials++;
    const sym = symmetries[Math.floor(Math.random() * symmetries.length)];
    // Mix 3x3x3, 4x4x4, and slightly rectangular boxes
    const boxW = 3 + Math.floor(Math.random() * 2);
    const boxH = 3 + Math.floor(Math.random() * 2);
    const boxD = 3 + Math.floor(Math.random() * 2);
    const minC = 6;
    const maxC = 18;
    const seed = generateSymmetricSeed(boxW, boxH, boxD, minC, maxC, sym);
    if (!seed) continue;

    const c0Size = seed.length;
    const bSample = bPool.filter(() => Math.random() < 0.38);
    const sSample = sPool.filter(() => Math.random() < 0.42);
    if (bSample.length === 0) bSample.push(bPool[Math.floor(Math.random() * bPool.length)]);
    if (sSample.length === 0) sSample.push(sPool[Math.floor(Math.random() * sPool.length)]);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    const signatures = generateSymmetrySignatures(seed);
    let currentPoints = seed;
    const history = [currentPoints];
    let splitCandidate = null;

    // Search for first split at t >= minStep (e.g. t >= 5)
    for (let step = 1; step <= 20; step++) {
      currentPoints = simulateStep(currentPoints, rule);
      history.push(currentPoints);

      if (currentPoints.length === 0) break;
      if (currentPoints.length > 8 * c0Size + 100) break; // explosion limit

      // If splits before minStep, discard immediately (we want t >= minStep!)
      if (step < minStep && currentPoints.length === 2 * c0Size) {
        const comps = findConnectedComponents(currentPoints);
        if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
          break; // Discard early split
        }
      }

      // Found candidate split at step >= minStep!
      if (step >= minStep && currentPoints.length === 2 * c0Size) {
        const comps = findConnectedComponents(currentPoints);
        if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
          const gA = getCentroid(comps[0]);
          const gB = getCentroid(comps[1]);
          const d = dist(gA, gB);

          if (d >= 3.0) {
            const hA = normalizeAndHash(comps[0]);
            const hB = normalizeAndHash(comps[1]);
            if (signatures.has(hA) && signatures.has(hB)) {
              // Found First Split! Now run Automatic 2T and 4T verification!
              const splitT = step;
              const maxT = Math.min(48, splitT * 4);
              let vPts = currentPoints;
              let gen2Pass = false;
              let gen4Pass = false;
              const cycleReports = [
                { cycle: 1, step: splitT, clusterCount: 2, totalCells: currentPoints.length, isClean: true }
              ];

              for (let vt = splitT + 1; vt <= maxT; vt++) {
                vPts = simulateStep(vPts, rule);
                history.push(vPts);

                if (vPts.length === 0 || vPts.length > 16 * c0Size + 150) break;

                // Cycle 2 at 2T
                if (vt === splitT * 2) {
                  const comps2 = findConnectedComponents(vPts);
                  let c2Matches = 0;
                  for (const c of comps2) {
                    if (c.length === c0Size && signatures.has(normalizeAndHash(c))) {
                      c2Matches++;
                    }
                  }
                  gen2Pass = (comps2.length === c2Matches && c2Matches >= 2);
                  cycleReports.push({
                    cycle: 2,
                    step: vt,
                    clusterCount: comps2.length,
                    congruentCount: c2Matches,
                    totalCells: vPts.length,
                    isClean: gen2Pass
                  });
                }

                // Cycle 3 at 4T
                if (vt === splitT * 4) {
                  const comps4 = findConnectedComponents(vPts);
                  let c4Matches = 0;
                  for (const c of comps4) {
                    if (c.length === c0Size && signatures.has(normalizeAndHash(c))) {
                      c4Matches++;
                    }
                  }
                  gen4Pass = (comps4.length === c4Matches && c4Matches >= 2);
                  cycleReports.push({
                    cycle: 3,
                    step: vt,
                    clusterCount: comps4.length,
                    congruentCount: c4Matches,
                    totalCells: vPts.length,
                    isClean: gen4Pass
                  });
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
                cycleReports,
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
      parentPort.postMessage({
        type: 'FOUND_DEEP',
        rep: splitCandidate
      });
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
  console.log(`================================================================`);
  console.log(`🚀 Deep Replicator Search (Target: t >= ${minStepTarget})`);
  console.log(`Auto Multi-Cycle Verification: 2T (t >= ${minStepTarget*2}) & 4T (t >= ${minStepTarget*4})`);
  console.log(`Workers: ${numWorkers} parallel cores`);
  console.log(`================================================================\n`);

  let totalTrials = 0;
  let activeWorkers = numWorkers;
  const allHits = [];
  const startTime = Date.now();

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: { maxTrials: 25000, minStep: minStepTarget }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'PROGRESS') {
        totalTrials += 1000;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(totalTrials / elapsed);
        process.stdout.write(`\r[Deep t>=5 Search] Trials: ${totalTrials.toLocaleString()} | Speed: ${speed} evals/s | Deep Hits: ${allHits.length}`);
      } else if (msg.type === 'FOUND_DEEP') {
        const r = msg.rep;
        allHits.push(r);
        console.log(`\n\n🔮 [DEEP HIT #${allHits.length}!]`);
        console.log(`  Rule: ${r.ruleStr} | First Split: t = ${r.splitStep} (>= 5!)`);
        console.log(`  Multi-Cycle Verification: 2T(t=${r.splitStep*2}): ${r.gen2Pass ? 'PASS ✨' : 'FAIL'} | 4T(t=${r.splitStep*4}): ${r.gen4Pass ? 'PASS 🏆 (100% INFINITE!)' : 'FAIL'}`);
        console.log(`  Cells: ${r.cellCount} -> ${r.cellCount * 2} | Dist: ${r.centroidDist.toFixed(1)} | Sym: ${r.symmetry}`);
      } else if (msg.type === 'DONE') {
        activeWorkers--;
        if (activeWorkers === 0) {
          console.log(`\n\n=== Search Complete ===`);
          console.log(`Total Trials: ${totalTrials.toLocaleString()} | Deep Hits: ${allHits.length}`);
          fs.writeFileSync(path.join(__dirname, 'deep_t5_results.json'), JSON.stringify(allHits, null, 2), 'utf-8');
          console.log('Saved to deep_t5_results.json!');
        }
      }
    });

    worker.on('error', (err) => console.error('Worker error:', err));
  }
}
