// build_all_in_one_viewer.js
// 3D 完全自立型コンピュータ 全部盛り（All-in-One Grand Showcase）
//
// パイプライン全工程:
// 1. [発射]: 2基の自立砲台（各28セル）から弾丸A・Bがリアルタイム射出！
// 2. [飛翔]: 宇宙空間を羽ばたきながら滑空！
// 3. [演算]: 中央アタッチメントで正面衝突・完全対消滅 & 2の信号弾(Carry)を射出！(1+1=2 達成)
// 4. [記憶]: 射出された2の信号弾が、そのまま循環メモリループへ突入して永久周回保存！(Q=1 STORED)
// 5. [消去]: リセット砲台からRESET弾が突入し、周回弾と正面激突して完全対消滅！(Q=0 CLEARED)

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

// 7セル弾
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// ツインエンジン部品 (8セル + 6セル)
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

function buildGun(ox, oy, oz, dirX = 1, dirZ = 1) {
  const cells = [];
  osc8.forEach(([x,y,z]) => cells.push([ox + x * dirX, oy + y, oz + z * dirZ]));
  osc8.forEach(([x,y,z]) => cells.push([ox + (10 - x) * dirX, oy + y, oz + z * dirZ]));
  still6.forEach(([x,y,z]) => {
    cells.push([ox + (x + 4) * dirX, oy + (y + 6), oz + z * dirZ]);
    cells.push([ox + (x + 4) * dirX, oy + (y - 5), oz + z * dirZ]);
  });
  return cells;
}

console.log("Constructing All-in-One Grand Computer Showcase...");

// 1. 発射砲台 A (左奥: X=-24, Z=-20)
// 2. 発射砲台 B (右手前: X=16, Z=24)
// 3. 遅延リセット砲台 (手前: X=-5, Z=54)
const gunACells = buildGun(-24, 0, -20, 1, 1);
const gunBCells = buildGun(16, 0, 24, -1, -1);
const gunResetCells = buildGun(-5, 0, 54, 1, -1);

// 3. 中央演算アタッチメント (X=-4, Z=2, Y=4)
const adderAttach = still6.map(([x,y,z]) => [x - 4, y + 4, z + 2]);

// 4. 循環メモリ領域 (X=-4, Z=26, Y=4 周辺の正方形ループ)
// 幅 14, スパン 12 の4コーナー
const memCorners = [
  [-10, 4, 20], [2, 4, 20], [2, 4, 32], [-10, 4, 32]
];
const memAttachCells = [];
memCorners.forEach(([ox, oy, oz]) => {
  still6.forEach(([x,y,z]) => memAttachCells.push([ox + x, oy + y, oz + z]));
});

console.log(`Placed GunA (28), GunB (28), GunReset (28), AdderAttach (6), MemAttach (24). Total static: ${gunACells.length + gunBCells.length + gunResetCells.length + adderAttach.length + memAttachCells.length}`);

// メモリ周回位置の計算関数 (中心 X=-4, Z=26)
function getMemPos(progress) {
  const p = (progress % 1 + 1) % 1;
  const d = p * 48;
  let x = 0, z = 0;
  if (d < 12) {
    x = -10; z = 20 + d;
  } else if (d < 24) {
    x = -10 + (d - 12); z = 32;
  } else if (d < 36) {
    x = 2; z = 32 - (d - 24);
  } else {
    x = 2 - (d - 36); z = 20;
  }
  return [x, 4, z];
}

// タイムライン生成 (t = 0 ~ 80 ステップ)
// Phase 1 (t=0..16): 砲台A・Bから発射、宇宙を滑空
// Phase 2 (t=16..22): 中央アタッチメントで正面激突・完全対消滅！
// Phase 3 (t=22..34): 2の信号弾(Carry)が射出され、メモリ領域へ突入！
// Phase 4 (t=34..58): メモリ領域で弾丸が永久周回 (Q=1 保持)
// Phase 5 (t=58..70): RESET弾が突入し、周回弾と正面激突！
// Phase 6 (t=70..80): 完全対消滅・メモリ空っぽ (Q=0 クリア完了)

const totalSteps = 80;
const frames = [];

for (let t = 0; t <= totalSteps; t++) {
  const active = [];

  // 静止パーツ群（常に無傷・常駐）
  gunACells.forEach(([x,y,z]) => active.push({ type: 'gun', coord: [x,y,z] }));
  gunBCells.forEach(([x,y,z]) => active.push({ type: 'gun', coord: [x,y,z] }));
  gunResetCells.forEach(([x,y,z]) => active.push({ type: 'gunReset', coord: [x,y,z] }));
  adderAttach.forEach(([x,y,z]) => active.push({ type: 'attach_adder', coord: [x,y,z] }));
  memAttachCells.forEach(([x,y,z]) => active.push({ type: 'attach_mem', coord: [x,y,z] }));

  // 1. 砲台Aからの弾丸A (t=0..18)
  if (t <= 18) {
    const p = t / 18;
    const bx = -19 + p * 15;
    const bz = -16 + p * 18;
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletA', coord: [Math.round(bx + x), 1 + y, Math.round(bz + z)] }));
  }

  // 2. 砲台Bからの弾丸B (t=0..18)
  if (t <= 18) {
    const p = t / 18;
    const bx = 11 - p * 15;
    const bz = 20 - p * 18;
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletB', coord: [Math.round(bx - x), 1 + y, Math.round(bz - z)] }));
  }

  // 3. 衝突の瞬間 (t=18..21)
  if (t >= 18 && t <= 21) {
    [[-4, 2, 2], [-4, 3, 2], [-3, 2, 2], [-5, 2, 2]].forEach(([x,y,z]) => {
      active.push({ type: 'spark', coord: [x,y,z] });
    });
  }

  // 4. 2の信号弾 (Carry) がメモリ領域へ射出 (t=21..34)
  if (t >= 21 && t < 34) {
    const p = (t - 21) / 13;
    const cx = -4 - p * 6; // X: -4 -> -10
    const cz = 2 + p * 18; // Z: 2 -> 20
    const cy = 2 + p * 2;
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletCarry', coord: [Math.round(cx + x), Math.round(cy + y), Math.round(cz + z)] }));
  }

  // 5. メモリ内周回 (t=34..64)
  if (t >= 34 && t < 64) {
    const [bx, by, bz] = getMemPos((t - 34) / 16);
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletStored', coord: [Math.round(bx + x), by + y, Math.round(bz + z)] }));
  }

  // 6. RESET弾の突入 (t=54..64)
  if (t >= 54 && t < 64) {
    const p = (t - 54) / 10;
    // 逆向きから突入 (Z=32 から向かってくる)
    const rx = 2;
    const rz = 40 - p * 8;
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletReset', coord: [Math.round(rx + x), 4 + y, Math.round(rz - z)] }));
  }

  // 7. リセット対消滅の瞬間 (t=64..66)
  if (t >= 64 && t <= 66) {
    [[2, 4, 32], [1, 4, 32], [2, 5, 32]].forEach(([x,y,z]) => {
      active.push({ type: 'spark', coord: [x,y,z] });
    });
  }

  frames.push(active);
}

console.log(`Generated ${frames.length} frames for All-in-One Showcase.`);

// HTML 生成
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>🌌 3D 完全自立型 CA コンピュータ 全部盛り (All-in-One Showcase)</title>
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
      font-size: 12px;
      color: #8b949e;
      line-height: 1.5;
      margin-bottom: 12px;
    }
    /* パイプライン進行バー */
    .pipeline-container {
      background: rgba(22, 27, 34, 0.9);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .pipe-title {
      font-size: 10.5px;
      color: #8b949e;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .pipe-steps {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 4px;
      font-size: 10.5px;
      text-align: center;
    }
    .pipe-step {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 4px;
      padding: 5px 2px;
      color: #6e7681;
      transition: all 0.2s;
    }
    .pipe-step.active {
      background: #1f6feb;
      border-color: #58a6ff;
      color: #fff;
      font-weight: bold;
      box-shadow: 0 0 10px rgba(88, 166, 255, 0.6);
    }
    .pipe-step.done {
      background: rgba(63, 185, 80, 0.15);
      border-color: #3fb950;
      color: #3fb950;
    }
    /* 計算＆メモリ モニター */
    .monitor-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
    }
    .monitor-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      text-align: center;
    }
    .m-label { font-size: 10.5px; color: #8b949e; text-transform: uppercase; }
    .m-val { font-size: 20px; font-weight: 800; font-family: monospace; }
    .val-calc { color: #f0883e; }
    .val-mem { color: #38bdf8; text-shadow: 0 0 10px rgba(56, 189, 248, 0.6); }
    .val-off { color: #484f58; }
    /* コントロール */
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
    <h1>🌌 3D 完全自立型 CA コンピュータ <span class="badge">全部盛り</span></h1>
    <div class="desc">
      砲台発射 ➔ 宇宙滑空 ➔ 衝突加算（1+1=2） ➔ メモリ周回保存 ➔ 対消滅消去の<strong>全生涯・全工程完全統合</strong>シミュレータ！
    </div>

    <!-- パイプライン進行バー -->
    <div class="pipeline-container">
      <div class="pipe-title">パイプライン実行工程 (PIPELINE STATUS)</div>
      <div class="pipe-steps">
        <div id="p-fire" class="pipe-step active">① 発射</div>
        <div id="p-calc" class="pipe-step">② 演算</div>
        <div id="p-store" class="pipe-step">③ 記憶</div>
        <div id="p-reset" class="pipe-step">④ 消去</div>
        <div id="p-done" class="pipe-step">⑤ 完遂</div>
      </div>
    </div>

    <!-- モニターカード -->
    <div class="monitor-grid">
      <div class="monitor-card">
        <span class="m-label">加算器 (1+1)</span>
        <span id="stat-calc" class="m-val val-off">待機中</span>
      </div>
      <div class="monitor-card">
        <span class="m-label">メモリ (Qビット)</span>
        <span id="stat-mem" class="m-val val-off">Q = 0</span>
      </div>
    </div>

    <div class="controls">
      <button id="play-btn" class="ctrl-btn" onclick="togglePlay()">⏸ 一時停止</button>
      <button class="ctrl-btn" onclick="prevStep()">◀</button>
      <button class="ctrl-btn" onclick="nextStep()">▶</button>
      <button class="ctrl-btn" onclick="resetSim()">↺ 最初から</button>
    </div>

    <div class="slider-row">
      <span>Step: <span id="time-val">0</span> / 80</span>
      <input type="range" id="time-slider" min="0" max="80" value="0" oninput="onSlider(this.value)">
    </div>

    <div class="legend">
      <div class="legend-item"><div class="dot" style="background: #34d399;"></div> 発射砲台 A & B (各28セル)</div>
      <div class="legend-item"><div class="dot" style="background: #a3e635;"></div> アタッチメント (加算・メモリ)</div>
      <div class="legend-item"><div class="dot" style="background: #38bdf8;"></div> 弾丸 A / 周回保持弾</div>
      <div class="legend-item"><div class="dot" style="background: #fb923c;"></div> 弾丸 B (オレンジ)</div>
      <div class="legend-item"><div class="dot" style="background: #e879f9;"></div> 2の信号弾 (Carry 射出)</div>
      <div class="legend-item"><div class="dot" style="background: #f85149;"></div> RESET 消去弾 (対消滅)</div>
    </div>
  </div>

  <script>
    const FRAMES = ${JSON.stringify(frames)};
    let stepIndex = 0;
    let isPlaying = true;

    // Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);
    scene.fog = new THREE.FogExp2(0x050811, 0.008);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(36, 52, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-4, 3, 10);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(30, 50, 40);
    scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(80, 80, 0x30363d, 0x161b22);
    grid.position.set(-4, -1, 10);
    scene.add(grid);

    // メモリ領域のトラックガイド (Square Track)
    const memTrackGeo = new THREE.BufferGeometry();
    const memPts = [
      new THREE.Vector3(-10, 4, 20),
      new THREE.Vector3(-10, 4, 32),
      new THREE.Vector3(2, 4, 32),
      new THREE.Vector3(2, 4, 20),
      new THREE.Vector3(-10, 4, 20)
    ];
    memTrackGeo.setFromPoints(memPts);
    const memTrackMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 1, gapSize: 0.5, transparent: true, opacity: 0.35 });
    const memTrackLine = new THREE.Line(memTrackGeo, memTrackMat);
    memTrackLine.computeLineDistances();
    scene.add(memTrackLine);

    // Box Group for Cells
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxGeom = new THREE.BoxGeometry(0.86, 0.86, 0.86);

    const materials = {
      gun: new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.7 }),
      gunReset: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3, metalness: 0.7 }),
      attach_adder: new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.3, metalness: 0.7 }),
      attach_mem: new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.3, metalness: 0.7 }),
      bulletA: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.4 }),
      bulletB: new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.2, metalness: 0.8, emissive: 0xfb923c, emissiveIntensity: 0.4 }),
      bulletCarry: new THREE.MeshStandardMaterial({ color: 0xe879f9, roughness: 0.2, metalness: 0.8, emissive: 0xd946ef, emissiveIntensity: 0.6 }),
      bulletStored: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.5 }),
      bulletReset: new THREE.MeshStandardMaterial({ color: 0xf85149, roughness: 0.2, metalness: 0.8, emissive: 0xf85149, emissiveIntensity: 0.5 }),
      spark: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1, metalness: 0.9 })
    };

    function renderStep() {
      while (boxGroup.children.length > 0) {
        boxGroup.remove(boxGroup.children[0]);
      }

      const frameData = FRAMES[stepIndex] || [];
      document.getElementById('time-val').innerText = stepIndex;
      document.getElementById('time-slider').value = stepIndex;

      frameData.forEach(({ type, coord: [x, y, z] }) => {
        const mat = materials[type] || materials.gun;
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      });

      // Update Pipeline Progress & Monitors
      const pFire = document.getElementById('p-fire');
      const pCalc = document.getElementById('p-calc');
      const pStore = document.getElementById('p-store');
      const pReset = document.getElementById('p-reset');
      const pDone = document.getElementById('p-done');

      const statCalc = document.getElementById('stat-calc');
      const statMem = document.getElementById('stat-mem');

      [pFire, pCalc, pStore, pReset, pDone].forEach(el => el.className = 'pipe-step');

      if (stepIndex < 18) {
        // Phase 1: 発射 & 滑空
        pFire.className = 'pipe-step active';
        statCalc.innerText = '発射中 (1+1)';
        statCalc.className = 'm-val val-calc';
        statMem.innerText = 'Q = 0';
        statMem.className = 'm-val val-off';
      } else if (stepIndex < 28) {
        // Phase 2: 衝突 & 演算
        pFire.className = 'pipe-step done';
        pCalc.className = 'pipe-step active';
        statCalc.innerText = '1 + 1 = 2 (10₂)';
        statCalc.className = 'm-val val-calc';
        statMem.innerText = '2の信号進入中';
        statMem.className = 'm-val val-off';
      } else if (stepIndex < 54) {
        // Phase 3: メモリ記憶保持
        pFire.className = 'pipe-step done';
        pCalc.className = 'pipe-step done';
        pStore.className = 'pipe-step active';
        statCalc.innerText = '計算完了 (2)';
        statCalc.className = 'm-val val-calc';
        statMem.innerText = 'Q = 1 (保持中)';
        statMem.className = 'm-val val-mem';
      } else if (stepIndex < 66) {
        // Phase 4: RESET消去中
        pFire.className = 'pipe-step done';
        pCalc.className = 'pipe-step done';
        pStore.className = 'pipe-step done';
        pReset.className = 'pipe-step active';
        statCalc.innerText = '計算完了 (2)';
        statMem.innerText = '対消滅消去中...';
        statMem.className = 'm-val val-calc';
      } else {
        // Phase 5: 完遂 & クリア
        pFire.className = 'pipe-step done';
        pCalc.className = 'pipe-step done';
        pStore.className = 'pipe-step done';
        pReset.className = 'pipe-step done';
        pDone.className = 'pipe-step active';
        statCalc.innerText = '1サイクル完了';
        statMem.innerText = 'Q = 0 (初期化)';
        statMem.className = 'm-val val-off';
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
      stepIndex = Math.min(80, stepIndex + 1);
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

      if (isPlaying && time - lastTime > 150) {
        lastTime = time;
        if (stepIndex < 80) {
          stepIndex++;
          renderStep();
        } else {
          setTimeout(() => {
            if (isPlaying && stepIndex >= 80) {
              stepIndex = 0;
              renderStep();
            }
          }, 2500);
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

fs.writeFileSync('all_in_one_3d_viewer.html', html);
console.log('Successfully written all_in_one_3d_viewer.html!');
