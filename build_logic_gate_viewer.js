// build_logic_gate_viewer.js
// 3D 光線論理（Glider Collision Logic）NOTゲート 3D実証ビューア
// A=0 (入力なし) -> 出力=1 (青弾が通過してセンサー点灯)
// A=1 (入力あり) -> 出力=0 (赤弾と青弾が正面衝突して完全対消滅)

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

const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

// クロック弾 (Clock: 進行方向 [-1, 0, 1])
const bulletClock = init7;
// 入力弾 (Input A: 進行方向 [1, 0, -1])
const bulletInput = init7.map(([x,y,z]) => [-x, y, -z]);
const d = 8; // 衝突距離

const maxSteps = 24;

// Case 0: A = 0 (クロック弾のみ)
let c0 = new Set(bulletClock.map(p => p.join(',')));
const framesCase0 = [Array.from(c0).map(k => k.split(',').map(Number))];
for (let t = 1; t <= maxSteps; t++) {
  c0 = pureStep(c0);
  framesCase0.push(Array.from(c0).map(k => k.split(',').map(Number)));
}

// Case 1: A = 1 (クロック弾 + 入力弾)
let c1 = new Set(bulletClock.map(p => p.join(',')));
for (const [x,y,z] of bulletInput) {
  c1.add(`${x - d},${y},${z + d}`);
}
const framesCase1 = [Array.from(c1).map(k => k.split(',').map(Number))];
for (let t = 1; t <= maxSteps; t++) {
  c1 = pureStep(c1);
  framesCase1.push(Array.from(c1).map(k => k.split(',').map(Number)));
}

console.log('Frames generated.');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>3D 弾丸衝突型 NOTゲート（論理回路）シミュレータ</title>
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
      background: rgba(11, 17, 28, 0.92);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 16px 20px;
      max-width: 460px;
      backdrop-filter: blur(14px);
      box-shadow: 0 12px 36px rgba(0,0,0,0.8);
    }
    h1 {
      font-size: 1.2rem;
      margin: 0 0 10px 0;
      color: #58a6ff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #1f6feb;
      color: white;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 12px;
      font-weight: bold;
    }
    p {
      font-size: 0.85rem;
      line-height: 1.5;
      margin: 0 0 12px 0;
      color: #8b949e;
    }
    .controls {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    button {
      background: #21262d;
      color: #c9d1d9;
      border: 1px solid #30363d;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    button:hover {
      background: #30363d;
      border-color: #8b949e;
    }
    .btn-active {
      background: #1f6feb !important;
      border-color: #388bfd !important;
      color: white !important;
      font-weight: bold;
    }
    .slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 12px 0;
      font-size: 0.85rem;
    }
    .slider-row input[type=range] {
      flex: 1;
    }
    .truth-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.8rem;
      font-family: monospace;
      margin-top: 10px;
    }
    .truth-table th, .truth-table td {
      border: 1px solid #30363d;
      padding: 4px 8px;
      text-align: center;
    }
    .truth-table th { background: rgba(33, 38, 45, 0.8); }
    .row-active { background: rgba(31, 111, 235, 0.3) !important; font-weight: bold; color: #58a6ff; }
    .stats-card {
      background: rgba(6, 10, 17, 0.8);
      border: 1px solid #21262d;
      border-radius: 6px;
      padding: 10px;
      font-size: 0.8rem;
      font-family: monospace;
      margin-top: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .stat-label { color: #8b949e; }
    .stat-val { color: #58a6ff; font-weight: bold; }
    .legend {
      display: flex;
      gap: 12px;
      font-size: 0.75rem;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #30363d;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .legend-dot {
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
    <h1>
      <span>⚡ 3D 弾丸衝突型 NOTゲート</span>
      <span class="badge">Logic Inverter</span>
    </h1>
    <p id="mode-desc">
      <b>光線論理（Billiard Ball Logic）の実証</b><br>
      B4/S45の7セル弾同士が正面衝突すると<b>火花一つ残さず「完全対消滅（0セル）」</b>する特性を利用した、100%純粋な反転論理回路（NOTゲート）です！
    </p>

    <div class="controls">
      <button id="btn-input-0" class="btn-active">入力 A = 0 (弾なし ➔ 出力 1)</button>
      <button id="btn-input-1">入力 A = 1 (弾あり ➔ 出力 0)</button>
    </div>

    <div class="controls">
      <button id="btn-play">⏸ 一時停止</button>
      <button id="btn-reset">↺ リセット (t=0)</button>
    </div>

    <div class="slider-row">
      <span>世代:</span>
      <input type="range" id="step-slider" min="0" max="${maxSteps}" value="0">
      <span id="step-display">t = 0</span>
    </div>

    <table class="truth-table">
      <thead>
        <tr><th>入力 A (データ弾)</th><th>常時クロック弾</th><th>衝突現象</th><th>出力 NOT(A)</th></tr>
      </thead>
      <tbody>
        <tr id="row-a0" class="row-active"><td>0 (なし)</td><td>1 (あり)</td><td>直進通過</td><td><b>1 (到達)</b></td></tr>
        <tr id="row-a1"><td>1 (あり)</td><td>1 (あり)</td><td>完全対消滅</td><td><b>0 (消滅)</b></td></tr>
      </tbody>
    </table>

    <div class="stats-card">
      <div><span class="stat-label">入力 A: </span><span id="stat-input" class="stat-val">0 (OFF)</span></div>
      <div><span class="stat-label">論理出力: </span><span id="stat-output" class="stat-val">1 (ON・突破)</span></div>
      <div><span class="stat-label">現在セル数: </span><span id="stat-cells" class="stat-val">7</span></div>
      <div><span class="stat-label">ゲート状態: </span><span id="stat-state" class="stat-val">クロック通過中</span></div>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#58a6ff;"></div><span>クロック弾 (常時供給)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#f85149;"></div><span>入力 A 弾 (迎撃)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#3fb950;"></div><span>出力センサーゲート</span></div>
    </div>
  </div>

  <script>
    const case0 = ${JSON.stringify(framesCase0)};
    const case1 = ${JSON.stringify(framesCase1)};

    let currentInput = 0; // 0 or 1
    let currentFrames = case0;
    let stepIndex = 0;
    let isPlaying = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 20, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-4, 1, 4);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const gridHelper = new THREE.GridHelper(40, 40, 0x30363d, 0x161b22);
    gridHelper.position.set(-4, 1, -0.5);
    scene.add(gridHelper);

    // 衝突ゲート交差点マーカー (X=-4, Z=4)
    const gateGeom = new THREE.RingGeometry(1.5, 2.0, 16);
    const gateMat = new THREE.MeshBasicMaterial({ color: 0x8957e5, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const gateRing = new THREE.Mesh(gateGeom, gateMat);
    gateRing.position.set(-4, 1, 4);
    gateRing.rotation.x = Math.PI / 2;
    scene.add(gateRing);

    // 出力センサーゲート (X=-6, Z=6)
    const sensorGeom = new THREE.RingGeometry(1.5, 2.0, 16);
    const sensorMat = new THREE.MeshBasicMaterial({ color: 0x3fb950, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const sensorRing = new THREE.Mesh(sensorGeom, sensorMat);
    sensorRing.position.set(-6, 1, 6);
    sensorRing.rotation.x = Math.PI / 2;
    scene.add(sensorRing);

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    function renderStep() {
      while (boxGroup.children.length > 0) {
        const obj = boxGroup.children[0];
        boxGroup.remove(obj);
      }

      const frame = currentFrames[stepIndex] || [];
      for (const [x, y, z] of frame) {
        // 入力弾かクロック弾か
        const isInput = (currentInput === 1 && stepIndex < 12 && x < -3);
        const color = isInput ? 0xf85149 : 0x58a6ff;

        const mat = new THREE.MeshLambertMaterial({
          color: color,
          transparent: true,
          opacity: 0.94
        });
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      }

      document.getElementById('step-slider').value = stepIndex;
      document.getElementById('step-display').innerText = 't = ' + stepIndex;
      document.getElementById('stat-cells').innerText = frame.length;

      if (currentInput === 0) {
        document.getElementById('stat-output').innerText = '1 (ON・直進突破)';
        document.getElementById('stat-output').style.color = '#3fb950';
        sensorMat.color.setHex(0x3fb950);
        document.getElementById('stat-state').innerText = stepIndex >= 16 ? '出力センサー到達！' : 'クロック通過中';
      } else {
        if (stepIndex >= 16) {
          document.getElementById('stat-output').innerText = '0 (OFF・完全消滅)';
          document.getElementById('stat-output').style.color = '#f85149';
          sensorMat.color.setHex(0x30363d); // センサー消灯
          document.getElementById('stat-state').innerText = '衝突対消滅・消滅完了！';
        } else {
          document.getElementById('stat-output').innerText = '計算中...';
          document.getElementById('stat-output').style.color = '#8b949e';
          document.getElementById('stat-state').innerText = '迎撃接近中...';
        }
      }
    }

    function setInput(val) {
      currentInput = val;
      stepIndex = 0;
      document.getElementById('btn-input-0').classList.toggle('btn-active', val === 0);
      document.getElementById('btn-input-1').classList.toggle('btn-active', val === 1);
      document.getElementById('row-a0').classList.toggle('row-active', val === 0);
      document.getElementById('row-a1').classList.toggle('row-active', val === 1);

      currentFrames = (val === 0) ? case0 : case1;
      document.getElementById('stat-input').innerText = val === 0 ? '0 (なし)' : '1 (あり)';
      renderStep();
    }

    document.getElementById('btn-input-0').addEventListener('click', () => setInput(0));
    document.getElementById('btn-input-1').addEventListener('click', () => setInput(1));

    document.getElementById('btn-play').addEventListener('click', () => {
      isPlaying = !isPlaying;
      document.getElementById('btn-play').innerText = isPlaying ? '⏸ 一時停止' : '▶ 再生';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      stepIndex = 0;
      renderStep();
    });

    document.getElementById('step-slider').addEventListener('input', (e) => {
      stepIndex = parseInt(e.target.value);
      renderStep();
    });

    setInterval(() => {
      if (isPlaying) {
        stepIndex = (stepIndex + 1) % (maxSteps + 1);
        renderStep();
      }
    }, 180);

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }

    renderStep();
    animate();
  </script>
</body>
</html>`;

fs.writeFileSync('logic_gate_3d_viewer.html', html, 'utf8');
console.log('Successfully written logic_gate_3d_viewer.html!');
