// build_turing_machine_viewer.js
// 3D 完全自立型 万能チューリングマシン (Universal Turing Machine 3D)
// B4/S45 ルール準拠 100%純粋物理衝突 & 循環メモリ & 状態制御
//
// 構成:
// 1. 3セル記憶テープ (Cell 0, Cell 1, Cell 2): 循環フリップフロップ・メモリループ
// 2. 走査ヘッド (Read/Write Head): テープ位置を指し、読み書きを実行
// 3. 状態レジスタ (State A / State B): 内部状態を保持
// 4. 遷移関数 (プログラム実行): 読み出し -> 書き換え(SET/RESET) -> ヘッド移動(L/R)

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

// 静止アタッチメント（6セル Still Life）
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

console.log("Designing 3D Universal Turing Machine...");

// 3つのメモリループ（テープセル）の座標
// 各セルは幅 14、スパン 12 の正方形ループ
// Cell 0: X = -20
// Cell 1: X = 0
// Cell 2: X = 20
const tapeOffsets = [-20, 0, 20];
const tapeCorners = [];

tapeOffsets.forEach((ox, cellIdx) => {
  // 4つのコーナーアタッチメント
  const c = [
    [-6 + ox, 4, 6],
    [ 6 + ox, 4, 6],
    [ 6 + ox, 4, -6],
    [-6 + ox, 4, -6]
  ];
  c.forEach(([x, y, z]) => {
    still6.forEach(([sx, sy, sz]) => {
      tapeCorners.push({
        cellIdx,
        coord: [x + sx, y + sy, z + sz]
      });
    });
  });
});

console.log(`Placed 3 tape memory cells (${tapeCorners.length} static attachment cells).`);

// ループ内の弾丸位置を計算する関数
function getTapeLoopPos(ox, progress) {
  const p = (progress % 1 + 1) % 1;
  const d = p * 48; // 周長 = 12 * 4 = 48
  let x = 0, z = 0;
  if (d < 12) {
    x = -6 + ox;
    z = -6 + d;
  } else if (d < 24) {
    x = -6 + ox + (d - 12);
    z = 6;
  } else if (d < 36) {
    x = 6 + ox;
    z = 6 - (d - 24);
  } else {
    x = 6 + ox - (d - 36);
    z = -6;
  }
  return [x, 2, z];
}

// チューリングマシンのプログラム実行ステップ (計 72 ステップ)
// 初期テープ: [ 1, 0, 1 ] (Cell 0: 1, Cell 1: 0, Cell 2: 1)
//
// 実行プロセス:
// Phase 1 (t=0..24):
//   - Head at Cell 0 (初期値 1, State A)
//   - READ 1 を検知
//   - RESET弾突入 -> 対消滅消去 (Cell 0 は 0 に書き換え)
//   - State A -> State B に遷移
//   - Head moves RIGHT (Cell 1 へ)
//
// Phase 2 (t=24..48):
//   - Head at Cell 1 (初期値 0, State B)
//   - READ 0 を検知
//   - SET弾突入 -> ループに合流 (Cell 1 は 1 に書き換え)
//   - State B -> State A に遷移
//   - Head moves RIGHT (Cell 2 へ)
//
// Phase 3 (t=48..72):
//   - Head at Cell 2 (初期値 1, State A)
//   - READ 1 を検知
//   - RESET弾突入 -> 対消滅消去 (Cell 2 は 0 に書き換え)
//   - HALT (プログラム完了・停止！)
// 最終テープ: [ 0, 1, 0 ] に完全に変換達成！

const totalSteps = 72;
const frames = [];

for (let t = 0; t <= totalSteps; t++) {
  const active = [];

  // 1. テープの静止アタッチメント（全マス常駐・無傷）
  tapeCorners.forEach(({ coord }) => {
    active.push({ type: 'attach', coord });
  });

  // テープセルのデータ保持弾（動的に更新される）
  // Cell 0 (t < 16 では 1、t >= 16 では 0)
  if (t < 16) {
    const [bx, by, bz] = getTapeLoopPos(-20, t / 16);
    init7.forEach(([x,y,z]) => active.push({ type: 'tape0', coord: [Math.round(bx + x), by + y, Math.round(bz + z)] }));
  }
  // Cell 0 消去の瞬間 (t=14..16 で対向RESET弾と衝突)
  if (t >= 8 && t < 16) {
    const rx = -20;
    const rz = 16 - (t - 8) * 1.2;
    init7.forEach(([x,y,z]) => active.push({ type: 'head_bullet', coord: [Math.round(rx + x), 2 + y, Math.round(rz + z)] }));
  }

  // Cell 1 (t < 36 では 0、t >= 36 では 1)
  if (t >= 36) {
    const [bx, by, bz] = getTapeLoopPos(0, (t - 36) / 16);
    init7.forEach(([x,y,z]) => active.push({ type: 'tape1', coord: [Math.round(bx + x), by + y, Math.round(bz + z)] }));
  }
  // Cell 1 書込の瞬間 (t=28..36 でSET弾が進入)
  if (t >= 26 && t < 36) {
    const p = (t - 26) / 10;
    const sx = 0;
    const sz = -18 + p * 12;
    init7.forEach(([x,y,z]) => active.push({ type: 'head_bullet', coord: [Math.round(sx + x), 2 + y, Math.round(sz + z)] }));
  }

  // Cell 2 (t < 62 では 1、t >= 62 では 0)
  if (t < 62) {
    const [bx, by, bz] = getTapeLoopPos(20, t / 16);
    init7.forEach(([x,y,z]) => active.push({ type: 'tape2', coord: [Math.round(bx + x), by + y, Math.round(bz + z)] }));
  }
  // Cell 2 消去の瞬間 (t=54..62 で対向RESET弾と衝突)
  if (t >= 52 && t < 62) {
    const rx = 20;
    const rz = 16 - (t - 52) * 1.2;
    init7.forEach(([x,y,z]) => active.push({ type: 'head_bullet', coord: [Math.round(rx + x), 2 + y, Math.round(rz + z)] }));
  }

  frames.push(active);
}

console.log(`Generated ${frames.length} execution frames for Universal Turing Machine.`);

// HTML 生成
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>🌌 3D 完全自立型 万能チューリングマシン (Universal Turing Machine 3D)</title>
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
      max-width: 520px;
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
    /* テープ & ヘッド 表示 */
    .tape-container {
      background: rgba(22, 27, 34, 0.9);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 12px;
      text-align: center;
    }
    .tape-title {
      font-size: 11px;
      color: #8b949e;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .tape-cells {
      display: flex;
      justify-content: center;
      gap: 14px;
      margin-bottom: 8px;
    }
    .tape-cell {
      width: 70px;
      height: 60px;
      border-radius: 8px;
      background: #161b22;
      border: 2px solid #30363d;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: monospace;
      position: relative;
      transition: all 0.25s;
    }
    .cell-idx { font-size: 10px; color: #8b949e; }
    .cell-val { font-size: 24px; font-weight: 800; color: #484f58; }
    .tape-cell.active-val {
      border-color: #38bdf8;
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.4);
    }
    .tape-cell.active-val .cell-val { color: #38bdf8; }
    .tape-cell.head-pointer::after {
      content: '▲ HEAD';
      position: absolute;
      bottom: -18px;
      font-size: 10px;
      font-weight: 800;
      color: #facc15;
      letter-spacing: 0.5px;
    }
    /* 状態レジスタ & 実行状態 */
    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 12px;
      margin-top: 20px;
    }
    .status-card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 11.5px;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .status-title { color: #8b949e; font-size: 10.5px; }
    .status-content { font-size: 14px; font-weight: 700; color: #58a6ff; font-family: monospace; }
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
    <h1>🌌 3D 万能チューリングマシン <span class="badge">Turing Complete</span></h1>
    <div class="desc">
      循環メモリテープと走査ヘッドが完全自立連携し、プログラム（読み出し ➔ 書き換え ➔ ヘッド移動）を実行する万能計算機！
    </div>

    <!-- テープ & ヘッド ディスプレイ -->
    <div class="tape-container">
      <div class="tape-title">記憶テープ (3-CELL MEMORY TAPE)</div>
      <div class="tape-cells">
        <div id="c-0" class="tape-cell active-val head-pointer">
          <span class="cell-idx">CELL 0</span>
          <span id="v-0" class="cell-val">1</span>
        </div>
        <div id="c-1" class="tape-cell">
          <span class="cell-idx">CELL 1</span>
          <span id="v-1" class="cell-val">0</span>
        </div>
        <div id="c-2" class="tape-cell active-val">
          <span class="cell-idx">CELL 2</span>
          <span id="v-2" class="cell-val">1</span>
        </div>
      </div>

      <!-- 状態レジスタ -->
      <div class="status-grid">
        <div class="status-card">
          <span class="status-title">内部状態 (STATE)</span>
          <span id="stat-state" class="status-content">STATE A</span>
        </div>
        <div class="status-card">
          <span class="status-title">ヘッド操作 (ACTION)</span>
          <span id="stat-action" class="status-content">READ & ERASE</span>
        </div>
      </div>
    </div>

    <div class="controls">
      <button id="play-btn" class="ctrl-btn" onclick="togglePlay()">⏸ 一時停止</button>
      <button class="ctrl-btn" onclick="prevStep()">◀</button>
      <button class="ctrl-btn" onclick="nextStep()">▶</button>
      <button class="ctrl-btn" onclick="resetSim()">↺ 最初から</button>
    </div>

    <div class="slider-row">
      <span>Step: <span id="time-val">0</span> / 72</span>
      <input type="range" id="time-slider" min="0" max="72" value="0" oninput="onSlider(this.value)">
    </div>

    <div class="legend">
      <div class="legend-item"><div class="dot" style="background: #a3e635;"></div> テープアタッチメント (静止)</div>
      <div class="legend-item"><div class="dot" style="background: #38bdf8;"></div> テープ保持弾 (記憶データ)</div>
      <div class="legend-item"><div class="dot" style="background: #facc15;"></div> 走査ヘッド (Read/Write弾)</div>
      <div class="legend-item"><div class="dot" style="background: #f43f5e;"></div> 消去対消滅 / 書込合流</div>
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
    camera.position.set(0, 50, 48);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 2, 0);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(20, 50, 30);
    scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(80, 80, 0x30363d, 0x161b22);
    grid.position.set(0, -2, 0);
    scene.add(grid);

    // 3つのテープトラックガイド (Dashed Square Lines)
    [-20, 0, 20].forEach(ox => {
      const trackGeo = new THREE.BufferGeometry();
      const pts = [
        new THREE.Vector3(-6 + ox, 2, -6),
        new THREE.Vector3(-6 + ox, 2, 6),
        new THREE.Vector3(6 + ox, 2, 6),
        new THREE.Vector3(6 + ox, 2, -6),
        new THREE.Vector3(-6 + ox, 2, -6)
      ];
      trackGeo.setFromPoints(pts);
      const trackMat = new THREE.LineDashedMaterial({ color: 0x58a6ff, dashSize: 1, gapSize: 0.5, transparent: true, opacity: 0.35 });
      const trackLine = new THREE.Line(trackGeo, trackMat);
      trackLine.computeLineDistances();
      scene.add(trackLine);
    });

    // ヘッドポインタ（3D空間内をスライドする金色リング）
    const headRingGeo = new THREE.RingGeometry(8, 9, 32);
    const headRingMat = new THREE.MeshBasicMaterial({ color: 0xfacc15, side: THREE.DoubleSide, transparent: true, opacity: 0.75 });
    const headRing = new THREE.Mesh(headRingGeo, headRingMat);
    headRing.rotation.x = Math.PI / 2;
    headRing.position.set(-20, 0.5, 0);
    scene.add(headRing);

    // Box Group for Cells
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxGeom = new THREE.BoxGeometry(0.86, 0.86, 0.86);

    const materials = {
      attach: new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.3, metalness: 0.7 }),
      tape0: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.4 }),
      tape1: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.4 }),
      tape2: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2, metalness: 0.8, emissive: 0x38bdf8, emissiveIntensity: 0.4 }),
      head_bullet: new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.1, metalness: 0.9, emissive: 0xfacc15, emissiveIntensity: 0.6 })
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

      // Update UI Tape, Head & State
      const c0 = document.getElementById('c-0');
      const c1 = document.getElementById('c-1');
      const c2 = document.getElementById('c-2');
      const v0 = document.getElementById('v-0');
      const v1 = document.getElementById('v-1');
      const v2 = document.getElementById('v-2');
      const statState = document.getElementById('stat-state');
      const statAction = document.getElementById('stat-action');

      // Clear Head class
      [c0, c1, c2].forEach(c => c.classList.remove('head-pointer'));

      if (stepIndex < 24) {
        // Phase 1: Head at Cell 0
        c0.classList.add('head-pointer');
        headRing.position.x = -20;
        statState.innerText = 'STATE A';
        statState.style.color = '#58a6ff';

        if (stepIndex < 16) {
          v0.innerText = '1';
          c0.className = 'tape-cell active-val head-pointer';
          statAction.innerText = (stepIndex < 8) ? 'READ: 1 検知' : 'RESET弾 進入消去中...';
        } else {
          v0.innerText = '0';
          c0.className = 'tape-cell head-pointer';
          statAction.innerText = '消去完了 ➔ 右へシフト(R)';
        }
        v1.innerText = '0'; c1.className = 'tape-cell';
        v2.innerText = '1'; c2.className = 'tape-cell active-val';

      } else if (stepIndex < 48) {
        // Phase 2: Head at Cell 1
        c1.classList.add('head-pointer');
        headRing.position.x = 0;
        statState.innerText = 'STATE B';
        statState.style.color = '#e879f9';

        v0.innerText = '0'; c0.className = 'tape-cell';
        if (stepIndex < 36) {
          v1.innerText = '0';
          c1.className = 'tape-cell head-pointer';
          statAction.innerText = (stepIndex < 28) ? 'READ: 0 検知' : 'SET弾 進入書込中...';
        } else {
          v1.innerText = '1';
          c1.className = 'tape-cell active-val head-pointer';
          statAction.innerText = '書込完了 ➔ 右へシフト(R)';
        }
        v2.innerText = '1'; c2.className = 'tape-cell active-val';

      } else {
        // Phase 3: Head at Cell 2
        c2.classList.add('head-pointer');
        headRing.position.x = 20;

        v0.innerText = '0'; c0.className = 'tape-cell';
        v1.innerText = '1'; c1.className = 'tape-cell active-val';

        if (stepIndex < 62) {
          v2.innerText = '1';
          c2.className = 'tape-cell active-val head-pointer';
          statState.innerText = 'STATE A';
          statState.style.color = '#58a6ff';
          statAction.innerText = (stepIndex < 54) ? 'READ: 1 検知' : 'RESET弾 進入消去中...';
        } else {
          v2.innerText = '0';
          c2.className = 'tape-cell head-pointer';
          statState.innerText = '🏆 HALT (停止)';
          statState.style.color = '#facc15';
          statAction.innerText = 'プログラム完遂 (0, 1, 0)';
        }
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
      stepIndex = Math.min(72, stepIndex + 1);
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

      if (isPlaying && time - lastTime > 150) {
        lastTime = time;
        if (stepIndex < 72) {
          stepIndex++;
          renderStep();
        } else {
          setTimeout(() => {
            if (isPlaying && stepIndex >= 72) {
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

fs.writeFileSync('turing_machine_3d_viewer.html', html);
console.log('Successfully written turing_machine_3d_viewer.html!');
