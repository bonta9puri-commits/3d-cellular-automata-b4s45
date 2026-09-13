// replicatorCore.js - 3D Replicator Finder Core Algorithms

// 3D 48 Symmetry Transforms (Cube symmetry group Oh = 24 rotations + 24 reflections)
const PERMUTATIONS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];
const SIGNS = [
  [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
  [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
];

/**
 * Transforms a list of [x, y, z] points and normalizes to origin (minX=0, minY=0, minZ=0).
 * Returns sorted canonical string signature.
 */
function normalizeAndHash(points) {
  if (!points || points.length === 0) return '';
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (p[0] < minX) minX = p[0];
    if (p[1] < minY) minY = p[1];
    if (p[2] < minZ) minZ = p[2];
  }
  const translated = points.map(p => [p[0] - minX, p[1] - minY, p[2] - minZ]);
  translated.sort((a, b) => {
    if (a[0] !== b[0]) return a[0] - b[0];
    if (a[1] !== b[1]) return a[1] - b[1];
    return a[2] - b[2];
  });
  return translated.map(p => `${p[0]},${p[1]},${p[2]}`).join(';');
}

/**
 * Generate all 48 symmetry signatures for a cluster C0.
 * Returns a Set of canonical signature strings.
 */
function generateSymmetrySignatures(c0Points) {
  const signatures = new Set();
  for (const perm of PERMUTATIONS) {
    for (const sign of SIGNS) {
      const transformed = c0Points.map(p => [
        p[perm[0]] * sign[0],
        p[perm[1]] * sign[1],
        p[perm[2]] * sign[2]
      ]);
      signatures.add(normalizeAndHash(transformed));
    }
  }
  return signatures;
}

// 26-neighborhood offsets
const NEIGHBORS_26 = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS_26.push([dx, dy, dz]);
    }
  }
}

/**
 * Cluster points into 26-connected components using BFS.
 */
function findConnectedComponents(points) {
  if (points.length === 0) return [];
  const pointMap = new Map();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    pointMap.set(`${p[0]},${p[1]},${p[2]}`, p);
  }

  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < points.length; i++) {
    const key = `${points[i][0]},${points[i][1]},${points[i][2]}`;
    if (visited.has(key)) continue;

    const cluster = [];
    const queue = [points[i]];
    visited.add(key);

    while (queue.length > 0) {
      const curr = queue.shift();
      cluster.push(curr);

      for (const [dx, dy, dz] of NEIGHBORS_26) {
        const nx = curr[0] + dx;
        const ny = curr[1] + dy;
        const nz = curr[2] + dz;
        const nkey = `${nx},${ny},${nz}`;
        if (pointMap.has(nkey) && !visited.has(nkey)) {
          visited.add(nkey);
          queue.push(pointMap.get(nkey));
        }
      }
    }
    clusters.push(cluster);
  }

  return clusters;
}

/**
 * Calculate centroid of points.
 */
function getCentroid(points) {
  let sx = 0, sy = 0, sz = 0;
  for (const p of points) {
    sx += p[0];
    sy += p[1];
    sz += p[2];
  }
  const n = points.length;
  return [sx / n, sy / n, sz / n];
}

/**
 * Calculate Euclidean distance between two 3D points.
 */
function dist(p1, p2) {
  const dx = p1[0] - p2[0];
  const dy = p1[1] - p2[1];
  const dz = p1[2] - p2[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Sparse Step Simulation of 3D Cellular Automata.
 * Accepts activePoints: array of [x, y, z]
 * rule: { B: Set of birth neighbor counts, S: Set of survival neighbor counts }
 * Returns new array of [x, y, z]
 */
function simulateStep(activePoints, rule) {
  const neighborCounts = new Map(); // key -> { count: number, coord: [x,y,z] }
  const aliveSet = new Set();

  for (const p of activePoints) {
    const key = `${p[0]},${p[1]},${p[2]}`;
    aliveSet.add(key);

    for (const [dx, dy, dz] of NEIGHBORS_26) {
      const nx = p[0] + dx;
      const ny = p[1] + dy;
      const nz = p[2] + dz;
      const nkey = `${nx},${ny},${nz}`;
      let entry = neighborCounts.get(nkey);
      if (!entry) {
        entry = { count: 1, coord: [nx, ny, nz] };
        neighborCounts.set(nkey, entry);
      } else {
        entry.count++;
      }
    }
  }

  const nextActive = [];

  // Check all cells that have neighbors
  for (const [key, entry] of neighborCounts) {
    const isAlive = aliveSet.has(key);
    if (isAlive) {
      if (rule.S.has(entry.count)) {
        nextActive.push(entry.coord);
      }
    } else {
      if (rule.B.has(entry.count)) {
        nextActive.push(entry.coord);
      }
    }
  }

  return nextActive;
}

/**
 * Check if a single seed replicates cleanly into 2 congruent copies within maxSteps.
 * Returns replication result if found, else null.
 */
function evaluateSeed(c0Points, rule, maxSteps = 30, minCentroidDist = 3.0, minStep = 2, requireSurvival = true) {
  // S.length > 0: Exclude rules with no survival capability
  if (requireSurvival && (!rule.S || rule.S.size === 0)) {
    return null;
  }

  const c0Size = c0Points.length;
  if (c0Size < 3) return null;

  // Verify initial C0 is a single connected cluster
  const initialClusters = findConnectedComponents(c0Points);
  if (initialClusters.length !== 1) return null;

  // Precompute 48 symmetry signatures for C0
  const symmetrySignatures = generateSymmetrySignatures(c0Points);

  let currentPoints = c0Points;
  const history = [currentPoints];

  for (let step = 1; step <= maxSteps; step++) {
    currentPoints = simulateStep(currentPoints, rule);
    history.push(currentPoints);

    // If extinct, abort early
    if (currentPoints.length === 0) break;

    // Filter: only consider replication at step >= minStep
    if (step >= minStep && currentPoints.length === 2 * c0Size) {
      // Condition 1: Must decompose into EXACTLY 2 clusters
      const clusters = findConnectedComponents(currentPoints);
      if (clusters.length === 2) {
        const [cA, cB] = clusters;
        if (cA.length === c0Size && cB.length === c0Size) {
          // Condition 3: Centroid distance >= minCentroidDist (e.g. >= 3.0)
          const gA = getCentroid(cA);
          const gB = getCentroid(cB);
          const centroidDist = dist(gA, gB);

          if (centroidDist >= minCentroidDist) {
            // Condition 2: Congruence to C0 under translation, rotation, or reflection
            const hashA = normalizeAndHash(cA);
            const hashB = normalizeAndHash(cB);

            if (symmetrySignatures.has(hashA) && symmetrySignatures.has(hashB)) {
              // ★ Automatic Multi-Cycle (2T & 4T) Verification ★
              const splitStep = step;
              const maxVerifyStep = Math.min(36, splitStep * 4);
              let vPoints = currentPoints;
              let gen2Pass = false;
              let gen4Pass = false;
              const cycleReports = [
                { cycle: 1, step: splitStep, clusterCount: 2, congruentCount: 2, totalCells: currentPoints.length, isClean: true }
              ];

              for (let vt = splitStep + 1; vt <= maxVerifyStep; vt++) {
                vPoints = simulateStep(vPoints, rule);
                history.push(vPoints);

                if (vPoints.length === 0 || vPoints.length > 16 * c0Size + 100) break;

                // Cycle 2 at 2T
                if (vt === splitStep * 2) {
                  const comps2 = findConnectedComponents(vPoints);
                  let c2Matches = 0;
                  for (const c of comps2) {
                    if (c.length === c0Size && symmetrySignatures.has(normalizeAndHash(c))) {
                      c2Matches++;
                    }
                  }
                  gen2Pass = (comps2.length === c2Matches && c2Matches >= 2);
                  cycleReports.push({
                    cycle: 2,
                    step: vt,
                    clusterCount: comps2.length,
                    congruentCount: c2Matches,
                    totalCells: vPoints.length,
                    isClean: gen2Pass
                  });
                }

                // Cycle 3 at 4T
                if (vt === splitStep * 4) {
                  const comps4 = findConnectedComponents(vPoints);
                  let c4Matches = 0;
                  for (const c of comps4) {
                    if (c.length === c0Size && symmetrySignatures.has(normalizeAndHash(c))) {
                      c4Matches++;
                    }
                  }
                  gen4Pass = (comps4.length === c4Matches && c4Matches >= 2);
                  cycleReports.push({
                    cycle: 3,
                    step: vt,
                    clusterCount: comps4.length,
                    congruentCount: c4Matches,
                    totalCells: vPoints.length,
                    isClean: gen4Pass
                  });
                }
              }

              const isVerifiedInfinite = (gen2Pass && gen4Pass);

              return {
                success: true,
                splitStep,
                c0: c0Points,
                cA,
                cB,
                centroidDist,
                gA,
                gB,
                history,
                gen2Pass,
                gen4Pass,
                isVerifiedInfinite,
                cycleReports,
                rule: {
                  B: Array.from(rule.B).sort((a,b) => a-b),
                  S: Array.from(rule.S).sort((a,b) => a-b)
                }
              };
            }
          }
        }
      }
    }

    // Explosion safeguard: if population explodes beyond 8 * |C0|, abort
    if (currentPoints.length > 8 * c0Size + 100) break;
  }

  return null;
}

/**
 * Generator for symmetric seeds within box (width, height, depth).
 * Types: 'inversion' (point symmetric), 'mirrorX' (planar mirror), 'axisZ' (180 deg axis)
 */
function generateSymmetricSeed(w = 3, h = 3, d = 3, minCells = 4, maxCells = 16, symmetryType = 'inversion') {
  const maxTries = 50;
  for (let tryIdx = 0; tryIdx < maxTries; tryIdx++) {
    const grid = new Set();
    const halfX = Math.floor((w + 1) / 2);

    for (let x = 0; x < halfX; x++) {
      for (let y = 0; y < h; y++) {
        for (let z = 0; z < d; z++) {
          if (Math.random() < 0.45) {
            const p1 = [x, y, z];
            grid.add(`${p1[0]},${p1[1]},${p1[2]}`);

            let p2;
            if (symmetryType === 'inversion') {
              p2 = [w - 1 - x, h - 1 - y, d - 1 - z];
            } else if (symmetryType === 'mirrorX') {
              p2 = [w - 1 - x, y, z];
            } else {
              // 180 axis Z
              p2 = [w - 1 - x, h - 1 - y, z];
            }
            grid.add(`${p2[0]},${p2[1]},${p2[2]}`);
          }
        }
      }
    }

    const points = Array.from(grid).map(k => k.split(',').map(Number));
    if (points.length >= minCells && points.length <= maxCells) {
      const clusters = findConnectedComponents(points);
      if (clusters.length === 1) {
        return points;
      }
    }
  }
  return null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PERMUTATIONS,
    SIGNS,
    normalizeAndHash,
    generateSymmetrySignatures,
    findConnectedComponents,
    getCentroid,
    dist,
    simulateStep,
    evaluateSeed,
    generateSymmetricSeed
  };
}
