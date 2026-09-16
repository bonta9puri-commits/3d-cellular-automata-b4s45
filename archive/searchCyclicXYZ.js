// searchCyclicXYZ.js - Search for 3-Axis Cyclic (X -> Y -> Z) 3D Replicators
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

// Cyclic Permutations corresponding to 120-degree rotation along (1,1,1)
// [1, 2, 0] : (x,y,z) -> (y,z,x)
// [2, 0, 1] : (x,y,z) -> (z,x,y)
const CYCLIC_PERMS = [
  [1, 2, 0],
  [2, 0, 1]
];

// Check if transformation from c0 to targetComp involves a cyclic 120-deg permutation
function checkCyclicTransformation(c0, targetComp) {
  const targetHash = normalizeAndHash(targetComp);
  
  // Signs for rotation: Det = 1 requires either (1,1,1) or two negative signs with even permutation
  // Cyclic perms [1,2,0] and [2,0,1] have parity +1 (even)
  const ROTATION_SIGNS = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1]
  ];

  for (const perm of CYCLIC_PERMS) {
    for (const sign of ROTATION_SIGNS) {
      const transformed = c0.map(p => [
        p[perm[0]] * sign[0],
        p[perm[1]] * sign[1],
        p[perm[2]] * sign[2]
      ]);
      if (normalizeAndHash(transformed) === targetHash) {
        return { isCyclic120: true, perm, sign };
      }
    }
  }
  return { isCyclic120: false };
}

// Generate Seeds with true 3D extension (not flat, spanning all 3 axes)
function generate3DChiralSeed() {
  const seedTypes = ['tripod', 'helical_worm', '3d_cross', 'box_dense'];
  const type = seedTypes[Math.floor(Math.random() * seedTypes.length)];
  const points = new Set();
  const add = (x, y, z) => points.add(`${x},${y},${z}`);

  if (type === 'tripod') {
    // 3 arms extending along X, Y, Z from center with small chiral flags
    add(0, 0, 0);
    const armLen = 1 + Math.floor(Math.random() * 2);
    for (let i = 1; i <= armLen; i++) {
      add(i, 0, 0);
      add(0, i, 0);
      add(0, 0, i);
    }
    // Add chiral tips (breaks mirror symmetry to force helical rotation)
    if (Math.random() > 0.3) {
      add(armLen, 1, 0);
      add(0, armLen, 1);
      add(1, 0, armLen);
    }
  } else if (type === 'helical_worm') {
    // A 3D helical path rotating X -> Y -> Z
    let cx = 0, cy = 0, cz = 0;
    add(cx, cy, cz);
    const steps = 5 + Math.floor(Math.random() * 8);
    const dirs = [[1,0,0], [0,1,0], [0,0,1]];
    for (let s = 0; s < steps; s++) {
      const d = dirs[s % 3];
      cx += d[0]; cy += d[1]; cz += d[2];
      add(cx, cy, cz);
    }
  } else if (type === '3d_cross') {
    // 3D jacks / cross
    add(1, 1, 1);
    add(0, 1, 1); add(2, 1, 1);
    add(1, 0, 1); add(1, 2, 1);
    add(1, 1, 0); add(1, 1, 2);
    // Remove or add 1-2 cells
    if (Math.random() > 0.5) add(2, 2, 1);
  } else {
    // Random 3x3x3 cluster with dx >= 2, dy >= 2, dz >= 2
    const size = 5 + Math.floor(Math.random() * 8);
    let cx = 1, cy = 1, cz = 1;
    add(cx, cy, cz);
    while (points.size < size) {
      const dx = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.3 ? 1 : 0);
      const dy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.3 ? 1 : 0);
      const dz = (Math.random() > 0.5 ? 1 : -1) * (Math.random() > 0.3 ? 1 : 0);
      if (dx === 0 && dy === 0 && dz === 0) continue;
      cx = Math.max(0, Math.min(2, cx + dx));
      cy = Math.max(0, Math.min(2, cy + dy));
      cz = Math.max(0, Math.min(2, cz + dz));
      add(cx, cy, cz);
    }
  }

  const result = Array.from(points).map(k => k.split(',').map(Number));
  
  // Verify it spans all 3 dimensions
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;
  result.forEach(p => {
    if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
    if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
    if (p[2] < minZ) minZ = p[2]; if (p[2] > maxZ) maxZ = p[2];
  });

  if ((maxX - minX < 1) || (maxY - minY < 1) || (maxZ - minZ < 1)) {
    return generate3DChiralSeed(); // Retry to ensure full 3D extent
  }
  return result;
}

function generateCandidateRule() {
  const bCount = 1 + Math.floor(Math.random() * 3); // 1~3 birth values
  const B = new Set();
  // Typical birth values in 26-neighborhood that allow growth without immediate explosion
  const plausibleB = [2, 3, 4, 5, 6, 7];
  while (B.size < bCount) {
    B.add(plausibleB[Math.floor(Math.random() * plausibleB.length)]);
  }

  const sCount = 1 + Math.floor(Math.random() * 4); // 1~4 survival values
  const S = new Set();
  const plausibleS = [1, 2, 3, 4, 5, 6, 7, 8];
  while (S.size < sCount) {
    S.add(plausibleS[Math.floor(Math.random() * plausibleS.length)]);
  }

  return { B, S };
}

// Worker evaluation loop
if (!isMainThread) {
  const { maxTrialsPerBatch } = workerData;
  let trials = 0;
  const candidatesFound = [];

  while (trials < maxTrialsPerBatch) {
    trials++;
    const c0 = generate3DChiralSeed();
    const c0Size = c0.length;
    if (c0Size < 4 || c0Size > 16) continue;

    const comps0 = findConnectedComponents(c0);
    if (comps0.length !== 1) continue;

    const rule = generateCandidateRule();
    const signatures = generateSymmetrySignatures(c0);

    let pts = c0;
    const history = [pts];
    let splitCandidate = null;

    for (let t = 1; t <= 8; t++) {
      pts = simulateStep(pts, rule);
      history.push(pts);

      if (pts.length === 0 || pts.length > 8 * c0Size) break; // extinct or exploded

      // Look for 2-cluster or 3-cluster split
      if (pts.length === 2 * c0Size || pts.length === 3 * c0Size) {
        const comps = findConnectedComponents(pts);
        if (comps.length === 2 && comps[0].length === c0Size && comps[1].length === c0Size) {
          const hA = normalizeAndHash(comps[0]);
          const hB = normalizeAndHash(comps[1]);
          if (signatures.has(hA) && signatures.has(hB)) {
            const gA = getCentroid(comps[0]);
            const gB = getCentroid(comps[1]);
            const d = dist(gA, gB);
            if (d >= 2.5) {
              // Check for Cyclic X -> Y -> Z transformation!
              const cyclicA = checkCyclicTransformation(c0, comps[0]);
              const cyclicB = checkCyclicTransformation(c0, comps[1]);
              
              // Also check if displacement vector has components in all 3 axes
              const dx = Math.abs(gA[0] - gB[0]);
              const dy = Math.abs(gA[1] - gB[1]);
              const dz = Math.abs(gA[2] - gB[2]);
              const is3DAxisMotion = (dx > 0.5 && dy > 0.5) || (dy > 0.5 && dz > 0.5) || (dx > 0.5 && dz > 0.5);

              splitCandidate = {
                id: `rep_cyclic_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                ruleStr: `B${Array.from(rule.B).sort().join('')}/S${Array.from(rule.S).sort().join('')}`,
                rule: { B: Array.from(rule.B), S: Array.from(rule.S) },
                splitStep: t,
                cellCount: c0Size,
                centroidDist: d,
                c0,
                cA: comps[0],
                cB: comps[1],
                history,
                isCyclic120: cyclicA.isCyclic120 || cyclicB.isCyclic120,
                cyclicDetails: { cyclicA, cyclicB },
                is3DAxisMotion,
                dispVector: [dx, dy, dz]
              };
              break;
            }
          }
        }
      }
    }

    if (splitCandidate) {
      candidatesFound.push(splitCandidate);
      // Send immediately if cyclic or high-dimension motion
      if (splitCandidate.isCyclic120 || splitCandidate.is3DAxisMotion) {
        parentPort.postMessage({ type: 'FOUND_CYCLIC', candidate: splitCandidate });
      }
    }

    if (trials % 1000 === 0) {
      parentPort.postMessage({ type: 'PROGRESS', trials });
    }
  }

  parentPort.postMessage({ type: 'DONE', trials, candidatesFound });
}

// Main thread orchestrator
if (isMainThread) {
  const numWorkers = Math.max(2, os.cpus().length - 1);
  console.log(`=======================================================`);
  console.log(`🚀 Starting 3-Axis Cyclic (X -> Y -> Z) Replicator Search`);
  console.log(`Using ${numWorkers} parallel workers across CPU cores`);
  console.log(`Target: True 3D Chiral Seeds & 120° Cyclic [1,2,0] Permutations`);
  console.log(`=======================================================\n`);

  let totalTrials = 0;
  let activeWorkers = numWorkers;
  const allCandidates = [];
  const cyclicCandidates = [];

  const startTime = Date.now();

  for (let i = 0; i < numWorkers; i++) {
    const worker = new Worker(__filename, {
      workerData: { maxTrialsPerBatch: 15000 }
    });

    worker.on('message', (msg) => {
      if (msg.type === 'PROGRESS') {
        totalTrials += 1000;
        const elapsed = (Date.now() - startTime) / 1000;
        const speed = Math.round(totalTrials / elapsed);
        process.stdout.write(`\r[Search Progress] Trials: ${totalTrials.toLocaleString()} | Speed: ${speed} evals/s | Cyclic Hits: ${cyclicCandidates.length}`);
      } else if (msg.type === 'FOUND_CYCLIC') {
        const c = msg.candidate;
        cyclicCandidates.push(c);
        console.log(`\n\n✨ [FOUND 3-AXIS / CYCLIC CANDIDATE!]`);
        console.log(`  Rule: ${c.ruleStr} | Step: ${c.splitStep} | Cells: ${c.cellCount} -> ${c.cellCount * 2} | Dist: ${c.centroidDist.toFixed(1)}`);
        console.log(`  120° Cyclic Permutation ([1,2,0]): ${c.isCyclic120 ? 'YES! ★' : 'No'}`);
        console.log(`  3D Multi-Axis Displacement: [dx=${c.dispVector[0].toFixed(1)}, dy=${c.dispVector[1].toFixed(1)}, dz=${c.dispVector[2].toFixed(1)}]`);
      } else if (msg.type === 'DONE') {
        allCandidates.push(...msg.candidatesFound);
        activeWorkers--;
        if (activeWorkers === 0) {
          console.log(`\n\n=== Search Complete ===`);
          console.log(`Total Trials: ${totalTrials.toLocaleString()}`);
          console.log(`Total Replicators Found: ${allCandidates.length}`);
          console.log(`3-Axis / Cyclic Replicators: ${cyclicCandidates.length}`);

          // Save results
          fs.writeFileSync(
            path.join(__dirname, 'cyclic_xyz_results.json'),
            JSON.stringify({ cyclicCandidates, allCandidates }, null, 2),
            'utf-8'
          );
          console.log(`Results saved to cyclic_xyz_results.json!`);
        }
      }
    });

    worker.on('error', (err) => console.error('Worker error:', err));
  }
}
