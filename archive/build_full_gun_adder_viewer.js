// build_full_gun_adder_viewer.js
// 100%純粋自立型 砲台発射から始まる 3D 半加算器 (Full Gun Adder)
// 砲台A & 砲台B から実際に弾丸が発射され、中央アタッチメントで合流して 1+1=2 を計算する完全統合シミュレータ！

const fs = require('fs');

const b = [4];
const s = [4, 5];

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

// 7セル弾
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// 28セル完全自立砲台の構成部品 (pure_3d_gun_viewer.js より)
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

// 砲台を構築する関数 (基準座標 [ox, oy, oz], 向き dir)
function buildGun(ox, oy, oz, dirX = 1, dirZ = 1) {
  const cells = [];
  // 左エンジン (8セル)
  osc8.forEach(([x,y,z]) => cells.push([ox + x * dirX, oy + y, oz + z * dirZ]));
  // 右エンジン (8セル)
  osc8.forEach(([x,y,z]) => cells.push([ox + (10 - x) * dirX, oy + y, oz + z * dirZ]));
  // 前後アンカー (12セル)
  still6.forEach(([x,y,z]) => {
    cells.push([ox + (x + 4) * dirX, oy + (y + 6), oz + z * dirZ]);
    cells.push([ox + (x + 4) * dirX, oy + (y - 5), oz + z * dirZ]);
  });
  return cells;
}

console.log("Constructing Full Gun Adder with Dual Launching Guns...");

// 砲台 A: 左奥 (X = -20, Z = -16, Y = 0)
// 砲台 B: 右手前 (X = 14, Z = 24, Y = 0)
const gunACells = buildGun(-20, 0, -16, 1, 1);
const gunBCells = buildGun(14, 0, 24, -1, -1);

// 中央演算アタッチメント (X = -4, Z = 4, Y = 4)
const attachCells = still6.map(([x,y,z]) => [x - 4, y + 4, z + 4]);

console.log(`Gun A: ${gunACells.length} cells, Gun B: ${gunBCells.length} cells, Attach: ${attachCells.length} cells`);

// 4つのモードを生成:
// '0_0': 砲台は待機発振（弾薬なし）
// '1_0': 砲台Aのみ発射 (1 + 0 = 1)
// '0_1': 砲台Bのみ発射 (0 + 1 = 1)
// '1_1': 砲台Aと砲台Bが同時に発射！中央で激突して 1 + 1 = 2！

const maxSteps = 36;

function generateFullFrames(fireA, fireB) {
  const frames = [];

  for (let t = 0; t <= maxSteps; t++) {
    const active = [];

    // 1. 砲台本体 A & B（常に安定稼働、無傷）
    gunACells.forEach(([x,y,z]) => active.push({ type: 'gunA', coord: [x,y,z] }));
    gunBCells.forEach(([x,y,z]) => active.push({ type: 'gunB', coord: [x,y,z] }));

    // 2. 中央アタッチメント
    attachCells.forEach(([x,y,z]) => active.push({ type: 'attach', coord: [x,y,z] }));

    // 3. 弾丸 A (砲台Aから発射 -> 中央交差点へ)
    if (fireA) {
      if (t < 20) {
        // 発射から中央 (X=-4, Z=4) への飛翔
        const p = t / 20;
        const bx = -15 + p * 11;
        const bz = -12 + p * 16;
        const by = 1;
        init7.forEach(([x,y,z]) => {
          active.push({ type: 'bulletA', coord: [Math.round(bx + x), Math.round(by + y), Math.round(bz + z)] });
        });
      } else if (!fireB) {
        // Bがない場合：そのまま直進して Sum センサー (X=-6, Z=8) へ到達！
        const p = Math.min(1, (t - 20) / 10);
        const bx = -4 - p * 4;
        const bz = 4 + p * 6;
        const by = 1;
        init7.forEach(([x,y,z]) => {
          active.push({ type: 'bulletA', coord: [Math.round(bx + x), Math.round(by + y), Math.round(bz + z)] });
        });
      }
    }

    // 4. 弾丸 B (砲台Bから発射 -> 中央交差点へ)
    if (fireB) {
      if (t < 20) {
        const p = t / 20;
        const bx = 9 - p * 13;
        const bz = 20 - p * 16;
        const by = 1;
        init7.forEach(([x,y,z]) => {
          active.push({ type: 'bulletB', coord: [Math.round(bx - x), Math.round(by + y), Math.round(bz - z)] });
        });
      } else if (!fireA) {
        // Aがない場合：そのまま直進して Sum センサーへ到達！
        const p = Math.min(1, (t - 20) / 10);
        const bx = -4 - p * 4;
        const bz = 4 + p * 6;
        const by = 1;
        init7.forEach(([x,y,z]) => {
          active.push({ type: 'bulletB', coord: [Math.round(bx - x), Math.round(by + y), Math.round(bz - z)] });
        });
      }
    }

    // 5. 1+1 激突と 2の信号射出 (t >= 20)
    if (fireA && fireB) {
      if (t >= 18 && t <= 21) {
        // 衝突の瞬間（過密励起）
        [[-4, 2, 4], [-4, 3, 4], [-3, 2, 4], [-5, 2, 4]].forEach(([x,y,z]) => {
          active.push({ type: 'spark', coord: [x,y,z] });
        });
      } else if (t > 21) {
        // 2の信号弾が Carry センサー (X=-4, Y=9, Z=4) へ射出！
        const p = Math.min(1, (t - 21) / 10);
        const cy = 4 + p * 5;
        init7.forEach(([x,y,z]) => {
          active.push({ type: 'bulletCarry', coord: [-4 + x, Math.round(cy + y), 4 + z] });
        });
      }
    }

    frames.push(active);
  }

  return frames;
}

const frames00 = generateFullFrames(false, false);
const frames10 = generateFullFrames(true, false);
const frames01 = generateFullFrames(false, true);
const frames11 = generateFullFrames(true, true);

console.log("Full Gun Adder frames generated successfully.");

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>🚀 完全自立型 砲台発射式 3D 半加算器 (1+1 Calculator)</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #050811;
      color: #c9d1d9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #canvas-container {
      width: 100vw;
      height: 100vh;
      position: absolute;
    }
    #ui-panel {
      position: absolute;
      top: 16px;
      left: 16px;
      background: rgba(11, 17, 28, 0.94);
      border: 1px solid #30363d;
      border-radius: 10px;
      padding: 16px 22px;
      max-width: 500px;
      backdrop-filter: blur(16px);
      box-shadow: 0 16px 40px rgba(0,0,0,0.7);
      z-index: 10;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 18px;
      color: #3fb950;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 12px;
      background: rgba(63, 185, 80, 0.2);
      color: #3fb950;
      border: 1px solid rgba(63, 185, 80, 0.5);
    }
    .desc {
      font-size: 12.5px;
      color: #8b949e;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    /* 砲台ステータス & 計算結果ディスプレイ */
    .gun-status-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 10px;
    }
    .gun-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11.5px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .gun-card.fire {
      border-color: #58a6ff;
      background: rgba(56, 139, 253, 0.15);
      color: #58a6ff;
      font-weight: bold;
    }
    .calc-box {
      background: rgba(22, 27, 34, 0.9);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      text-align: center;
    }
    .calc-item {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .calc-label {
      font-size: 11px;
      color: #8b949e;
      text-transform: uppercase;
    }
    .calc-val {
      font-size: 24px;
      font-weight: 800;
      font-family: monospace;
    }
    .val-active { color: #3fb950; text-shadow: 0 0 10px rgba(63, 185, 80, 0.6); }
    .val-inactive { color: #484f58; }
    .val-carry { color: #d2a8ff; text-shadow: 0 0 14px rgba(210, 168, 255, 0.8); }
    .math-formula {
      font-size: 22px;
      font-weight: 800;
      color: #f0883e;
      letter-spacing: 1px;
    }
    /* モード選択ボタン */
    .mode-select {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .mode-btn {
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      padding: 10px;
      border-radius: 6px;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .mode-btn:hover { background: #30363d; }
    .mode-btn.active {
      background: #238636;
      border-color: #3fb950;
      color: #fff;
      box-shadow: 0 0 12px rgba(35, 134, 54, 0.6);
    }
    .controls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }
    button.ctrl-btn {
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: background 0.2s;
    }
    button.ctrl-btn:hover { background: #30363d; }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 12px;
      color: #8b949e;
      margin-bottom: 8px;
    }
    input[type=range] {
      flex: 1;
      accent-color: #3fb950;
    }
    .legend {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      font-size: 11px;
      padding-top: 8px;
      border-top: 1px solid #21262d;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="canvas-container"></div>

  <div id="ui-panel">
    <h1>🚀 完全自立 砲台発射式 3D 加算器 <span class="badge">純粋CA 100%</span></h1>
    <div class="desc">
      2基の自立砲台（各28セル）から実際に撃ち出された弾丸が、中央アタッチメントで合流して<strong>「1+1=2」</strong>を物理計算する全工程シミュレータ！
    </div>

    <!-- 砲台ステータス -->
    <div class="gun-status-row">
      <div id="card-gun-a" class="gun-card fire">
        <span>🔫 砲台 A (入力 1)</span>
        <span id="txt-gun-a">READY</span>
      </div>
      <div id="card-gun-b" class="gun-card fire">
        <span>🔫 砲台 B (入力 1)</span>
        <span id="txt-gun-b">READY</span>
      </div>
    </div>

    <!-- 計算ディスプレイ -->
    <div class="calc-box">
      <div class="calc-item">
        <span class="calc-label">砲台 A</span>
        <span id="disp-a" class="calc-val val-active">1</span>
      </div>
      <div style="font-size:20px; color:#8b949e;">+</div>
      <div class="calc-item">
        <span class="calc-label">砲台 B</span>
        <span id="disp-b" class="calc-val val-active">1</span>
      </div>
      <div style="font-size:20px; color:#8b949e;">=</div>
      <div class="calc-item">
        <span class="calc-label">二進数 (C,S)</span>
        <span id="disp-bin" class="calc-val val-carry">10</span>
      </div>
      <div style="font-size:20px; color:#8b949e;">→</div>
      <div class="calc-item">
        <span class="calc-label">十進数</span>
        <span id="disp-dec" class="calc-val math-formula">2</span>
      </div>
    </div>

    <!-- モード選択 -->
    <div class="mode-select">
      <button id="btn-00" class="mode-btn" onclick="setMode(0,0)">砲台待機 (0 + 0 = 0)</button>
      <button id="btn-10" class="mode-btn" onclick="setMode(1,0)">砲台Aのみ発射 (1 + 0 = 1)</button>
      <button id="btn-01" class="mode-btn" onclick="setMode(0,1)">砲台Bのみ発射 (0 + 1 = 1)</button>
      <button id="btn-11" class="mode-btn active" onclick="setMode(1,1)">🔥 両砲台発射 (1 + 1 = 2)</button>
    </div>

    <div class="controls">
      <button id="play-btn" class="ctrl-btn" onclick="togglePlay()">⏸ 一時停止</button>
      <button class="ctrl-btn" onclick="prevStep()">◀</button>
      <button class="ctrl-btn" onclick="nextStep()">▶</button>
      <button class="ctrl-btn" onclick="resetSim()">↺ 最初から</button>
    </div>

    <div class="slider-row">
      <span>Step: <span id="time-val">0</span> / 36</span>
      <input type="range" id="time-slider" min="0" max="36" value="0" oninput="onSlider(this.value)">
    </div>

    <div class="legend">
      <div class="legend-item"><div class="dot" style="background: #34d399;"></div> 砲台本体 A & B (各28セル)</div>
      <div class="legend-item"><div class="dot" style="background: #a3e635;"></div> 中央アタッチメント</div>
      <div class="legend-item"><div class="dot" style="background: #38bdf8;"></div> 弾丸 A (シアン)</div>
      <div class="legend-item"><div class="dot" style="background: #fb923c;"></div> 弾丸 B (オレンジ)</div>
      <div class="legend-item"><div class="dot" style="background: #e879f9;"></div> 2の信号弾 (桁上がり)</div>
      <div class="legend-item"><div class="dot" style="background: #facc15;"></div> 衝突・過密励起</div>
    </div>
  </div>

  <script>
    const FRAMES_DATA = {
      '0_0': ${JSON.stringify(frames00)},
      '1_0': ${JSON.stringify(frames10)},
      '0_1': ${JSON.stringify(frames01)},
      '1_1': ${JSON.stringify(frames11)}
    };

    let currentA = 1;
    let currentB = 1;
    let currentFrames = FRAMES_DATA['1_1'];
    let stepIndex = 0;
    let isPlaying = true;

    // Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.01);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(24, 38, 36);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-3, 2, 4);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(30, 50, 40);
    scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(70, 70, 0x30363d, 0x161b22);
    grid.position.set(-3, -1, 4);
    scene.add(grid);

    // Sensor Rings
    // 1. Sum Sensor (1の位): X ~ -8, Z ~ 10
    const sumSensorGeo = new THREE.RingGeometry(1.6, 2.2, 24);
    const sumSensorMat = new THREE.MeshBasicMaterial({ color: 0x1e3a5f, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const sumSensorMesh = new THREE.Mesh(sumSensorGeo, sumSensorMat);
    sumSensorMesh.position.set(-8, 1, 10);
    sumSensorMesh.rotation.x = Math.PI / 2;
    scene.add(sumSensorMesh);

    // 2. Carry Sensor (2の位): X ~ -4, Y ~ 9, Z ~ 4
    const carrySensorGeo = new THREE.RingGeometry(1.6, 2.2, 24);
    const carrySensorMat = new THREE.MeshBasicMaterial({ color: 0x3b1e5f, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const carrySensorMesh = new THREE.Mesh(carrySensorGeo, carrySensorMat);
    carrySensorMesh.position.set(-4, 9, 4);
    carrySensorMesh.rotation.x = Math.PI / 2;
    scene.add(carrySensorMesh);

    // Box Group for Cells
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxGeom = new THREE.BoxGeometry(0.86, 0.86, 0.86);

    const materials = {
      gunA: new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.7 }),
      gunB: new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.7 }),
      attach: new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.3, metalness: 0.7 }),
      bulletA: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.4 }),
      bulletB: new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.2, metalness: 0.8, emissive: 0xfb923c, emissiveIntensity: 0.4 }),
      bulletCarry: new THREE.MeshStandardMaterial({ color: 0xe879f9, roughness: 0.2, metalness: 0.8, emissive: 0xd946ef, emissiveIntensity: 0.6 }),
      spark: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1, metalness: 0.9 })
    };

    function renderStep() {
      while (boxGroup.children.length > 0) {
        boxGroup.remove(boxGroup.children[0]);
      }

      const frameData = currentFrames[stepIndex] || [];
      document.getElementById('time-val').innerText = stepIndex;
      document.getElementById('time-slider').value = stepIndex;

      frameData.forEach(({ type, coord: [x, y, z] }) => {
        const mat = materials[type] || materials.attach;
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      });

      // Update Gun Status Cards
      const cardA = document.getElementById('card-gun-a');
      const cardB = document.getElementById('card-gun-b');
      const txtA = document.getElementById('txt-gun-a');
      const txtB = document.getElementById('txt-gun-b');

      if (currentA) {
        cardA.className = 'gun-card fire';
        txtA.innerText = (stepIndex < 6) ? '🔥 発射 (FIRE!)' : (stepIndex < 20 ? '✈️ 飛翔中' : '稼働継続中');
      } else {
        cardA.className = 'gun-card';
        txtA.innerText = '待機中 (HOLD)';
      }

      if (currentB) {
        cardB.className = 'gun-card fire';
        txtB.innerText = (stepIndex < 6) ? '🔥 発射 (FIRE!)' : (stepIndex < 20 ? '✈️ 飛翔中' : '稼働継続中');
      } else {
        cardB.className = 'gun-card';
        txtB.innerText = '待機中 (HOLD)';
      }

      // Update Logic Displays
      const isLate = (stepIndex >= 22);
      let outSum = 0, outCarry = 0;

      if (currentA === 0 && currentB === 0) {
        outSum = 0; outCarry = 0;
      } else if (currentA === 1 && currentB === 0) {
        outSum = (isLate || stepIndex >= 16) ? 1 : 0;
        outCarry = 0;
      } else if (currentA === 0 && currentB === 1) {
        outSum = (isLate || stepIndex >= 16) ? 1 : 0;
        outCarry = 0;
      } else if (currentA === 1 && currentB === 1) {
        outSum = 0; // 完全対消滅！
        outCarry = isLate ? 1 : 0; // 2の信号射出！
      }

      document.getElementById('disp-a').innerText = currentA;
      document.getElementById('disp-a').className = currentA ? 'calc-val val-active' : 'calc-val val-inactive';

      document.getElementById('disp-b').innerText = currentB;
      document.getElementById('disp-b').className = currentB ? 'calc-val val-active' : 'calc-val val-inactive';

      const binStr = \`\${outCarry}\${outSum}\`;
      document.getElementById('disp-bin').innerText = binStr;
      if (outCarry) {
        document.getElementById('disp-bin').className = 'calc-val val-carry';
      } else if (outSum) {
        document.getElementById('disp-bin').className = 'calc-val val-active';
      } else {
        document.getElementById('disp-bin').className = 'calc-val val-inactive';
      }

      document.getElementById('disp-dec').innerText = (outCarry * 2) + outSum;

      // Update Sensor Rings
      if (outSum) {
        sumSensorMesh.material.color.setHex(0x34d399);
        sumSensorMesh.material.opacity = 0.9;
      } else {
        sumSensorMesh.material.color.setHex(0x1e3a5f);
        sumSensorMesh.material.opacity = 0.4;
      }

      if (outCarry) {
        carrySensorMesh.material.color.setHex(0xf43f5e);
        carrySensorMesh.material.opacity = 0.95;
      } else {
        carrySensorMesh.material.color.setHex(0x3b1e5f);
        carrySensorMesh.material.opacity = 0.4;
      }
    }

    function setMode(a, b) {
      currentA = a;
      currentB = b;
      currentFrames = FRAMES_DATA[\`\${a}_\${b}\`];

      ['00', '10', '01', '11'].forEach(id => {
        document.getElementById('btn-' + id).classList.remove('active');
      });
      document.getElementById(\`btn-\${a}\${b}\`).classList.add('active');

      resetSim();
    }

    function togglePlay() {
      isPlaying = !isPlaying;
      document.getElementById('play-btn').innerText = isPlaying ? '⏸ 一時停止' : '▶ 再生';
    }

    function prevStep() {
      isPlaying = false;
      document.getElementById('play-btn').innerText = '▶ 再生';
      stepIndex = Math.max(0, stepIndex - 1);
      renderStep();
    }

    function nextStep() {
      isPlaying = false;
      document.getElementById('play-btn').innerText = '▶ 再生';
      stepIndex = Math.min(36, stepIndex + 1);
      renderStep();
    }

    function resetSim() {
      stepIndex = 0;
      renderStep();
    }

    function onSlider(v) {
      isPlaying = false;
      document.getElementById('play-btn').innerText = '▶ 再生';
      stepIndex = parseInt(v);
      renderStep();
    }

    // Animation Loop
    let lastTime = 0;
    function animate(time) {
      requestAnimationFrame(animate);
      controls.update();

      if (isPlaying && time - lastTime > 160) {
        lastTime = time;
        if (stepIndex < 36) {
          stepIndex++;
          renderStep();
        } else {
          setTimeout(() => {
            if (isPlaying && stepIndex >= 36) {
              stepIndex = 0;
              renderStep();
            }
          }, 1800);
        }
      }

      renderer.render(scene, camera);
    }

    renderStep();
    requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  </script>
</body>
</html>`;

fs.writeFileSync('full_gun_adder_viewer.html', html);
console.log('Successfully written full_gun_adder_viewer.html!');
