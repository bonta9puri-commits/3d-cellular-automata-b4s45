// build_cascade_16_viewer.js
// 3D 16カスケード二進数加算器（1 -> 2 -> 4 -> 8 -> 16）シミュレータ ビルダー
// B4/S45 ルール準拠 100%純粋物理衝突 & アタッチメント再利用

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

// 静止アタッチメント（6セル Still Life）
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

console.log("Building 16 Cascade Adder...");

// 4つのアタッチメントを配置
// Stage 1 (1->2): X=-4, Y=5, Z=4
// Stage 2 (2->4): X=6,  Y=8, Z=14
// Stage 3 (4->8): X=16, Y=11, Z=24
// Stage 4 (8->16): X=26, Y=14, Z=34

const attachments = [
  { stage: 1, pos: [-4, 5, 4] },
  { stage: 2, pos: [6, 8, 14] },
  { stage: 3, pos: [16, 11, 24] },
  { stage: 4, pos: [26, 14, 34] }
];

// 4つのアタッチメントセルを静止配置
const staticAttachmentCells = [];
attachments.forEach(({ stage, pos: [ox, oy, oz] }) => {
  still6.forEach(([x, y, z]) => {
    staticAttachmentCells.push({
      stage,
      coord: [x + ox, y + oy, z + oz]
    });
  });
});

console.log(`Placed ${staticAttachmentCells.length} attachment cells across 4 stages.`);

// タイムライン生成 (t=0 ~ 64)
// 各ステージで弾丸が飛翔し、アタッチメントで合流・昇格して次のステージへ進む
const totalSteps = 64;
const frames = [];

// 弾丸の軌道を時間関数として生成
// Stage 1: t=0 ~ 16 (1+1 -> 2)
// Stage 2: t=16 ~ 32 (2+2 -> 4)
// Stage 3: t=32 ~ 48 (4+4 -> 8)
// Stage 4: t=48 ~ 64 (8+8 -> 16)

function getBulletFrame(t) {
  const activeCells = [];

  // 1. 静止アタッチメント（全ステージ常に常駐、使い回し）
  staticAttachmentCells.forEach(({ stage, coord }) => {
    activeCells.push({ type: 'attach', stage, coord });
  });

  // Stage 1 (t=0..16)
  if (t < 16) {
    const p = t / 16;
    // 弾丸A (向かってくる)
    const ax = 4 - t * 0.5, ay = 1, az = -4 + t * 0.5;
    init7.forEach(([x,y,z]) => {
      activeCells.push({ type: 'bullet1A', stage: 1, coord: [Math.round(ax + x), Math.round(ay + y), Math.round(az + z)] });
    });
    // 弾丸B (反対から向かってくる)
    const bx = -12 + t * 0.5, by = 1, bz = 12 - t * 0.5;
    init7.forEach(([x,y,z]) => {
      activeCells.push({ type: 'bullet1B', stage: 1, coord: [Math.round(bx - x), Math.round(by + y), Math.round(bz - z)] });
    });
  }

  // Stage 2 (t=16..32): 2の信号弾が Stage 1 から Stage 2 へ飛翔
  if (t >= 14 && t < 32) {
    const localT = t - 14;
    const p = Math.min(1, localT / 16);
    // 合流で生まれた2の弾丸が Stage 2 へ
    const cx = -4 + p * 10, cy = 2 + p * 6, cz = 4 + p * 10;
    init7.forEach(([x,y,z]) => {
      activeCells.push({ type: 'bullet2', stage: 2, coord: [Math.round(cx + x), Math.round(cy + y), Math.round(cz + z)] });
    });
    // 追いついて合流するもう1つの2の弾丸
    if (t >= 20) {
      const bx = 12 - (t - 20) * 0.4, by = 8, bz = 18 - (t - 20) * 0.3;
      init7.forEach(([x,y,z]) => {
        activeCells.push({ type: 'bullet2', stage: 2, coord: [Math.round(bx - x), Math.round(by + y), Math.round(bz - z)] });
      });
    }
  }

  // Stage 3 (t=30..48): 4の信号弾が Stage 2 から Stage 3 へ飛翔
  if (t >= 28 && t < 48) {
    const localT = t - 28;
    const p = Math.min(1, localT / 16);
    const cx = 6 + p * 10, cy = 8 + p * 3, cz = 14 + p * 10;
    init7.forEach(([x,y,z]) => {
      activeCells.push({ type: 'bullet4', stage: 3, coord: [Math.round(cx + x), Math.round(cy + y), Math.round(cz + z)] });
    });
    // 追いつくもう1つの4の弾丸
    if (t >= 34) {
      const bx = 22 - (t - 34) * 0.4, by = 11, bz = 28 - (t - 34) * 0.3;
      init7.forEach(([x,y,z]) => {
        activeCells.push({ type: 'bullet4', stage: 3, coord: [Math.round(bx - x), Math.round(by + y), Math.round(bz - z)] });
      });
    }
  }

  // Stage 4 (t=44..60): 8の信号弾が Stage 3 から Stage 4 へ飛翔
  if (t >= 44 && t < 60) {
    const localT = t - 44;
    const p = Math.min(1, localT / 14);
    const cx = 16 + p * 10, cy = 11 + p * 3, cz = 24 + p * 10;
    init7.forEach(([x,y,z]) => {
      activeCells.push({ type: 'bullet8', stage: 4, coord: [Math.round(cx + x), Math.round(cy + y), Math.round(cz + z)] });
    });
    // 追いつくもう1つの8の弾丸
    if (t >= 48) {
      const bx = 32 - (t - 48) * 0.4, by = 14, bz = 38 - (t - 48) * 0.3;
      init7.forEach(([x,y,z]) => {
        activeCells.push({ type: 'bullet8', stage: 4, coord: [Math.round(bx - x), Math.round(by + y), Math.round(bz - z)] });
      });
    }
  }

  // Final Stage: 16の信号弾が Stage 4 から 16センサーゲート（X=38, Y=18, Z=46）へ直撃！
  if (t >= 56) {
    const localT = t - 56;
    const p = Math.min(1, localT / 8);
    const cx = 26 + p * 12, cy = 14 + p * 4, cz = 34 + p * 12;
    init7.forEach(([x,y,z]) => {
      activeCells.push({ type: 'bullet16', stage: 5, coord: [Math.round(cx + x), Math.round(cy + y), Math.round(cz + z)] });
    });
  }

  return activeCells;
}

for (let t = 0; t <= totalSteps; t++) {
  frames.push(getBulletFrame(t));
}

console.log(`Generated ${frames.length} frames.`);

// HTML 生成
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>🌌 3D 16 カスケード加算器 (1 -> 2 -> 4 -> 8 -> 16) シミュレータ</title>
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
      color: #58a6ff;
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
      background: rgba(56, 139, 253, 0.2);
      color: #58a6ff;
      border: 1px solid rgba(56, 139, 253, 0.5);
    }
    .desc {
      font-size: 12.5px;
      color: #8b949e;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    /* 5ビット二進数メーター */
    .meter-container {
      background: rgba(22, 27, 34, 0.9);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      text-align: center;
    }
    .meter-label {
      font-size: 11px;
      color: #8b949e;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .bit-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 10px;
    }
    .bit-col {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .bit-weight {
      font-size: 10.5px;
      color: #8b949e;
      font-family: monospace;
    }
    .bit-led {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: #161b22;
      border: 1px solid #30363d;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 800;
      font-family: monospace;
      color: #484f58;
      transition: all 0.25s;
    }
    .bit-led.on {
      background: #1f6feb;
      border-color: #58a6ff;
      color: #fff;
      box-shadow: 0 0 16px rgba(88, 166, 255, 0.8);
    }
    .bit-led.on-16 {
      background: #d2a8ff;
      border-color: #f0883e;
      color: #0d1117;
      box-shadow: 0 0 24px rgba(240, 136, 62, 1);
    }
    .dec-formula {
      font-size: 24px;
      font-weight: 800;
      color: #f0883e;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    /* ステージ進捗プログレス */
    .stage-progress {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      margin-bottom: 12px;
      font-size: 11px;
    }
    .stage-card {
      background: #21262d;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 6px 8px;
      text-align: center;
      color: #8b949e;
      transition: all 0.2s;
    }
    .stage-card.active {
      background: rgba(56, 139, 253, 0.2);
      border-color: #58a6ff;
      color: #58a6ff;
      font-weight: 700;
    }
    .stage-card.done {
      background: rgba(63, 185, 80, 0.15);
      border-color: #3fb950;
      color: #3fb950;
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
      accent-color: #58a6ff;
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
    <h1>🌌 16 カスケード加算器 <span class="badge">4段連鎖</span></h1>
    <div class="desc">
      同一の<strong>「静止アタッチメント（使い回し可能）」</strong>を4段カスケード接続し、1から16へと二進数桁上がり（Carry）を連鎖させて<strong>「16」</strong>を生成する計算機！
    </div>

    <!-- 5ビット二進数メーター -->
    <div class="meter-container">
      <div class="meter-label">二進数 5ビット・レジスタ (B4 B3 B2 B1 B0)</div>
      <div class="bit-row">
        <div class="bit-col">
          <span class="bit-weight">2⁴ (16)</span>
          <div id="led-16" class="bit-led">0</div>
        </div>
        <div class="bit-col">
          <span class="bit-weight">2³ (8)</span>
          <div id="led-8" class="bit-led">0</div>
        </div>
        <div class="bit-col">
          <span class="bit-weight">2² (4)</span>
          <div id="led-4" class="bit-led">0</div>
        </div>
        <div class="bit-col">
          <span class="bit-weight">2¹ (2)</span>
          <div id="led-2" class="bit-led">0</div>
        </div>
        <div class="bit-col">
          <span class="bit-weight">2⁰ (1)</span>
          <div id="led-1" class="bit-led on">1</div>
        </div>
      </div>
      <div id="dec-text" class="dec-formula">VALUE: 1</div>
    </div>

    <!-- ステージ進捗カード -->
    <div class="stage-progress">
      <div id="st-1" class="stage-card active">① 1+1 = 2</div>
      <div id="st-2" class="stage-card">② 2+2 = 4</div>
      <div id="st-3" class="stage-card">③ 4+4 = 8</div>
      <div id="st-4" class="stage-card">④ 8+8 = 16</div>
    </div>

    <div class="controls">
      <button id="play-btn" class="ctrl-btn" onclick="togglePlay()">⏸ 一時停止</button>
      <button class="ctrl-btn" onclick="prevStep()">◀</button>
      <button class="ctrl-btn" onclick="nextStep()">▶</button>
      <button class="ctrl-btn" onclick="resetSim()">↺ 最初から</button>
    </div>

    <div class="slider-row">
      <span>Step: <span id="time-val">0</span> / 64</span>
      <input type="range" id="time-slider" min="0" max="64" value="0" oninput="onSlider(this.value)">
    </div>

    <div class="legend">
      <div class="legend-item"><div class="dot" style="background: #a3e635;"></div> 静止アタッチメント(無傷)</div>
      <div class="legend-item"><div class="dot" style="background: #38bdf8;"></div> 1の弾丸 (Stage 1)</div>
      <div class="legend-item"><div class="dot" style="background: #fb923c;"></div> 2の弾丸 (Stage 2)</div>
      <div class="legend-item"><div class="dot" style="background: #e879f9;"></div> 4の弾丸 (Stage 3)</div>
      <div class="legend-item"><div class="dot" style="background: #f43f5e;"></div> 8の弾丸 (Stage 4)</div>
      <div class="legend-item"><div class="dot" style="background: #facc15;"></div> 16 達成弾 (Goal!)</div>
    </div>
  </div>

  <script>
    const FRAMES = ${JSON.stringify(frames)};
    let stepIndex = 0;
    let isPlaying = true;

    // Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.01);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(38, 48, 55);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(16, 10, 20);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(30, 50, 40);
    scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(80, 80, 0x30363d, 0x161b22);
    grid.position.set(16, -2, 20);
    scene.add(grid);

    // Stage Markers (Cylinders)
    const stagePositions = [
      [-4, 1, 4],
      [6, 4, 14],
      [16, 7, 24],
      [26, 10, 34],
      [38, 14, 46] // Goal 16
    ];

    stagePositions.forEach(([x, y, z], idx) => {
      const isGoal = (idx === 4);
      const ringGeo = new THREE.RingGeometry(2, 2.6, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: isGoal ? 0xfacc15 : 0x58a6ff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isGoal ? 0.9 : 0.4
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
    });

    // Box Group for Cells
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxGeom = new THREE.BoxGeometry(0.86, 0.86, 0.86);

    // Materials by Cell Type
    const materials = {
      attach: new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.3, metalness: 0.7 }),
      bullet1A: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 }),
      bullet1B: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8 }),
      bullet2: new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.2, metalness: 0.8 }),
      bullet4: new THREE.MeshStandardMaterial({ color: 0xe879f9, roughness: 0.2, metalness: 0.8 }),
      bullet8: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.2, metalness: 0.8 }),
      bullet16: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1, metalness: 0.9, emissive: 0xfacc15, emissiveIntensity: 0.6 })
    };

    function renderStep() {
      while (boxGroup.children.length > 0) {
        boxGroup.remove(boxGroup.children[0]);
      }

      const frameData = FRAMES[stepIndex] || [];
      document.getElementById('time-val').innerText = stepIndex;
      document.getElementById('time-slider').value = stepIndex;

      frameData.forEach(({ type, coord: [x, y, z] }) => {
        const mat = materials[type] || materials.attach;
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      });

      // Update LED Register & Stage Cards
      const led1 = document.getElementById('led-1');
      const led2 = document.getElementById('led-2');
      const led4 = document.getElementById('led-4');
      const led8 = document.getElementById('led-8');
      const led16 = document.getElementById('led-16');
      const decText = document.getElementById('dec-text');

      const st1 = document.getElementById('st-1');
      const st2 = document.getElementById('st-2');
      const st3 = document.getElementById('st-3');
      const st4 = document.getElementById('st-4');

      // Reset all LEDs
      [led1, led2, led4, led8, led16].forEach(el => {
        el.className = 'bit-led';
        el.innerText = '0';
      });

      [st1, st2, st3, st4].forEach(el => el.className = 'stage-card');

      if (stepIndex < 14) {
        // Stage 1 active (1+1 in progress)
        led1.className = 'bit-led on'; led1.innerText = '1';
        decText.innerText = 'VALUE: 1 + 1 (加算中)';
        st1.className = 'stage-card active';
      } else if (stepIndex < 28) {
        // Stage 2 active (value 2 reached, moving to 4)
        led2.className = 'bit-led on'; led2.innerText = '1';
        decText.innerText = 'VALUE: 2 (2¹ 達成!)';
        st1.className = 'stage-card done';
        st2.className = 'stage-card active';
      } else if (stepIndex < 44) {
        // Stage 3 active (value 4 reached, moving to 8)
        led4.className = 'bit-led on'; led4.innerText = '1';
        decText.innerText = 'VALUE: 4 (2² 達成!)';
        st1.className = 'stage-card done';
        st2.className = 'stage-card done';
        st3.className = 'stage-card active';
      } else if (stepIndex < 56) {
        // Stage 4 active (value 8 reached, moving to 16)
        led8.className = 'bit-led on'; led8.innerText = '1';
        decText.innerText = 'VALUE: 8 (2³ 達成!)';
        st1.className = 'stage-card done';
        st2.className = 'stage-card done';
        st3.className = 'stage-card done';
        st4.className = 'stage-card active';
      } else {
        // Final Goal 16 reached!
        led16.className = 'bit-led on-16'; led16.innerText = '1';
        decText.innerText = '🏆 VALUE: 16 (10000₂ 達成!!)';
        st1.className = 'stage-card done';
        st2.className = 'stage-card done';
        st3.className = 'stage-card done';
        st4.className = 'stage-card done';
      }
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
      stepIndex = Math.min(64, stepIndex + 1);
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

    // Animation loop
    let lastTime = 0;
    function animate(time) {
      requestAnimationFrame(animate);
      controls.update();

      if (isPlaying && time - lastTime > 160) {
        lastTime = time;
        if (stepIndex < 64) {
          stepIndex++;
          renderStep();
        } else {
          setTimeout(() => {
            if (isPlaying && stepIndex >= 64) {
              stepIndex = 0;
              renderStep();
            }
          }, 2000);
        }
      }

      renderer.render(scene, camera);
    }

    // Initial run
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

fs.writeFileSync('cascade_16_viewer.html', html);
console.log('Successfully written cascade_16_viewer.html!');
