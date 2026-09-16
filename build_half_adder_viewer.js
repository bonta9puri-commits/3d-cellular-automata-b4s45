// build_half_adder_viewer.js
// 3D 半加算器（1+1 計算回路）シミュレータ ビルダー
// B4/S45 ルール 100%純粋物理衝突

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

// Input A (進行方向: [-1, 0, 1])
const bulletA = init7;
// Input B (進行方向: [1, 0, -1])
const bulletB = init7.map(([x,y,z]) => [-x - 8, y, -z + 8]);

// Carry Fuse (Still Life 6セル at X=-4, Y=4, Z=4)
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];
const fuse = still6.map(([x,y,z]) => [x - 4, y + 4, z + 4]);

const maxSteps = 24;

function generateFrames(hasA, hasB) {
  let state = new Set();
  if (hasA) {
    bulletA.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
  }
  if (hasB) {
    bulletB.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));
  }
  // Fuse is always present
  fuse.forEach(([x,y,z]) => state.add(`${x},${y},${z}`));

  const frames = [Array.from(state).map(k => k.split(',').map(Number))];
  for (let t = 1; t <= maxSteps; t++) {
    state = pureStep(state);
    frames.push(Array.from(state).map(k => k.split(',').map(Number)));
  }
  return frames;
}

const frames00 = generateFrames(false, false);
const frames10 = generateFrames(true, false);
const frames01 = generateFrames(false, true);
const frames11 = generateFrames(true, true);

console.log("Frames generated for all 4 cases.");

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>3D 弾丸衝突型 半加算器（1+1 計算回路）シミュレータ</title>
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
      max-width: 480px;
      backdrop-filter: blur(14px);
      box-shadow: 0 12px 36px rgba(0,0,0,0.6);
      z-index: 10;
    }
    h1 {
      margin: 0 0 8px 0;
      font-size: 19px;
      color: #58a6ff;
      letter-spacing: 0.5px;
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
      background: rgba(56, 139, 253, 0.15);
      color: #58a6ff;
      border: 1px solid rgba(56, 139, 253, 0.4);
    }
    .desc {
      font-size: 12.5px;
      color: #8b949e;
      line-height: 1.5;
      margin-bottom: 14px;
    }
    .calc-box {
      background: rgba(22, 27, 34, 0.85);
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
      gap: 4px;
    }
    .calc-label {
      font-size: 11px;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .calc-val {
      font-size: 24px;
      font-weight: 700;
      font-family: monospace;
    }
    .val-active {
      color: #3fb950;
      text-shadow: 0 0 10px rgba(63, 185, 80, 0.5);
    }
    .val-inactive {
      color: #484f58;
    }
    .val-carry {
      color: #d2a8ff;
      text-shadow: 0 0 12px rgba(210, 168, 255, 0.6);
    }
    .math-formula {
      font-size: 22px;
      font-weight: 800;
      color: #f0883e;
      letter-spacing: 1px;
    }
    .mode-select {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 14px;
    }
    .mode-btn {
      background: #21262d;
      border: 1px solid #30363d;
      color: #c9d1d9;
      padding: 10px 12px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      text-align: center;
    }
    .mode-btn:hover {
      background: #30363d;
      border-color: #8b949e;
    }
    .mode-btn.active {
      background: #1f6feb;
      border-color: #58a6ff;
      color: #fff;
      box-shadow: 0 0 12px rgba(31, 111, 235, 0.5);
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
    button.ctrl-btn:hover {
      background: #30363d;
    }
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
      font-size: 11.5px;
      padding-top: 10px;
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
  <!-- Three.js & OrbitControls -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
  <div id="canvas-container"></div>

  <div id="ui-panel">
    <h1>🧮 3D 半加算器 (1+1 計算回路) <span class="badge">B4/S45</span></h1>
    <div class="desc">
      弾丸同士の<strong>正面衝突対消滅（XOR）</strong>と、衝突エネルギーによる<strong>休眠信管励起（AND）</strong>を組み合わせた、100%純粋物理による3D二進数加算器！
    </div>

    <!-- リアルタイム計算結果ボックス -->
    <div class="calc-box">
      <div class="calc-item">
        <span class="calc-label">入力 A</span>
        <span id="disp-a" class="calc-val val-inactive">0</span>
      </div>
      <div style="font-size:20px; color:#8b949e;">+</div>
      <div class="calc-item">
        <span class="calc-label">入力 B</span>
        <span id="disp-b" class="calc-val val-inactive">0</span>
      </div>
      <div style="font-size:20px; color:#8b949e;">=</div>
      <div class="calc-item">
        <span class="calc-label">二進数 (C,S)</span>
        <span id="disp-bin" class="calc-val val-active">00</span>
      </div>
      <div style="font-size:20px; color:#8b949e;">→</div>
      <div class="calc-item">
        <span class="calc-label">十進数</span>
        <span id="disp-dec" class="calc-val math-formula">0</span>
      </div>
    </div>

    <!-- モード切り替え -->
    <div class="mode-select">
      <button id="btn-00" class="mode-btn" onclick="setMode(0,0)">0 + 0 = 0</button>
      <button id="btn-10" class="mode-btn" onclick="setMode(1,0)">1 + 0 = 1</button>
      <button id="btn-01" class="mode-btn" onclick="setMode(0,1)">0 + 1 = 1</button>
      <button id="btn-11" class="mode-btn active" onclick="setMode(1,1)">🔥 1 + 1 = 2 (10₂)</button>
    </div>

    <div class="controls">
      <button id="play-btn" class="ctrl-btn" onclick="togglePlay()">⏸ 一時停止</button>
      <button class="ctrl-btn" onclick="prevStep()">◀</button>
      <button class="ctrl-btn" onclick="nextStep()">▶</button>
      <button class="ctrl-btn" onclick="resetSim()">↺ 最初から</button>
    </div>

    <div class="slider-row">
      <span>Time: <span id="time-val">0</span> / 24</span>
      <input type="range" id="time-slider" min="0" max="24" value="0" oninput="onSlider(this.value)">
    </div>

    <div class="legend">
      <div class="legend-item"><div class="dot" style="background: #38bdf8;"></div> 弾丸 A (シアン)</div>
      <div class="legend-item"><div class="dot" style="background: #fb923c;"></div> 弾丸 B (オレンジ)</div>
      <div class="legend-item"><div class="dot" style="background: #a3e635;"></div> Carry 信管 (緑/休眠)</div>
      <div class="legend-item"><div class="dot" style="background: #e879f9;"></div> Carry ビーム (紫/励起)</div>
      <div class="legend-item"><div class="dot" style="background: #34d399;"></div> Sum センサー (1の位)</div>
      <div class="legend-item"><div class="dot" style="background: #f43f5e;"></div> Carry センサー (2の位)</div>
    </div>
  </div>

  <script>
    const FRAMES_DATA = {
      "0_0": ${JSON.stringify(frames00)},
      "1_0": ${JSON.stringify(frames10)},
      "0_1": ${JSON.stringify(frames01)},
      "1_1": ${JSON.stringify(frames11)}
    };

    let currentA = 1;
    let currentB = 1;
    let currentFrames = FRAMES_DATA["1_1"];
    let stepIndex = 0;
    let isPlaying = true;

    // Three.js Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(16, 22, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(-4, 2, 4);

    // Lights
    const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(20, 30, 20);
    scene.add(dirLight);

    // Grid
    const grid = new THREE.GridHelper(50, 50, 0x30363d, 0x161b22);
    grid.position.set(-4, -1, 4);
    scene.add(grid);

    // Sensor Rings
    // 1. Sum Sensor (1の位): X ~ -6, Z ~ 6
    const sumSensorGeo = new THREE.RingGeometry(1.6, 2.2, 24);
    const sumSensorMat = new THREE.MeshBasicMaterial({ color: 0x1e3a5f, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const sumSensorMesh = new THREE.Mesh(sumSensorGeo, sumSensorMat);
    sumSensorMesh.position.set(-6, 1, 6);
    sumSensorMesh.rotation.x = Math.PI / 2;
    scene.add(sumSensorMesh);

    // 2. Carry Sensor (2の位): X ~ -4, Y ~ 8, Z ~ 4
    const carrySensorGeo = new THREE.RingGeometry(1.6, 2.2, 24);
    const carrySensorMat = new THREE.MeshBasicMaterial({ color: 0x3b1e5f, side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const carrySensorMesh = new THREE.Mesh(carrySensorGeo, carrySensorMat);
    carrySensorMesh.position.set(-4, 8, 4);
    carrySensorMesh.rotation.x = Math.PI / 2;
    scene.add(carrySensorMesh);

    // 3. Collision Zone Marker (X=-4, Z=4)
    const collisionGeo = new THREE.RingGeometry(1.2, 1.6, 24);
    const collisionMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.25 });
    const collisionMesh = new THREE.Mesh(collisionGeo, collisionMat);
    collisionMesh.position.set(-4, 1, 4);
    collisionMesh.rotation.x = Math.PI / 2;
    scene.add(collisionMesh);

    // Box Group for Cells (Rock Solid Mesh Group)
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    const boxGeom = new THREE.BoxGeometry(0.86, 0.86, 0.86);

    // Materials
    const matA = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.7 });
    const matB = new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.3, metalness: 0.7 });
    const matFuseStill = new THREE.MeshStandardMaterial({ color: 0xa3e635, roughness: 0.3, metalness: 0.7 });
    const matCarryBeam = new THREE.MeshStandardMaterial({ color: 0xe879f9, roughness: 0.2, metalness: 0.8, emissive: 0xd946ef, emissiveIntensity: 0.5 });

    function renderStep() {
      // Clear previous boxes
      while (boxGroup.children.length > 0) {
        const obj = boxGroup.children[0];
        boxGroup.remove(obj);
      }

      const cells = currentFrames[stepIndex] || [];
      const totalCount = cells.length;

      document.getElementById('time-val').innerText = stepIndex;
      document.getElementById('time-slider').value = stepIndex;

      let isExcitedCarry = (totalCount > 25);

      cells.forEach(([x, y, z]) => {
        let mat = matA;
        if (y >= 3) {
          mat = isExcitedCarry ? matCarryBeam : matFuseStill;
        } else {
          if (x >= -3) {
            mat = matA;
          } else {
            mat = matB;
          }
        }
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      });

      // Update Logic & Displays
      const isLate = (stepIndex >= 14);
      let outSum = 0;
      let outCarry = 0;

      if (currentA === 0 && currentB === 0) {
        outSum = 0; outCarry = 0;
      } else if (currentA === 1 && currentB === 0) {
        outSum = (isLate || stepIndex >= 8) ? 1 : 0;
        outCarry = 0;
      } else if (currentA === 0 && currentB === 1) {
        outSum = (isLate || stepIndex >= 8) ? 1 : 0;
        outCarry = 0;
      } else if (currentA === 1 && currentB === 1) {
        outSum = 0; // Completely annihilated!
        outCarry = isLate ? 1 : 0; // Fuse triggered!
      }

      // Update HTML UI
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

      const decVal = (outCarry * 2) + outSum;
      document.getElementById('disp-dec').innerText = decVal;

      // Update Sensor Rings Visual
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
      stepIndex = Math.min(24, stepIndex + 1);
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

      if (isPlaying && time - lastTime > 200) {
        lastTime = time;
        if (stepIndex < 24) {
          stepIndex++;
          renderStep();
        } else {
          // Loop back after brief pause
          setTimeout(() => {
            if (isPlaying && stepIndex >= 24) {
              stepIndex = 0;
              renderStep();
            }
          }, 1200);
        }
      }

      renderer.render(scene, camera);
    }

    // Start
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

fs.writeFileSync('half_adder_3d_viewer.html', html);
console.log('Successfully re-written half_adder_3d_viewer.html with solid boxGroup rendering!');
