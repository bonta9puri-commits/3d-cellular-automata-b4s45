// searchT5Parallel.js - Ultra Deep Multi-core Search targeting splitStep >= 5 (t=5, 6, 7, 8)
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const fs = require('fs');

if (isMainThread) {
  const numThreads = Math.max(1, os.cpus().length - 1);
  console.log(`====================================================`);
  console.log(`Starting ULTRA DEEP SEARCH for t >= 5 Replicators!`);
  console.log(`CPU Cores: ${numThreads} threads running concurrently`);
  console.log(`Target: Pure replication strictly at splitStep >= 5`);
  console.log(`Conditions: Clean 2*|C0|, centroidDist >= 3.0, S.size > 0`);
  console.log(`====================================================`);

  let totalTrials = 0;
  const results = [];
  let finishedWorkers = 0;
  const startTime = Date.now();

  for (let i = 0; i < numThreads; i++) {
    const worker = new Worker(__filename, {
      workerData: { threadId: i, batchTrials: 80000 }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'FOUND') {
        results.push(msg.data);
        console.log(`\n🎉🎉🎉 [JACKPOT! FOUND t=${msg.data.splitStep}!] Cells: ${msg.data.c0.length}->${msg.data.c0.length*2}, Rule: B${msg.data.rule.B.join('')}/S${msg.data.rule.S.join('')}, Dist: ${msg.data.centroidDist.toFixed(2)}`);
      } else if (msg.type === 'PROGRESS') {
        totalTrials += msg.trials;
        const el = (Date.now() - startTime) / 1000;
        process.stdout.write(`\r[Progress] Trials: ${totalTrials} (${(totalTrials/el).toFixed(0)} trials/s) | t>=5 Found: ${results.length}  `);
      }
    });

    worker.on('exit', () => {
      finishedWorkers++;
      if (finishedWorkers === numThreads) {
        const el = (Date.now() - startTime) / 1000;
        console.log(`\n\nAll threads finished! Total: ${totalTrials} trials in ${el.toFixed(1)}s (${(totalTrials/el).toFixed(0)} trials/s).`);
        console.log(`Found t>=5 replicators: ${results.length}`);
        fs.writeFileSync('t5_results.json', JSON.stringify(results, null, 2));
        console.log('Saved results to t5_results.json');
      }
    });
  }
} else {
  // Worker Thread logic
  const {
    evaluateSeed,
    generateSymmetricSeed
  } = require('./replicatorCore.js');

  const { batchTrials } = workerData;
  const symmetries = ['inversion', 'mirrorX', 'axisZ'];
  
  // Diverse sampling pool
  const bPool = [1, 2, 3, 4, 5, 6];
  const sPool = [1, 2, 3, 4, 5, 6, 7];

  let localCount = 0;
  for (let i = 0; i < batchTrials; i++) {
    localCount++;
    const sym = symmetries[i % symmetries.length];
    // Mix 3x3x3 and 4x4x4
    const box = (i % 3 === 0) ? 4 : 3;
    const seed = generateSymmetricSeed(box, box, box, 4, 16, sym);
    if (!seed) continue;

    // Sample rule with reasonable density
    const bSample = bPool.filter(() => Math.random() < 0.33);
    const sSample = sPool.filter(() => Math.random() < 0.38);
    if (bSample.length === 0) bSample.push(bPool[Math.floor(Math.random() * bPool.length)]);
    if (sSample.length === 0) sSample.push(sPool[Math.floor(Math.random() * sPool.length)]);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    // Strictly target minStep = 5, maxSteps = 16, minDist = 2.5
    const res = evaluateSeed(seed, rule, 16, 2.5, 5, true);
    if (res) {
      parentPort.postMessage({ type: 'FOUND', data: res });
    }

    if (localCount % 5000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS', trials: 5000 });
    }
  }
}
