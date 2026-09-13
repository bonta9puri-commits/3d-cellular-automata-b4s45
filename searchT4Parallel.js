// searchT4Parallel.js - Multi-core Parallel Search for t=4 Replicators
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');
const path = require('path');
const fs = require('fs');

if (isMainThread) {
  const numThreads = Math.max(1, os.cpus().length - 1);
  console.log(`====================================================`);
  console.log(`Starting PARALLEL DEEP SEARCH for t=3, t=4 Replicators`);
  console.log(`CPU Cores: ${numThreads} threads running concurrently`);
  console.log(`Target: Pure replication at splitStep >= 3, 4`);
  console.log(`====================================================`);

  let totalTrials = 0;
  const t3Results = [];
  const t4Results = [];
  let finishedWorkers = 0;
  const startTime = Date.now();

  for (let i = 0; i < numThreads; i++) {
    const worker = new Worker(__filename, {
      workerData: { threadId: i, batchTrials: 30000 }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'FOUND') {
        if (msg.data.splitStep === 3) {
          t3Results.push(msg.data);
          console.log(`>>> [FOUND t=3] Step: 3, Cells: ${msg.data.c0.length}->${msg.data.c0.length*2}, Rule: B${msg.data.rule.B.join('')}/S${msg.data.rule.S.join('')}, Dist: ${msg.data.centroidDist.toFixed(2)}`);
        } else if (msg.data.splitStep >= 4) {
          t4Results.push(msg.data);
          console.log(`★★★★★ [JACKPOT! FOUND t=${msg.data.splitStep}!] Cells: ${msg.data.c0.length}->${msg.data.c0.length*2}, Rule: B${msg.data.rule.B.join('')}/S${msg.data.rule.S.join('')}, Dist: ${msg.data.centroidDist.toFixed(2)}`);
        }
      } else if (msg.type === 'PROGRESS') {
        totalTrials += msg.trials;
        const el = (Date.now() - startTime) / 1000;
        console.log(`[Progress] Total Trials: ${totalTrials} (${(totalTrials/el).toFixed(0)} trials/s) | t=3: ${t3Results.length} | t>=4: ${t4Results.length}`);
      }
    });

    worker.on('exit', () => {
      finishedWorkers++;
      if (finishedWorkers === numThreads) {
        const el = (Date.now() - startTime) / 1000;
        console.log(`\nAll threads finished! Total: ${totalTrials} trials in ${el.toFixed(1)}s (${(totalTrials/el).toFixed(0)} trials/s).`);
        console.log(`Found t=3: ${t3Results.length}, t>=4: ${t4Results.length}`);
        fs.writeFileSync('t4_results.json', JSON.stringify({ t3: t3Results, t4: t4Results }, null, 2));
        console.log('Saved results to t4_results.json');
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
  const bPool = [1, 2, 3, 4, 5, 6];
  const sPool = [1, 2, 3, 4, 5, 6, 7];

  let localCount = 0;
  for (let i = 0; i < batchTrials; i++) {
    localCount++;
    const sym = symmetries[i % symmetries.length];
    const box = (i % 3 === 0) ? 4 : 3;
    const seed = generateSymmetricSeed(box, box, box, 4, 16, sym);
    if (!seed) continue;

    const bSample = bPool.filter(() => Math.random() < 0.35);
    const sSample = sPool.filter(() => Math.random() < 0.38);
    if (bSample.length === 0) bSample.push(bPool[Math.floor(Math.random() * bPool.length)]);
    if (sSample.length === 0) sSample.push(sPool[Math.floor(Math.random() * sPool.length)]);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    const res = evaluateSeed(seed, rule, 12, 2.5, 3, true);
    if (res) {
      parentPort.postMessage({ type: 'FOUND', data: res });
    }

    if (localCount % 5000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS', trials: 5000 });
    }
  }
}
