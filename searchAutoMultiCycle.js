// searchAutoMultiCycle.js - High-throughput background search requiring 2T and 4T verification
const os = require('os');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const {
  evaluateSeed,
  generateSymmetricSeed
} = require('./replicatorCore.js');

if (!isMainThread) {
  const { maxTrials } = workerData;
  let trials = 0;
  const verifiedHits = [];
  const symmetries = ['inversion', 'mirrorX', 'axisZ'];
  const bPool = [2, 3, 4, 5, 6];
  const sPool = [1, 2, 3, 4, 5, 6, 7];

  while (trials < maxTrials) {
    trials++;
    const sym = symmetries[Math.floor(Math.random() * symmetries.length)];
    const box = Math.random() < 0.7 ? 3 : 4;
    const seed = generateSymmetricSeed(box, box, box, 4, 16, sym);
    if (!seed) continue;

    const bSample = bPool.filter(() => Math.random() < 0.35);
    const sSample = sPool.filter(() => Math.random() < 0.35);
    if (bSample.length === 0) bSample.push(3);
    if (sSample.length === 0) sSample.push(4);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    // evaluateSeed with built-in 2T & 4T verification!
    const res = evaluateSeed(seed, rule, 25, 3.0, 2, true);
    if (res) {
      // Must pass Cycle 2 (2T) and preferably Cycle 3 (4T)!
      if (res.gen2Pass) {
        verifiedHits.push(res);
        parentPort.postMessage({
          type: 'FOUND_VERIFIED',
          rep: {
            ruleStr: `B${res.rule.B.join('')}/S${res.rule.S.join('')}`,
            splitStep: res.splitStep,
            cellCount: res.c0.length,
            centroidDist: res.centroidDist,
            gen2Pass: res.gen2Pass,
            gen4Pass: res.gen4Pass,
            isVerifiedInfinite: res.isVerifiedInfinite,
            symmetry: sym,
            c0: res.c0,
            history: res.history
          }
        });
      }
    }

    if (trials % 1000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS' });
    }
  }

  parentPort.postMessage({ type: 'DONE', verifiedHits });
}

if (isMainThread) {
  const numWorkers = Math.max(2, os.cpus().length - 1);
  console.log(`================================================================`);
  console.log(`🚀 Automated 2T & 4T Multi-Cycle Replicator Discovery Engine`);
  console.log(`Target: Reject 1-cycle flukes, ONLY keep 2T & 4T verified replicators!`);
  console.log(`Workers: ${numWorkers} parallel cores`);
  console.log(`================================================================\n`);

  let totalTrials = 0;
  let activeWorkers = numWorkers;
  const verifiedList = [];
  const startTime = Date.now();

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: { maxTrials: 20000 }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'PROGRESS') {
        totalTrials += 1000;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(totalTrials / elapsed);
        process.stdout.write(`\r[Auto 2T/4T Search] Trials: ${totalTrials.toLocaleString()} | Speed: ${speed} evals/s | Verified Hits: ${verifiedList.length}`);
      } else if (msg.type === 'FOUND_VERIFIED') {
        const r = msg.rep;
        verifiedList.push(r);
        console.log(`\n\n🎯 [MULTI-CYCLE PASS #${verifiedList.length}!]`);
        console.log(`  Rule: ${r.ruleStr} | Step: t=${r.splitStep} -> 2T(t=${r.splitStep*2}) -> 4T(t=${r.splitStep*4})`);
        console.log(`  2T (Cycle 2): ${r.gen2Pass ? 'PASS ✨' : 'FAIL'} | 4T (Cycle 3): ${r.gen4Pass ? 'PASS 🏆 (100% INFINITE!)' : 'Collision'}`);
        console.log(`  Cells: ${r.cellCount} -> ${r.cellCount * 2} | Dist: ${r.centroidDist.toFixed(1)}`);
      } else if (msg.type === 'DONE') {
        activeWorkers--;
        if (activeWorkers === 0) {
          console.log(`\n\n=== Search Complete ===`);
          console.log(`Total Trials: ${totalTrials.toLocaleString()}`);
          console.log(`Verified Multi-Cycle Replicators: ${verifiedList.length}`);
          fs.writeFileSync(path.join(__dirname, 'verified_auto_infinite_results.json'), JSON.stringify(verifiedList, null, 2), 'utf-8');
          console.log('Saved to verified_auto_infinite_results.json!');
        }
      }
    });

    worker.on('error', (err) => console.error('Worker error:', err));
  }
}
