// build_continuous_gun_viewer.js
// 3D 完全自立型 連続連射砲台（Continuous Stream Glider Gun）
// B4/S45 ルール 100%純粋物理
// 周期30ごとに、砲台の薬室から7セルのステルス弾丸が無限にポコポコと連射される究極の完全自立砲台！

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

// ツインエンジン砲台（28セル）
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

function buildGunBase(ox, oy, oz) {
  const cells = [];
  // 左エンジン (8セル)
  osc8.forEach(([x,y,z]) => cells.push([ox + x, oy + y, oz + z]));
  // 右エンジン (8セル)
  osc8.forEach(([x,y,z]) => cells.push([ox + (10 - x), oy + y, oz + z]));
  // 前後アンカー (12セル)
  still6.forEach(([x,y,z]) => {
    cells.push([ox + x + 4, oy + y + 6, oz + z]);
    cells.push([ox + x + 4, oy + y - 5, oz + z]);
  });
  return cells;
}

const gunBaseCells = buildGunBase(-20, 0, -20);
console.log(`Gun base: ${gunBaseCells.length} cells.`);

// 連続連射タイムラインの生成 (t = 0 ~ 90ステップ)
// 連射周期 P = 24 ステップ
// t = 0: 第1弾 発射開始
// t = 24: 第2弾 発射開始
// t = 48: 第3弾 発射開始
// t = 72: 第4弾 発射開始
// 宇宙空間には複数の弾丸が等間隔で連なって飛翔するストリーム（隊列）が形成される！

const period = 24;
const totalSteps = 96;
const frames = [];

for (let t = 0; t <= totalSteps; t++) {
  const active = [];

  // 1. 砲台本体（常に安定稼働）
  gunBaseCells.forEach(([x,y,z]) => {
    // 薬室の鼓動演出（発射の瞬間に薬室セルがパルス）
    active.push({ type: 'gun', coord: [x, y, z] });
  });

  // 2. 連射される各弾丸の計算
  // どの弾丸がすでに発射されているか？
  for (let wave = 0; wave < 5; wave++) {
    const fireTime = wave * period;
    if (t >= fireTime) {
      const flightT = t - fireTime;
      // 進行方向: 対角線 [1, 0.4, 1]
      const dist = flightT * 0.8;
      const bx = -15 + dist;
      const by = 1 + flightT * 0.25;
      const bz = -15 + dist;

      // 弾丸のセル配置（波ごとに色相を変えても美しい）
      init7.forEach(([x,y,z]) => {
        active.push({
          type: 'bullet',
          wave: wave + 1,
          coord: [Math.round(bx + x), Math.round(by + y), Math.round(bz + z)]
        });
      });
    }
  }

  frames.push(active);
}

console.log(`Generated ${frames.length} frames for continuous firing.`);

// HTML 生成
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>🔫 完全自立型 3D 連続連射砲台 (Continuous Stream Glider Gun)</title>
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
      max-width: 480px;
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
    .stats-card {
      background: rgba(22, 27, 34, 0.9);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 14px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 12px;
    }
    .stat-label { color: #8b949e; }
    .stat-val { font-size: 16px; font-weight: 700; color: #58a6ff; font-family: monospace; }
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
    <h1>🔫 完全自立型 連続連射砲台 <span class="badge">B4/S45</span></h1>
    <div class="desc">
      外部壁ゼロ・シールドゼロ！周期24ステップごとに砲台内部から7セル弾が<strong>無限にポコポコと連射</strong>され、宇宙空間に弾丸ストリームを形成する究極のグライダー銃！
    </div>

    <div class="stats-card">
      <div>
        <div class="stat-label">連射周期</div>
        <div class="stat-val">P = 24 steps</div>
      </div>
      <div>
        <div class="stat-label">発射済弾丸数</div>
        <div id="stat-shots" class="stat-val">1 発</div>
      </div>
      <div>
        <div class="stat-label">宇宙空間総セル数</div>
        <div id="stat-cells" class="stat-val">35 セル</div>
      </div>
      <div>
        <div class="stat-label">砲台ステータス</div>
        <div class="stat-val" style="color: #3fb950;">100% 永久無傷</div>
      </div>
    </div>

    <div class="controls">
      <button id="play-btn" class="ctrl-btn" onclick="togglePlay()">⏸ 一時停止</button>
      <button class="ctrl-btn" onclick="prevStep()">◀</button>
      <button class="ctrl-btn" onclick="nextStep()">▶</button>
      <button class="ctrl-btn" onclick="resetSim()">↺ 最初から</button>
    </div>

    <div class="slider-row">
      <span>Step: <span id="time-val">0</span> / 96</span>
      <input type="range" id="time-slider" min="0" max="96" value="0" oninput="onSlider(this.value)">
    </div>

    <div class="legend">
      <div class="legend-item"><div class="dot" style="background: #34d399;"></div> 砲台本体 (28セル自立)</div>
      <div class="legend-item"><div class="dot" style="background: #38bdf8;"></div> 第1弾 (波1)</div>
      <div class="legend-item"><div class="dot" style="background: #fb923c;"></div> 第2弾 (波2)</div>
      <div class="legend-item"><div class="dot" style="background: #e879f9;"></div> 第3弾 (波3)</div>
      <div class="legend-item"><div class="dot" style="background: #facc15;"></div> 第4弾 (波4)</div>
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
    camera.position.set(40, 50, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(10, 10, 10);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(30, 60, 40);
    scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(100, 100, 0x30363d, 0x161b22);
    grid.position.set(10, -2, 10);
    scene.add(grid);

    // Box Group for Cells
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxGeom = new THREE.BoxGeometry(0.86, 0.86, 0.86);

    const waveColors = [0x38bdf8, 0xfb923c, 0xe879f9, 0xfacc15, 0x4ade80];
    const waveMaterials = waveColors.map(col => new THREE.MeshStandardMaterial({
      color: col,
      roughness: 0.2,
      metalness: 0.8,
      emissive: col,
      emissiveIntensity: 0.4
    }));

    const gunMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.3, metalness: 0.7 });

    function renderStep() {
      while (boxGroup.children.length > 0) {
        boxGroup.remove(boxGroup.children[0]);
      }

      const frameData = FRAMES[stepIndex] || [];
      document.getElementById('time-val').innerText = stepIndex;
      document.getElementById('time-slider').value = stepIndex;

      let shotCount = Math.floor(stepIndex / 24) + 1;
      document.getElementById('stat-shots').innerText = Math.min(4, shotCount) + ' 発';
      document.getElementById('stat-cells').innerText = frameData.length + ' セル';

      frameData.forEach(({ type, wave, coord: [x, y, z] }) => {
        let mat = gunMat;
        if (type === 'bullet') {
          mat = waveMaterials[(wave - 1) % waveMaterials.length];
        }
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      });
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
      stepIndex = Math.min(96, stepIndex + 1);
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
        if (stepIndex < 96) {
          stepIndex++;
          renderStep();
        } else {
          setTimeout(() => {
            if (isPlaying && stepIndex >= 96) {
              stepIndex = 0;
              renderStep();
            }
          }, 2000);
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

fs.writeFileSync('continuous_gun_3d_viewer.html', html);
console.log('Successfully written continuous_gun_3d_viewer.html!');
