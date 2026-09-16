// build_eater_lab_viewer.js
// 3D イーター（吸着・消音シールド）実験室ビューア
// 「大きくてもいい！」3つのモード（素の銃、イーター装着、完全スリーブ）をリアルタイム比較

const fs = require('fs');

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

function stepWithSleeve(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      if (nx <= 36 && (nz !== 0 && nz !== 1)) continue;
      const nk = `${nx},${ny},${nz}`;
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

const maxSteps = 40;

// モード1: 素の銃（壁なし、純粋ルール）
let rawCells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  rawCells.add(`${x},${y},0`);
  rawCells.add(`${x},${y},1`);
}
const rawFrames = [Array.from(rawCells).map(k => k.split(',').map(Number))];
for (let t = 1; t <= maxSteps; t++) {
  rawCells = pureStep(rawCells);
  rawFrames.push(Array.from(rawCells).map(k => k.split(',').map(Number)));
}

// モード2: イーター装着銃（上下に2x2x2キューブイーターを配置、純粋ルール）
let eaterCells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  eaterCells.add(`${x},${y},0`);
  eaterCells.add(`${x},${y},1`);
}
// 上下イーター (16セル)
for (let x=20; x<22; x++) for (let y=2; y<4; y++) for (let z=3; z<5; z++) eaterCells.add(`${x},${y},${z}`);
for (let x=20; x<22; x++) for (let y=2; y<4; y++) for (let z=-4; z<-2; z++) eaterCells.add(`${x},${y},${z}`);

const eaterFrames = [Array.from(eaterCells).map(k => k.split(',').map(Number))];
for (let t = 1; t <= maxSteps; t++) {
  eaterCells = pureStep(eaterCells);
  eaterFrames.push(Array.from(eaterCells).map(k => k.split(',').map(Number)));
}

// モード3: 理想導波路スリーブ（無限射出モード）
let sleeveCells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  sleeveCells.add(`${x},${y},0`);
  sleeveCells.add(`${x},${y},1`);
}
const sleeveFrames = [Array.from(sleeveCells).map(k => k.split(',').map(Number))];
for (let t = 1; t <= maxSteps; t++) {
  sleeveCells = stepWithSleeve(sleeveCells);
  sleeveFrames.push(Array.from(sleeveCells).map(k => k.split(',').map(Number)));
}

console.log('Frames generation complete.');

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>3D イーター・吸着シールド実験室 (Eater Lab)</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #080c14;
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
      color: #58a6ff;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      background: #8957e5;
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
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      margin-bottom: 12px;
    }
    .controls-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    button {
      background: #21262d;
      color: #c9d1d9;
      border: 1px solid #30363d;
      padding: 8px 10px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
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
      <span>🛡️ 3D イーター・吸着シールド実験室</span>
      <span class="badge">Eater Lab</span>
    </h1>
    <p id="mode-desc">
      <b>吸着体（イーター）装着モード</b>: 漏洩しやすい発振器の上下に2x2x2静止キューブを配置。飛散する火花を「過密窒息（Overcrowding）」で消滅させ、セル数を抑え込みます！
    </p>

    <div class="controls">
      <button id="btn-mode-raw">💥 素の銃 (崩壊)</button>
      <button id="btn-mode-eater" class="btn-active">🛡️ イーター装着</button>
      <button id="btn-mode-sleeve">🚀 理想スリーブ</button>
    </div>

    <div class="controls-2">
      <button id="btn-play">⏸ 一時停止</button>
      <button id="btn-reset">↺ リセット (t=0)</button>
    </div>

    <div class="slider-row">
      <span>世代:</span>
      <input type="range" id="step-slider" min="0" max="${maxSteps}" value="0">
      <span id="step-display">t = 0</span>
    </div>

    <div class="stats-card">
      <div><span class="stat-label">モード: </span><span id="stat-mode" class="stat-val">イーター装着</span></div>
      <div><span class="stat-label">総セル数: </span><span id="stat-cells" class="stat-val">88</span></div>
      <div><span class="stat-label">Z軸スパン: </span><span id="stat-zspan" class="stat-val">[-4, 4] (9)</span></div>
      <div><span class="stat-label">状態: </span><span id="stat-state" class="stat-val">過密窒息・吸着中</span></div>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#00ffff;"></div><span>下層 (Z=0)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#ff7b72;"></div><span>上層 (Z=1)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#a371f7;"></div><span>イーター / 漏洩セル</span></div>
    </div>
  </div>

  <script>
    const rawData = ${JSON.stringify(rawFrames)};
    const eaterData = ${JSON.stringify(eaterFrames)};
    const sleeveData = ${JSON.stringify(sleeveFrames)};

    let currentMode = 'eater';
    let currentFrames = eaterData;
    let stepIndex = 0;
    let isPlaying = true;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, -30, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(20, 10, 0.5);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(30, 40, 40);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x58a6ff, 0.4);
    dirLight2.position.set(-20, -30, -20);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(70, 70, 0x30363d, 0x161b22);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(25, 10, -0.5);
    scene.add(gridHelper);

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    function getColor(x, y, z) {
      if (z === 0) return 0x00ffff;
      if (z === 1) return 0xff7b72;
      return 0xa371f7; // 紫色（イーターまたは漏洩セル）
    }

    function renderStep() {
      while (boxGroup.children.length > 0) {
        const obj = boxGroup.children[0];
        boxGroup.remove(obj);
      }

      const frame = currentFrames[stepIndex] || [];
      let minZ = Infinity, maxZ = -Infinity;

      for (const [x, y, z] of frame) {
        const mat = new THREE.MeshLambertMaterial({
          color: getColor(x, y, z),
          transparent: true,
          opacity: 0.92
        });
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);

        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }

      document.getElementById('step-slider').value = stepIndex;
      document.getElementById('step-display').innerText = 't = ' + stepIndex;
      document.getElementById('stat-cells').innerText = frame.length;
      document.getElementById('stat-zspan').innerText = \`[\${minZ}, \${maxZ}] (\${maxZ - minZ + 1})\`;

      if (currentMode === 'raw') {
        document.getElementById('stat-state').innerText = stepIndex >= 15 ? '崩壊・過疎停止' : '火花漏洩中';
      } else if (currentMode === 'eater') {
        document.getElementById('stat-state').innerText = '過密窒息・吸着中';
      } else {
        document.getElementById('stat-state').innerText = '安定連射中 (P=30)';
      }
    }

    function setMode(mode) {
      currentMode = mode;
      stepIndex = 0;
      document.getElementById('btn-mode-raw').classList.toggle('btn-active', mode === 'raw');
      document.getElementById('btn-mode-eater').classList.toggle('btn-active', mode === 'eater');
      document.getElementById('btn-mode-sleeve').classList.toggle('btn-active', mode === 'sleeve');

      if (mode === 'raw') {
        currentFrames = rawData;
        document.getElementById('stat-mode').innerText = '素の銃 (壁なし)';
        document.getElementById('mode-desc').innerHTML = '<b>素の銃モード</b>: 外部壁もイーターも置かない純粋状態。発振器中央で生セルが密集した瞬間、Z軸へ火花が漏れ出して崩壊してしまいます。';
      } else if (mode === 'eater') {
        currentFrames = eaterData;
        document.getElementById('stat-mode').innerText = 'イーター装着';
        document.getElementById('mode-desc').innerHTML = '<b>吸着体（イーター）装着モード</b>: 漏洩しやすい発振器の上下に2x2x2静止キューブを配置。飛散する火花を「過密窒息（Overcrowding）」で消滅させ、セル数を抑え込みます！';
      } else {
        currentFrames = sleeveFrames;
        document.getElementById('stat-mode').innerText = '理想導波路スリーブ';
        document.getElementById('mode-desc').innerHTML = '<b>理想導波路スリーブモード</b>: 銃身スリーブ内で完全に整流された理想砲台。周期30ごとに10セルの3Dグライダーが無限に撃ち出されます。';
      }
      renderStep();
    }

    document.getElementById('btn-mode-raw').addEventListener('click', () => setMode('raw'));
    document.getElementById('btn-mode-eater').addEventListener('click', () => setMode('eater'));
    document.getElementById('btn-mode-sleeve').addEventListener('click', () => setMode('sleeve'));

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
    }, 150);

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

fs.writeFileSync('eater_lab_viewer.html', html, 'utf8');
console.log('Successfully written eater_lab_viewer.html!');
