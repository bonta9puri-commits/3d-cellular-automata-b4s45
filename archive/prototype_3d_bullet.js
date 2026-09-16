/**
 * Step 1: 3D Bullet Prototype via 2D Glider Squared (Cartesian / Orthogonal Product)
 * 
 * 2D Glider (5 cells):
 *  . # .
 *  . . #
 *  # # #
 */

const { simulateStep, getCentroid } = require('./replicatorCore.js');
const fs = require('fs');

// 2D Glider base points in (u, v):
const g2d = [
  [0, 1],
  [1, 2],
  [2, 0], [2, 1], [2, 2]
];

console.log('=== Step 1: 2D Glider Squared (3D Bullet) Prototype ===\n');

// Model 1: Orthogonal Cross-Wing (Cruciform Missile)
// Glider A in X-Y plane (z=1), Glider B in Y-Z plane (x=1), intersecting along Y
const model1 = [];
const set1 = new Set();
for (const [x, y] of g2d) {
  const k = `${x},${y},1`;
  if (!set1.has(k)) { set1.add(k); model1.push([x, y, 1]); }
}
for (const [z, y] of g2d) {
  const k = `1,${y},${z}`;
  if (!set1.has(k)) { set1.add(k); model1.push([1, y, z]); }
}
console.log(`Model 1 (Cruciform Cross-Wing): ${model1.length} cells (<= 25)`);

// Model 2: Tensor Product / Delta-Wing Pyramid
// (x, y) in G and (y, z) in G -> (x, y, z)
const model2 = [];
const set2 = new Set();
for (const [x, y1] of g2d) {
  for (const [y2, z] of g2d) {
    if (y1 === y2) {
      const k = `${x},${y1},${z}`;
      if (!set2.has(k)) { set2.add(k); model2.push([x, y1, z]); }
    }
  }
}
console.log(`Model 2 (Tensor Product Delta-Wing): ${model2.length} cells (exactly <= 25)`);

// Model 3: Chiral 90-degree Twisted Tandem
// Front half in X-Y, Rear half in Y-Z with offset
const model3 = [];
for (const [x, y] of g2d) model3.push([x, y, 0]);
for (const [z, y] of g2d) model3.push([1, y + 2, z + 1]);
console.log(`Model 3 (Twisted Tandem Missile): ${model3.length} cells (<= 25)`);

// Simulate these 3 models across key 3D rules
const testRules = [
  { name: "B3/S23 (Conway 3D)", rule: { B: new Set([3]), S: new Set([2, 3]) } },
  { name: "Life 4555 (B5/S45)", rule: { B: new Set([5]), S: new Set([4, 5]) } },
  { name: "Life 5766 (B6/S567)", rule: { B: new Set([6]), S: new Set([5, 6, 7]) } },
  { name: "B35/S4 (C3 Screw)", rule: { B: new Set([3, 5]), S: new Set([4]) } },
  { name: "B3/S145 (Twist)", rule: { B: new Set([3]), S: new Set([1, 4, 5]) } }
];

const results = {
  model1: { name: "十字翼型ミサイル (Cruciform)", cells: model1 },
  model2: { name: "テンソル積デルタ翼 (Tensor Delta)", cells: model2 },
  model3: { name: "90°ツイスト結合弾 (Chiral Tandem)", cells: model3 },
  simulations: {}
};

for (const [mKey, mData] of Object.entries({ model1, model2, model3 })) {
  results.simulations[mKey] = {};
  for (const r of testRules) {
    let c = mData;
    let hist = [c];
    for (let t = 0; t < 12; t++) {
      c = simulateStep(c, r.rule);
      hist.push(c);
      if (c.length === 0 || c.length > 80) break;
    }
    results.simulations[mKey][r.name] = hist;
  }
}

fs.writeFileSync('bullet_prototype_data.json', JSON.stringify(results), 'utf8');
console.log('\nSuccessfully saved bullet_prototype_data.json!');
