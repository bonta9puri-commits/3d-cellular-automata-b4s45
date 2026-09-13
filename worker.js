// worker.js - Background Replicator Search Worker
importScripts('./replicatorCore.js');

let isRunning = false;
let totalTrials = 0;
let totalFound = 0;
let searchConfig = {
  minCells: 4,
  maxCells: 16,
  boxSize: 3,
  maxSteps: 30,
  minDist: 3.0,
  minStep: 2,
  requireSurvival: true,
  symmetries: ['inversion', 'mirrorX', 'axisZ'],
  bPool: [2, 3, 4, 5, 6],
  sPool: [2, 3, 4, 5, 6, 7]
};

self.onmessage = function(e) {
  const { type, config } = e.data;
  if (type === 'START') {
    if (config) searchConfig = Object.assign(searchConfig, config);
    if (!isRunning) {
      isRunning = true;
      runSearchLoop();
    }
  } else if (type === 'STOP') {
    isRunning = false;
  } else if (type === 'RESET_STATS') {
    totalTrials = 0;
    totalFound = 0;
  }
};

function runSearchLoop() {
  if (!isRunning) return;

  const BATCH_SIZE = 50;
  const startTime = Date.now();

  for (let i = 0; i < BATCH_SIZE; i++) {
    totalTrials++;

    const symType = searchConfig.symmetries[Math.floor(Math.random() * searchConfig.symmetries.length)];
    const box = Math.random() < 0.7 ? searchConfig.boxSize : searchConfig.boxSize + 1;
    const seed = generateSymmetricSeed(box, box, box, searchConfig.minCells, searchConfig.maxCells, symType);

    if (!seed) continue;

    // Sample rule
    const bSample = searchConfig.bPool.filter(() => Math.random() < 0.35);
    const sSample = searchConfig.sPool.filter(() => Math.random() < 0.35);
    if (bSample.length === 0) bSample.push(searchConfig.bPool[Math.floor(Math.random() * searchConfig.bPool.length)]);

    const rule = {
      B: new Set(bSample),
      S: new Set(sSample)
    };

    const res = evaluateSeed(
      seed,
      rule,
      searchConfig.maxSteps,
      searchConfig.minDist,
      searchConfig.minStep,
      searchConfig.requireSurvival
    );
    if (res) {
      totalFound++;
      self.postMessage({
        type: 'FOUND',
        payload: {
          id: 'rep_' + Date.now() + '_' + Math.floor(Math.random()*1000),
          splitStep: res.splitStep,
          cellCount: res.c0.length,
          centroidDist: res.centroidDist,
          rule: res.rule,
          symmetry: symType,
          history: res.history,
          gA: res.gA,
          gB: res.gB,
          gen2Pass: res.gen2Pass,
          gen4Pass: res.gen4Pass,
          isVerifiedInfinite: res.isVerifiedInfinite,
          cycleReports: res.cycleReports,
          foundAt: new Date().toLocaleTimeString()
        }
      });
    }
  }

  // Periodic stats report every batch
  self.postMessage({
    type: 'STATS',
    payload: {
      trials: totalTrials,
      found: totalFound
    }
  });

  // Keep worker responsive by yielding with setTimeout
  if (isRunning) {
    setTimeout(runSearchLoop, 0);
  }
}
