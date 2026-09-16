// map_spark_timeline.js
// Gosper Gun (Life 5766) の1周期 (t=0..30) における
// 「火花（Z < 0 または Z > 1 への漏洩）の時空間マップ」を完全特定する

const GOSPER_GUN_2D = [
  [0, 4], [0, 5], [1, 4], [1, 5],
  [10, 4], [10, 5], [10, 6],
  [11, 3], [11, 7],
  [12, 2], [12, 8],
  [13, 2], [13, 8],
  [14, 5],
  [15, 3], [15, 7],
  [16, 4], [16, 5], [16, 6],
  [17, 5],
  [20, 2], [20, 3], [20, 4],
  [21, 2], [21, 3], [21, 4],
  [22, 1], [22, 5],
  [24, 0], [24, 1], [24, 5], [24, 6],
  [34, 2], [34, 3], [35, 2], [35, 3]
];

const b = [6];
const s = [5, 6, 7];

const NEIGHBORS = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS.push([dx, dy, dz]);
    }
  }
}

// 銃本体のみが正常に動作している状態（スリーブ内）で、
// もしスリーブを外したら「毎ステップどこに火花が吹き出そうとしているか」をスキャン
function scanSparkLeaks(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nk = `${x+dx},${y+dy},${z+dz}`;
      counts.set(nk, (counts.get(nk) || 0) + 1);
    }
  }

  // スリーブ外 (z < 0 または z > 1) で近傍数が 6 (誕生) になっている箇所をすべて抽出
  const sparkPoints = [];
  for (const [k, cnt] of counts.entries()) {
    const [x,y,z] = k.split(',').map(Number);
    if ((z < 0 || z > 1) && !current.has(k) && b.includes(cnt)) {
      sparkPoints.push({ coord: [x, y, z], count: cnt });
    }
  }
  return sparkPoints;
}

// 正常な銃のステップ (Z in [0, 1])
function stepNormalGun(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nz = z + dz;
      if (nz !== 0 && nz !== 1) continue;
      const nk = `${x+dx},${y+dy},${nz}`;
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

let cells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  cells.add(`${x},${y},0`);
  cells.add(`${x},${y},1`);
}

console.log('=== 銃の1周期 (t=0..30) 火花発生マップ スキャン ===');

const sparkTimeline = [];
for (let t = 0; t <= 30; t++) {
  const sparks = scanSparkLeaks(cells);
  if (sparks.length > 0) {
    console.log(`t=${t}: 火花発生数=${sparks.length}`);
    for (const sp of sparks) {
      console.log(`   座標: (${sp.coord[0]}, ${sp.coord[1]}, ${sp.coord[2]}), 近傍数=${sp.count}`);
    }
    sparkTimeline.push({ t, sparks });
  } else {
    console.log(`t=${t}: クリーン (火花ゼロ)`);
  }
  cells = stepNormalGun(cells);
}

fs.writeFileSync('spark_timeline.json', JSON.stringify(sparkTimeline, null, 2), 'utf8');
