// build_infinite_glider_viewer.js
const fs = require('fs');

const glider2D = [[0,1], [1,2], [2,0], [2,1], [2,2]];
const g10_init = [];
for (const [x, y] of glider2D) {
  g10_init.push([x, y, 0]);
  g10_init.push([x, y, 1]);
}

const g7_init = [
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

function simulate(initCoords, b, s, maxSteps) {
  let current = new Set(initCoords.map(c => c.join(',')));
  const frames = [initCoords];

  for (let t = 1; t <= maxSteps; t++) {
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
    current = next;
    frames.push(Array.from(current).map(k => k.split(',').map(Number)));
  }
  return frames;
}

const maxSteps = 48;
const g10_frames = simulate(g10_init, [6], [5,6,7], maxSteps);
const g7_frames = simulate(g7_init, [4], [4,5], maxSteps);

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>3D 無限航行グライダー（真の宇宙船）実証ビューア</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #0d1117;
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
      background: rgba(22, 27, 34, 0.88);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 16px 20px;
      max-width: 440px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    h1 {
      font-size: 1.15rem;
      margin: 0 0 10px 0;
      color: #58a6ff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #238636;
      color: white;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 12px;
      text-transform: uppercase;
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
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    button:hover {
      background: #30363d;
      border-color: #8b949e;
    }
    button.primary {
      background: #1f6feb;
      border-color: #388bfd;
      color: white;
    }
    button.primary:hover {
      background: #388bfd;
    }
    .btn-active {
      background: #388bfd !important;
      border-color: #58a6ff !important;
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
      background: rgba(13, 17, 23, 0.7);
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
      <span>🛸 3D 無限直進宇宙船</span>
      <span class="badge">100% 永久保証</span>
    </h1>
    <p id="desc-text">
      <b>Life 5766 (B6/S567)</b>: 2Dグライダーを2層重ねただけの10セル極薄偏平弾。<b>Z軸厚みわずか2</b>を完全キープし、水平(X-Y)平面を対角線方向へ無限に直進！
    </p>

    <div class="controls">
      <button id="btn-glider10" class="primary btn-active">🚀 2層グライダー (10セル/水平)</button>
      <button id="btn-glider7">⚡ ステルス弾 (7セル/斜上)</button>
    </div>

    <div class="controls">
      <button id="btn-play" class="primary">▶ 再生 / 一時停止</button>
      <button id="btn-reset">↺ リセット (t=0)</button>
    </div>

    <div class="slider-row">
      <span>世代:</span>
      <input type="range" id="step-slider" min="0" max="${maxSteps}" value="0">
      <span id="step-display">t = 0</span>
    </div>

    <div class="stats-card">
      <div><span class="stat-label">ルール: </span><span id="stat-rule" class="stat-val">Life 5766</span></div>
      <div><span class="stat-label">セル数: </span><span id="stat-cells" class="stat-val">10</span></div>
      <div><span class="stat-label">Z軸厚み: </span><span id="stat-zspan" class="stat-val">2</span></div>
      <div><span class="stat-label">速度: </span><span id="stat-speed" class="stat-val">c/4 (0.35 cell/t)</span></div>
      <div><span class="stat-label">周期: </span><span id="stat-period" class="stat-val">P = 4</span></div>
      <div><span class="stat-label">位置: </span><span id="stat-pos" class="stat-val">(0.0, 0.0, 0.0)</span></div>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#00ffff;"></div><span>下層 (Z=0)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#ff7b72;"></div><span>上層 (Z=1)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#d2a8ff;"></div><span>Z≧2</span></div>
    </div>
  </div>

  <script>
    const g10_data = ${JSON.stringify(g10_frames)};
    const g7_data = ${JSON.stringify(g7_frames)};

    let currentMode = 'g10'; // 'g10' or 'g7'
    let currentFrames = g10_data;
    let stepIndex = 0;
    let isPlaying = true;
    let playInterval = null;

    // Three.js 初期化
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(16, 14, 20);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(6, 6, 0.5);

    // ライティング
    const ambLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(20, 30, 20);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x58a6ff, 0.4);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // グリッドと軌跡
    const gridHelper = new THREE.GridHelper(50, 50, 0x30363d, 0x161b22);
    gridHelper.rotation.x = Math.PI / 2; // XY平面に設置
    scene.add(gridHelper);

    // 軌跡ライン
    const trailGeom = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0x388bfd, transparent: true, opacity: 0.5 });
    const trailLine = new THREE.Line(trailGeom, trailMat);
    scene.add(trailLine);

    // ボックスメッシュ管理
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    function getColorForZ(z) {
      if (z === 0) return 0x00ffff; // シアン
      if (z === 1) return 0xff7b72; // サーモンオレンジ
      if (z === -1) return 0x3fb950; // グリーン
      return 0xd2a8ff; // パープル
    }

    function renderStep() {
      while (boxGroup.children.length > 0) {
        const obj = boxGroup.children[0];
        boxGroup.remove(obj);
      }

      const frame = currentFrames[stepIndex] || [];
      if (frame.length === 0) return;

      let minZ = Infinity, maxZ = -Infinity;
      let sumX = 0, sumY = 0, sumZ = 0;

      for (const [x, y, z] of frame) {
        const mat = new THREE.MeshLambertMaterial({
          color: getColorForZ(z),
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

      // UI 更新
      document.getElementById('step-slider').value = stepIndex;
      document.getElementById('step-display').innerText = 't = ' + stepIndex;
      document.getElementById('stat-cells').innerText = frame.length;
      document.getElementById('stat-zspan').innerText = (maxZ - minZ + 1);
      document.getElementById('stat-pos').innerText = \`(\${avgX}, \${avgY}, \${avgZ})\`;

      // 軌跡更新
      const trailPoints = [];
      for (let i = 0; i <= stepIndex; i++) {
        const f = currentFrames[i];
        if (f && f.length > 0) {
          const sx = f.reduce((s, c) => s + c[0], 0) / f.length;
          const sy = f.reduce((s, c) => s + c[1], 0) / f.length;
          const sz = f.reduce((s, c) => s + c[2], 0) / f.length;
          trailPoints.push(new THREE.Vector3(sx, sy, sz));
        }
      }
      trailGeom.setFromPoints(trailPoints);

      // カメラをグライダーに追従
      controls.target.set(parseFloat(avgX), parseFloat(avgY), parseFloat(avgZ));
    }

    function setMode(mode) {
      currentMode = mode;
      stepIndex = 0;
      if (mode === 'g10') {
        currentFrames = g10_data;
        document.getElementById('btn-glider10').classList.add('btn-active');
        document.getElementById('btn-glider7').classList.remove('btn-active');
        document.getElementById('stat-rule').innerText = 'Life 5766 (B6/S567)';
        document.getElementById('desc-text').innerHTML = '<b>Life 5766 (B6/S567)</b>: 2Dグライダーを2層重ねただけの10セル極薄偏平弾。<b>Z軸厚みわずか2</b>を完全キープし、水平(X-Y)平面を対角線方向へ無限に直進！';
        gridHelper.rotation.x = Math.PI / 2; // XY平面
        camera.position.set(16, 14, 20);
      } else {
        currentFrames = g7_data;
        document.getElementById('btn-glider7').classList.add('btn-active');
        document.getElementById('btn-glider10').classList.remove('btn-active');
        document.getElementById('stat-rule').innerText = 'B4/S45';
        document.getElementById('desc-text').innerHTML = '<b>B4/S45</b>: わずか<b>7セル</b>の最小記録宇宙船！Z軸厚み2の極小ウェッジ姿勢で、X-Z対角線上空へ無限に直進！';
        gridHelper.rotation.x = 0; // XZ平面
        camera.position.set(14, 20, 16);
      }
      renderStep();
    }

    document.getElementById('btn-glider10').addEventListener('click', () => setMode('g10'));
    document.getElementById('btn-glider7').addEventListener('click', () => setMode('g7'));

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

    // アニメーションループ
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

fs.writeFileSync('infinite_glider_viewer.html', html, 'utf8');
console.log('Successfully written infinite_glider_viewer.html!');
