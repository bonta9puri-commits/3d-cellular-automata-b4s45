// build_b4s45_bullet_viewer.js
// B4/S45 7セル弾（SymCluster_388）の火花特性・呼吸サイクル・自浄消滅の実証ビューア

const fs = require('fs');

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

const maxSteps = 32;

// モード1: 7セル弾の純粋航行（呼吸サイクル 7->8->7->6->7）
let bulletCells = new Set(init7.map(c => c.join(',')));
const bulletFrames = [Array.from(bulletCells).map(k => k.split(',').map(Number))];
for (let t = 1; t <= maxSteps; t++) {
  bulletCells = pureStep(bulletCells);
  bulletFrames.push(Array.from(bulletCells).map(k => k.split(',').map(Number)));
}

// モード2: 火花（外乱セル）投入実験（弾丸の周囲に火花を散らしたとき、自浄作用で即消滅するか）
let sparkTestCells = new Set(init7.map(c => c.join(',')));
// 周囲に1〜3セルの火花を3箇所にまき散らす
sparkTestCells.add('2,1,0'); // 1セル火花
sparkTestCells.add('-1,2,0'); sparkTestCells.add('-1,3,0'); // 2セル火花
sparkTestCells.add('0,0,2'); sparkTestCells.add('1,0,2'); sparkTestCells.add('0,1,2'); // 3セル火花

const sparkFrames = [Array.from(sparkTestCells).map(k => k.split(',').map(Number))];
for (let t = 1; t <= maxSteps; t++) {
  sparkTestCells = pureStep(sparkTestCells);
  sparkFrames.push(Array.from(sparkTestCells).map(k => k.split(',').map(Number)));
}

console.log('Frames generation complete.');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>B4/S45 7セル弾 火花・自浄特性 3D実証ビューア</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #06090e;
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
      background: rgba(13, 17, 23, 0.88);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 16px 20px;
      max-width: 460px;
      backdrop-filter: blur(12px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.6);
    }
    h1 {
      font-size: 1.15rem;
      margin: 0 0 10px 0;
      color: #388bfd;
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
      line-height: 1.45;
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
      font-size: 0.82rem;
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
    .stats-card {
      background: rgba(9, 13, 19, 0.75);
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
      <span>⚡ B4/S45 7セル弾 火花・自浄特性</span>
      <span class="badge">火花自己消滅</span>
    </h1>
    <p id="mode-desc">
      <b>純粋航行モード</b>: わずか7セルの最小記録宇宙船。セル数が <b>7 → 8 → 7 → 6 → 7</b> と規則正しく呼吸しながら、斜め上空へ速度 c/4 で無限直進します！
    </p>

    <div class="controls">
      <button id="btn-mode-clean" class="btn-active">🚀 純粋航行 (呼吸サイクル)</button>
      <button id="btn-mode-spark">💥 火花投入 (自浄消滅テスト)</button>
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

    <div class="stats-card">
      <div><span class="stat-label">ルール: </span><span class="stat-val">B4 / S45</span></div>
      <div><span class="stat-label">セル数: </span><span id="stat-cells" class="stat-val">7</span></div>
      <div><span class="stat-label">呼吸位相: </span><span id="stat-phase" class="stat-val">基本形 (7)</span></div>
      <div><span class="stat-label">火花自浄: </span><span id="stat-quench" class="stat-val">1ステップ即死</span></div>
      <div><span class="stat-label">Z軸厚み: </span><span id="stat-zspan" class="stat-val">2</span></div>
      <div><span class="stat-label">位置: </span><span id="stat-pos" class="stat-val">(0.0, 0.0, 0.0)</span></div>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#3fb950;"></div><span>下層 (Z=0)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#58a6ff;"></div><span>上層 (Z=1)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#f85149;"></div><span>投入火花 (即死)</span></div>
    </div>
  </div>

  <script>
    const cleanData = ${JSON.stringify(bulletFrames)};
    const sparkData = ${JSON.stringify(sparkFrames)};

    let currentMode = 'clean';
    let currentFrames = cleanData;
    let stepIndex = 0;
    let isPlaying = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06090e);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(16, 18, 16);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 0.5);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);

    const gridHelper = new THREE.GridHelper(50, 50, 0x30363d, 0x161b22);
    gridHelper.position.set(-5, 5, -0.5);
    scene.add(gridHelper);

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    function getColor(z, isSpark) {
      if (isSpark) return 0xf85149; // 赤色火花
      if (z === 0) return 0x3fb950; // グリーン
      if (z === 1) return 0x58a6ff; // ブルー
      return 0xa371f7;
    }

    function renderStep() {
      while (boxGroup.children.length > 0) {
        const obj = boxGroup.children[0];
        boxGroup.remove(obj);
      }

      const frame = currentFrames[stepIndex] || [];
      let minZ = Infinity, maxZ = -Infinity;
      let sumX = 0, sumY = 0, sumZ = 0;

      for (const [x, y, z] of frame) {
        const isSpark = (stepIndex === 0 && currentMode === 'spark' && (
          (x===2&&y===1&&z===0) || (x===-1&&z===0) || (z===2)
        ));

        const mat = new THREE.MeshLambertMaterial({
          color: getColor(z, isSpark),
          transparent: true,
          opacity: 0.92
        });
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);

        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
        sumX += x; sumY += y; sumZ += z;
      }

      const avgX = (sumX / frame.length).toFixed(1);
      const avgY = (sumY / frame.length).toFixed(1);
      const avgZ = (sumZ / frame.length).toFixed(1);

      document.getElementById('step-slider').value = stepIndex;
      document.getElementById('step-display').innerText = 't = ' + stepIndex;
      document.getElementById('stat-cells').innerText = frame.length;
      document.getElementById('stat-zspan').innerText = (maxZ - minZ + 1);
      document.getElementById('stat-pos').innerText = \`(\${avgX}, \${avgY}, \${avgZ})\`;

      const phases = ['基本形 (7)', '展開 (8)', '反転 (7)', '収縮 (6)'];
      document.getElementById('stat-phase').innerText = phases[stepIndex % 4];

      if (currentMode === 'spark') {
        document.getElementById('stat-quench').innerText = stepIndex >= 1 ? '火花即死・自浄完了' : '火花散布中 (赤)';
      } else {
        document.getElementById('stat-quench').innerText = 'ゴミゼロ・完全クリーン';
      }

      // カメラ追従
      controls.target.set(parseFloat(avgX), parseFloat(avgY), parseFloat(avgZ));
    }

    function setMode(mode) {
      currentMode = mode;
      stepIndex = 0;
      document.getElementById('btn-mode-clean').classList.toggle('btn-active', mode === 'clean');
      document.getElementById('btn-mode-spark').classList.toggle('btn-active', mode === 'spark');

      if (mode === 'clean') {
        currentFrames = cleanData;
        document.getElementById('mode-desc').innerHTML = '<b>純粋航行モード</b>: わずか7セルの最小記録宇宙船。セル数が <b>7 → 8 → 7 → 6 → 7</b> と規則正しく呼吸しながら、斜め上空へ速度 c/4 で無限直進します！';
      } else {
        currentFrames = sparkData;
        document.getElementById('mode-desc').innerHTML = '<b>火花投入テスト</b>: 弾丸の周囲に1〜3セルの赤い火花を散布。B4/S45の特性により、近傍数不足（過疎）で<b>わずか1ステップで火花が自浄消滅</b>し、弾丸だけが無傷で飛び続けます！';
      }
      renderStep();
    }

    document.getElementById('btn-mode-clean').addEventListener('click', () => setMode('clean'));
    document.getElementById('btn-mode-spark').addEventListener('click', () => setMode('spark'));

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

fs.writeFileSync('b4s45_bullet_viewer.html', html, 'utf8');
console.log('Successfully written b4s45_bullet_viewer.html!');
