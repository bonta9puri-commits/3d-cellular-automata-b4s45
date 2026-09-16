/**
 * 🌌 3D Cellular Automata Multi-Rule Researcher's Search Toolkit (Node.js)
 * =========================================================================
 * 外部依存関係ゼロ (Vanilla Node.js) で動作する万能探索エンジン。
 * コピペして `node b4s45_researcher_toolkit.js` とするだけで即実行可能！
 *
 * 【収録機能】
 * 1. 任意ルール対応 3D Moore 26近傍スパースCAシミュレータ (B.../S...)
 * 2. 立方体対称群 Oh (48対称性) の正規化ハッシュ・合同判定
 * 3. 26連結成分分解 (BFS クラスタリング)
 * 4. 歴代の有望ルール＆代表構造体カタログ (Historic Promising Rules & Seeds):
 *    - B4/S45: 7セル呼吸グライダー & 6セル立方体結晶
 *    - Life 5766 (B6/S567): 10セル 2層直積グライダー (厚み2宇宙船)
 *    - B5/S4567: 15セル深層有機的自己複製子 (T=8,16,24,32 指数増殖)
 *    - B3/S145: 6セル 90°ツイスト直交偏光自己複製子
 *    - B35/S4: 9セル 3軸C3対角スクリュー自己複製子
 *    - B3/S136: 4セル Diamond Pulsar
 *    - B35/S567: 5セル Z-Surge パルサー
 * 5. 未解決探究課題の探索テンプレート:
 *    - Task 1: 偏光板 / 空間フィルター探索
 *    - Task 2: 非破壊読み出し (掠め衝突) 探索
 *    - Task 3: 完全自立型グライダー銃 (自律発振エンジン) 探索
 */

// ==========================================
// 1. ルール物理エンジン (任意 B.../S... 対応)
// ==========================================
let CURRENT_RULE_STR = "B4/S45";
let B_RULE = [4];
let S_RULE = [4, 5];

function parseRule(ruleStr) {
  const match = ruleStr.trim().toUpperCase().match(/^B([0-9]+)\/S([0-9]+)$/);
  if (!match) throw new Error(`Invalid rule string: ${ruleStr}. Expected format: B.../S... (e.g. B4/S45)`);
  const b = match[1].split('').map(Number);
  const s = match[2].split('').map(Number);
  return { b, s, str: ruleStr };
}

function setRule(ruleStr) {
  const parsed = parseRule(ruleStr);
  CURRENT_RULE_STR = parsed.str;
  B_RULE = parsed.b;
  S_RULE = parsed.s;
}

const NEIGHBORS_26 = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS_26.push([dx, dy, dz]);
    }
  }
}

function simulateStep(cellSet, bList = B_RULE, sList = S_RULE) {
  const counts = new Map();
  for (const k of cellSet) {
    const [x, y, z] = k.split(',').map(Number);
    for (const [dx, dy, dz] of NEIGHBORS_26) {
      const nk = `${x + dx},${y + dy},${z + dz}`;
      counts.set(nk, (counts.get(nk) || 0) + 1);
    }
  }
  const nextSet = new Set();
  for (const [k, cnt] of counts.entries()) {
    const alive = cellSet.has(k);
    if (alive && sList.includes(cnt)) nextSet.add(k);
    else if (!alive && bList.includes(cnt)) nextSet.add(k);
  }
  return nextSet;
}

function toSet(coords) {
  return new Set(coords.map(c => `${c[0]},${c[1]},${c[2]}`));
}

function toCoords(cellSet) {
  return Array.from(cellSet).map(k => k.split(',').map(Number));
}

// ==========================================
// 2. 48対称性 (Oh) 正規化ハッシュ・合同判定
// ==========================================
const PERMUTATIONS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];
const SIGNS = [
  [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
  [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]
];

function normalizeAndHash(points) {
  if (!points || points.length === 0) return '';
  let bestRepr = null;

  for (const p of PERMUTATIONS) {
    for (const s of SIGNS) {
      const transformed = points.map(pt => [
        pt[p[0]] * s[0],
        pt[p[1]] * s[1],
        pt[p[2]] * s[2]
      ]);

      let minX = Infinity, minY = Infinity, minZ = Infinity;
      for (const c of transformed) {
        if (c[0] < minX) minX = c[0];
        if (c[1] < minY) minY = c[1];
        if (c[2] < minZ) minZ = c[2];
      }

      const shifted = transformed.map(c => [c[0] - minX, c[1] - minY, c[2] - minZ]);
      shifted.sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]));

      const repr = shifted.map(c => `${c[0]},${c[1]},${c[2]}`).join(';');
      if (bestRepr === null || repr < bestRepr) {
        bestRepr = repr;
      }
    }
  }
  return bestRepr;
}

function generateSymmetrySignatures(points) {
  const signatures = new Set();
  for (const p of PERMUTATIONS) {
    for (const s of SIGNS) {
      const transformed = points.map(pt => [
        pt[p[0]] * s[0],
        pt[p[1]] * s[1],
        pt[p[2]] * s[2]
      ]);
      signatures.add(normalizeAndHash(transformed));
    }
  }
  return signatures;
}

// ==========================================
// 3. 26近傍連結クラスタ分解 (BFS)
// ==========================================
function findConnectedComponents(points) {
  const pointMap = new Map();
  for (const p of points) pointMap.set(`${p[0]},${p[1]},${p[2]}`, p);

  const visited = new Set();
  const clusters = [];

  for (const p of points) {
    const key = `${p[0]},${p[1]},${p[2]}`;
    if (visited.has(key)) continue;

    const cluster = [];
    const queue = [p];
    visited.add(key);

    while (queue.length > 0) {
      const curr = queue.shift();
      cluster.push(curr);
      for (const [dx, dy, dz] of NEIGHBORS_26) {
        const nkey = `${curr[0] + dx},${curr[1] + dy},${curr[2] + dz}`;
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

// ==========================================
// 4. 歴代の有望ルール＆代表構造体カタログ
// ==========================================
const HISTORIC_PRESETS = {
  // ① B4/S45: 純粋素粒子物理の王国
  GLIDER_7_B4S45: {
    name: "7-Cell Breathing Glider",
    rule: "B4/S45",
    type: "Glider (v=c/4, Period=4)",
    coords: [
      [0,0,0], [0,1,0], [0,2,0],
      [0,1,1], [1,0,1], [1,1,1], [1,2,1]
    ]
  },
  CRYSTAL_6_B4S45: {
    name: "6-Cell Cube Crystal",
    rule: "B4/S45",
    type: "Still Life (Collision SET result)",
    coords: [
      [-2,-1,3], [-2,0,2], [-1,-1,3],
      [-1,0,2], [-1,0,3], [-2,-1,2]
    ]
  },

  // ② Life 5766 (B6/S567): 2D直積グライダー・銃の体系
  GLIDER_10_B6S567: {
    name: "10-Cell Flat Glider (Life 5766)",
    rule: "B6/S567",
    type: "Spaceship (Z-thickness=2, v=c/4 horizontal diagonal)",
    coords: [
      [0,1,0], [0,1,1], [1,2,0], [1,2,1], [2,0,0],
      [2,0,1], [2,1,0], [2,1,1], [2,2,0], [2,2,1]
    ]
  },

  // ③ B5/S4567: 深層有機的自己複製子の楽園
  REPLICATOR_15_B5S4567: {
    name: "15-Cell Organic Meta-Splitter",
    rule: "B5/S4567",
    type: "Exponential Replicator (t=8,16,24,32)",
    coords: [
      [0,0,1], [2,2,1], [0,1,1], [2,1,1], [0,1,2],
      [2,1,2], [0,2,1], [2,0,1], [1,0,1], [1,2,1],
      [1,0,2], [1,2,2], [1,1,0], [1,2,0], [1,0,0]
    ]
  },

  // ④ B3/S145: 90°ツイスト直交偏光波自己複製子
  TWIST_6_B3S145: {
    name: "6-Cell Chiral Twisted Cross",
    rule: "B3/S145",
    type: "Orthogonal Polarization Replicator (t=2^n)",
    coords: [
      [0,1,1], [2,1,1], [1,1,1],
      [1,1,2], [1,2,2], [1,0,2]
    ]
  },

  // ⑤ B35/S4: 3軸C3対角スクリュー自己複製子
  C3_SCREW_9_B35S4: {
    name: "9-Cell 3-Axis C3 Diagonal Replicator",
    rule: "B35/S4",
    type: "C3-Cyclic Diagonal Replicator (t=2, Disp=[2,2,2])",
    coords: [
      [1,1,0], [1,0,1], [0,1,1],
      [1,1,2], [1,2,1], [2,1,1],
      [2,0,1], [0,1,2], [1,2,0]
    ]
  },

  // ⑥ B3/S136: Diamond Pulsar
  DIAMOND_4_B3S136: {
    name: "4-Cell Diamond Pulsar",
    rule: "B3/S136",
    type: "Sierpinski Fractal Replicator (t=4,8,16,32)",
    coords: [
      [0,0,1], [2,0,1], [1,0,0], [1,0,2]
    ]
  },

  // ⑦ B35/S567: Z-Surge パルサー
  Z_SURGE_5_B35S567: {
    name: "5-Cell Z-Surge Pulsar",
    rule: "B35/S567",
    type: "Z-Axis Beam Pulse Replicator (t=4,8,16,32)",
    coords: [
      [0,0,0], [2,2,0], [1,0,0], [1,2,0], [1,1,0]
    ]
  }
};

// ==========================================
// 5. 探索モジュール (Tasks)
// ==========================================

/**
 * Task 1: 偏光フィルター (Polarizing Filter) 探索テンプレート
 */
function testPolarizerFilter(filterSeed, gliderOffset, ruleStr = "B4/S45") {
  const { b, s } = parseRule(ruleStr);
  const glider = HISTORIC_PRESETS.GLIDER_7_B4S45.coords;
  let u = new Set();
  filterSeed.forEach(c => u.add(`${c[0]},${c[1]},${c[2]}`));
  glider.forEach(c => u.add(`${c[0] + gliderOffset[0]},${c[1] + gliderOffset[1]},${c[2] + gliderOffset[2]}`));

  for (let t = 1; t <= 32; t++) {
    u = simulateStep(u, b, s);
    if (u.size === 0 || u.size > 200) return { passed: false };
  }
  return { passed: true, finalCells: u.size };
}

/**
 * Task 2: 非破壊読み出し (Non-Destructive Read) 探索テンプレート
 */
function searchNonDestructiveRead(ruleStr = "B4/S45") {
  console.log(`\n--- Task 2: 非破壊読み出し (掠め衝突) 探索 [ルール: ${ruleStr}] ---`);
  const { b, s } = parseRule(ruleStr);
  const crystal = HISTORIC_PRESETS.CRYSTAL_6_B4S45.coords;
  const crystalSig = normalizeAndHash(crystal);
  const glider = HISTORIC_PRESETS.GLIDER_7_B4S45.coords;
  const hits = [];

  for (let ox = -4; ox <= 4; ox++) {
    for (let oy = -4; oy <= 4; oy++) {
      for (let oz = 4; oz <= 8; oz++) {
        let u = new Set();
        crystal.forEach(c => u.add(`${c[0]},${c[1]},${c[2]}`));
        glider.forEach(c => u.add(`${c[0] + ox},${c[1] + oy},${c[2] + oz}`));

        for (let t = 1; t <= 24; t++) {
          u = simulateStep(u, b, s);
          if (u.size === 0 || u.size > 80) break;
          if (t >= 8) {
            const clusters = findConnectedComponents(toCoords(u));
            for (const cl of clusters) {
              if (cl.length === 6 && normalizeAndHash(cl) === crystalSig) {
                if (u.size > 6) {
                  hits.push({ offset: [ox, oy, oz], step: t, totalCells: u.size, clusters: clusters.length });
                }
              }
            }
          }
        }
      }
    }
  }
  console.log(`探索完了: 結晶復元ヒット数 = ${hits.length} 件`);
  if (hits.length > 0) console.log('有望オフセット候補 (先頭3件):', hits.slice(0, 3));
  return hits;
}

/**
 * Task 3: 自立グライダー銃 (Glider Gun) 探索テンプレート
 * 任意のルール、任意の弾丸シグネチャに対応
 */
function searchGliderGun(samples = 200, ruleStr = "B4/S45", bulletPresetKey = "GLIDER_7_B4S45") {
  console.log(`\n--- Task 3: 自立グライダー銃 探索 [ルール: ${ruleStr}, 弾丸: ${bulletPresetKey}] ---`);
  const { b, s } = parseRule(ruleStr);
  const bullet = HISTORIC_PRESETS[bulletPresetKey].coords;
  const bulletSigs = generateSymmetrySignatures(bullet);
  let found = 0;

  for (let sIdx = 0; sIdx < samples; sIdx++) {
    const seed = [];
    const set = new Set();
    const targetSize = 12 + Math.floor(Math.random() * 7) * 2;
    for (let i = 0; i < 50 && seed.length < targetSize; i++) {
      const x = Math.floor(Math.random() * 5) - 2;
      const y = Math.floor(Math.random() * 5) - 2;
      const z = Math.floor(Math.random() * 5) - 2;
      const k1 = `${x},${y},${z}`;
      const k2 = `${-x},${-y},${-z}`;
      if (!set.has(k1)) { set.add(k1); seed.push([x,y,z]); }
      if (!set.has(k2)) { set.add(k2); seed.push([-x,-y,-z]); }
    }

    let u = toSet(seed);
    for (let t = 1; t <= 48; t++) {
      u = simulateStep(u, b, s);
      if (u.size === 0 || u.size > 250) break;

      if (t >= 16 && u.size >= seed.length + bullet.length) {
        const clusters = findConnectedComponents(toCoords(u));
        for (const cl of clusters) {
          if (cl.length === bullet.length && bulletSigs.has(normalizeAndHash(cl))) {
            console.log(`\n🎉 グライダー射出候補を発見！ (t=${t}, 全セル数=${u.size})`);
            console.log('シード座標:', JSON.stringify(seed));
            found++;
            break;
          }
        }
      }
    }
  }
  console.log(`銃探索完了: 候補発見数 = ${found} 件`);
}

// ==========================================
// メイン実行部
// ==========================================
console.log('=================================================================');
console.log('🌌 3D Cellular Automata Multi-Rule Researcher Toolkit 起動');
console.log('=================================================================');

// 1. コア体系 B4/S45 の基本物理テスト
console.log('\n【1. コア体系 (B4/S45) 基本物理動作検証】');
setRule("B4/S45");
const g7 = HISTORIC_PRESETS.GLIDER_7_B4S45.coords;
let testU = new Set();
g7.forEach(c => testU.add(`${c[0]},${c[1]},${c[2]}`));
g7.forEach(c => testU.add(`${-c[0]-3},${c[1]-3},${5-c[2]}`));
for (let t = 1; t <= 10; t++) testU = simulateStep(testU);
console.log(`1. 衝突結晶化 (SET):   t=10 セル数 = ${testU.size} (期待値: 6)`);

g7.forEach(c => testU.add(`${c[0]-3},${c[1]-3},${5-c[2]}`));
for (let t = 1; t <= 8; t++) testU = simulateStep(testU);
console.log(`2. 完全対消滅 (RESET):  t=8  セル数 = ${testU.size} (期待値: 0 完全真空)`);

// 2. 歴代有望ルール＆構造体の実証テスト
console.log('\n【2. 歴代の有望ルール＆代表構造体 (Historic Rules) 検証】');

// (A) Life 5766 (B6/S567) 10セル 2層直積グライダー
{
  const { b, s } = parseRule("B6/S567");
  let u10 = toSet(HISTORIC_PRESETS.GLIDER_10_B6S567.coords);
  for (let t = 1; t <= 4; t++) u10 = simulateStep(u10, b, s);
  console.log(`・Life 5766 (B6/S567): 10セルグライダー 1周期(t=4)滑空後セル数 = ${u10.size} (期待値: 10)`);
}

// (B) B5/S4567 15セル有機的自己複製子
{
  const { b, s } = parseRule("B5/S4567");
  let u15 = toSet(HISTORIC_PRESETS.REPLICATOR_15_B5S4567.coords);
  for (let t = 1; t <= 8; t++) u15 = simulateStep(u15, b, s);
  console.log(`・B5/S4567: 15セル自己複製子 t=8 分裂後セル数 = ${u15.size} (期待値: 30 = 2体)`);
}

// (C) B3/S145 6セル 90°ツイスト自己複製子
{
  const { b, s } = parseRule("B3/S145");
  let u6 = toSet(HISTORIC_PRESETS.TWIST_6_B3S145.coords);
  for (let t = 1; t <= 2; t++) u6 = simulateStep(u6, b, s);
  console.log(`・B3/S145: 6セルツイスト t=2 分裂後セル数 = ${u6.size} (期待値: 12 = 2体)`);
}

// (D) B35/S4 9セル C3対角スクリュー自己複製子
{
  const { b, s } = parseRule("B35/S4");
  let u9 = toSet(HISTORIC_PRESETS.C3_SCREW_9_B35S4.coords);
  for (let t = 1; t <= 2; t++) u9 = simulateStep(u9, b, s);
  console.log(`・B35/S4: 9セルC3対角スクリュー t=2 分裂後セル数 = ${u9.size} (期待値: 18 = 2体)`);
}

// 3. 課題2 (B4/S45 掠め衝突)
searchNonDestructiveRead("B4/S45");

// 4. 課題3 (自立銃探索デモ: B4/S45 と Life 5766 の両方で実行可能)
searchGliderGun(100, "B4/S45", "GLIDER_7_B4S45");
searchGliderGun(100, "B6/S567", "GLIDER_10_B6S567");

console.log('\n=================================================================');
console.log('✅ 全検証・スクリーニング完了！');
console.log('コード中の setRule("ルール") や HISTORIC_PRESETS を活用して、');
console.log('独自の体系や新種グライダー・銃の探索を自由にお楽しみください！');
console.log('=================================================================');
