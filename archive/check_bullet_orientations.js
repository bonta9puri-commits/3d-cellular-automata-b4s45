// check_bullet_orientations.js
// 7セル弾の回転バリエーションとそれぞれの進行方向ベクトルを計算

const b = [4];
const s = [4, 5];

const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

const NEIGHBORS = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS.push([dx, dy, dz]);
    }
  }
}

function pureStep(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nk = `${x+dx},${y+dy},${z+dz}`;
      counts.set(nk, (counts.get(nk) || 0) + 1);
    }
  }
  const next = new Set();
  for (const [k, cnt] of counts.entries()) {
    const alive = current.has(k);
    if (alive && s.includes(cnt)) next.add(k);
    else if (!alive && b.includes(cnt)) next.add(k);
  }
  return next;
}

// 90度回転 (Z軸まわり)
function rotZ(coords) {
  return coords.map(([x,y,z]) => [-y, x, z]);
}
// 90度回転 (X軸まわり)
function rotX(coords) {
  return coords.map(([x,y,z]) => [x, -z, y]);
}
// 90度回転 (Y軸まわり)
function rotY(coords) {
  return coords.map(([x,y,z]) => [z, y, -x]);
}

function testDirection(name, coords) {
  let c = new Set(coords.map(p => p.join(',')));
  const t0Arr = Array.from(c).map(k => k.split(',').map(Number));
  const c0 = t0Arr.reduce((acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0]).map(v => v/7);

  for (let t = 1; t <= 4; t++) c = pureStep(c);
  const t4Arr = Array.from(c).map(k => k.split(',').map(Number));
  const c4 = t4Arr.reduce((acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0]).map(v => v/7);

  const dx = Math.round(c4[0] - c0[0]);
  const dy = Math.round(c4[1] - c0[1]);
  const dz = Math.round(c4[2] - c0[2]);
  console.log(`${name}: 変位 = [${dx}, ${dy}, ${dz}]`);
  return { coords, dir: [dx, dy, dz] };
}

console.log('=== 7セル弾の進行方向バリエーション ===');
testDirection('標準', init7);
testDirection('rotZ', rotZ(init7));
testDirection('rotZ x 2', rotZ(rotZ(init7)));
testDirection('rotZ x 3', rotZ(rotZ(rotZ(init7))));
testDirection('rotY', rotY(init7));
testDirection('rotX', rotX(init7));
