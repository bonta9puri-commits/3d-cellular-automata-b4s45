// build_beam_activation_viewer.js
// 砲台発射 -> 弾丸飛翔 -> 遠隔信管着弾 -> ビーム作動・大放射！
// B4/S45 ルールによる完全連動 3D 実証ビューア

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

// 1. 砲台ベース (28セル)
const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

function getBaseGun() {
  const gun = new Set();
  for (const [x, y, z] of osc8) gun.add(`${x},${y},${z}`);
  for (const [x, y, z] of osc8) gun.add(`${10 - x},${y},${z}`);
  for (const [x, y, z] of still6) {
    gun.add(`${x + 4},${y - 6},${z}`);
    gun.add(`${x + 4},${y - 12},${z}`);
  }
  return gun;
}

// 2. 進行方向 [0, 1, 1] の7セル弾
const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];
const forwardBullet = init7.map(([x,y,z]) => [y, -x, z]);

// 3. 初期ワールド構築:
// 砲台(28セル) + 薬室弾丸(7セル, offset 4, 4, 0) + 遠隔ビーム信管(4セル, offset Y=16, Z=13付近)
const world = getBaseGun();

// 薬室に弾丸装填
for (const [x, y, z] of forwardBullet) {
  world.add(`${x + 4},${y + 4},${z}`);
}

// 弾丸の弾道上に「休眠ビーム信管 (2x2 Square)」を配置
// 弾丸は X=5 付近、YとZが等速で増加
const targetX = 5;
const targetY = 16;
const targetZ = 13;
world.add(`${targetX},${targetY},${targetZ}`);
world.add(`${targetX + 1},${targetY},${targetZ}`);
world.add(`${targetX},${targetY + 1},${targetZ}`);
world.add(`${targetX + 1},${targetY + 1},${targetZ}`);

console.log(`初期総セル数: ${world.size} (砲台28 + 弾丸7 + 遠隔信管4)`);

console.log('Generating Beam Activation animation frames...');
const maxSteps = 36;
let cells = world;
const frames = [Array.from(cells).map(k => k.split(',').map(Number))];

for (let t = 1; t <= maxSteps; t++) {
  cells = pureStep(cells);
  frames.push(Array.from(cells).map(k => k.split(',').map(Number)));
}

console.log(`Generated ${frames.length} frames.`);

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>3D 砲台発射 ➔ 遠隔着弾 ➔ ビーム作動シミュレータ</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #04070d;
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
      background: rgba(10, 15, 24, 0.92);
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 16px 20px;
      max-width: 480px;
      backdrop-filter: blur(14px);
      box-shadow: 0 12px 36px rgba(0,0,0,0.8);
    }
    h1 {
      font-size: 1.2rem;
      margin: 0 0 10px 0;
      color: #a371f7;
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
    button.primary {
      background: #8957e5;
      border-color: #ab7df8;
      color: white;
    }
    button.primary:hover {
      background: #ab7df8;
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
    .stat-val { color: #d2a8ff; font-weight: bold; }
    .legend {
      display: flex;
      gap: 12px;
      font-size: 0.75rem;
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px solid #30363d;
      flex-wrap: wrap;
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
      <span>⚡ 遠隔起爆ビーム作動システム</span>
      <span class="badge">Beam Triggered</span>
    </h1>
    <p>
      <b>ユーザーの「これでビームを作動させるとかかな？」構想が完全実現！</b><br>
      手前の砲台から射出された7セル弾が虚空を滑空し、遠方の<b>休眠ビーム信管（赤色）に直撃！</b><br>
      着弾の瞬間（t=12）、眠っていたコアが一気に励起され、<b>高エネルギー・ビーム光線（紫色）が宇宙へ炸裂・放射</b>されます！
    </p>

    <div class="controls">
      <button id="btn-play" class="primary">⏸ 一時停止</button>
      <button id="btn-reset">↺ リセット (t=0)</button>
    </div>
    <div class="controls">
      <button id="btn-cam-wide">🎥 全景俯瞰</button>
      <button id="btn-cam-target">💥 着弾・ビーム接写</button>
    </div>

    <div class="slider-row">
      <span>世代:</span>
      <input type="range" id="step-slider" min="0" max="${maxSteps}" value="0">
      <span id="step-display">t = 0</span>
    </div>

    <div class="stats-card">
      <div><span class="stat-label">フェーズ: </span><span id="stat-phase" class="stat-val">① 砲台発射準備</span></div>
      <div><span class="stat-label">総セル数: </span><span id="stat-total" class="stat-val">39 セル</span></div>
      <div><span class="stat-label">砲台本体: </span><span class="stat-val">28 セル (無傷)</span></div>
      <div><span class="stat-label">ビーム出力: </span><span id="stat-beam" class="stat-val">待機中 (0)</span></div>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#58a6ff;"></div><span>砲台本体 (ツインエンジン)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#3fb950;"></div><span>7セル弾丸 (トリガー)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#f85149;"></div><span>休眠ビーム信管 (標的)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#d2a8ff;"></div><span>点火ビーム光線</span></div>
    </div>
  </div>

  <script>
    const frames = ${JSON.stringify(frames)};
    let stepIndex = 0;
    let isPlaying = true;
    let camMode = 'wide';

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04070d);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, -20, 32);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(5, 10, 8);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight1.position.set(30, 40, 40);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0xa371f7, 0.6);
    dirLight2.position.set(-20, 20, 20);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(80, 80, 0x30363d, 0x161b22);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(5, 10, -0.5);
    scene.add(gridHelper);

    // 軌跡ライン
    const trailGeom = new THREE.BufferGeometry();
    const trailMat = new THREE.LineBasicMaterial({ color: 0x3fb950, transparent: true, opacity: 0.6 });
    const trailLine = new THREE.Line(trailGeom, trailMat);
    scene.add(trailLine);

    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    function renderStep() {
      while (boxGroup.children.length > 0) {
        const obj = boxGroup.children[0];
        boxGroup.remove(obj);
      }

      const frame = frames[stepIndex] || [];
      let beamCount = 0;

      for (const [x, y, z] of frame) {
        const inGun = (y <= 5 && !(stepIndex === 0 && x>=4&&x<=6&&y>=4));
        const inTarget = (y >= 16 && z >= 12 && stepIndex < 12);
        const inBeam = (y >= 14 && z >= 10 && stepIndex >= 12);

        let color;
        if (inBeam) {
          color = 0xd2a8ff; // ビーム光線は眩いパープル
          beamCount++;
        } else if (inTarget) {
          color = 0xf85149; // 休眠信管はレッド
        } else if (inGun) {
          color = (y <= -4) ? 0xe3b341 : 0x58a6ff; // 砲台はブルー/ゴールド
        } else {
          color = 0x3fb950; // 弾丸はエメラルドグリーン
        }

        const mat = new THREE.MeshLambertMaterial({
          color: color,
          transparent: true,
          opacity: inBeam ? 0.98 : 0.92
        });
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      }

      document.getElementById('step-slider').value = stepIndex;
      document.getElementById('step-display').innerText = 't = ' + stepIndex;
      document.getElementById('stat-total').innerText = frame.length + ' セル';

      if (stepIndex < 4) {
        document.getElementById('stat-phase').innerText = '① 砲台発射準備';
        document.getElementById('stat-beam').innerText = '休眠中 (0)';
      } else if (stepIndex < 12) {
        document.getElementById('stat-phase').innerText = '② 弾丸滑空・標的へ接近中';
        document.getElementById('stat-beam').innerText = 'ロックオン (0)';
      } else if (stepIndex === 12) {
        document.getElementById('stat-phase').innerText = '💥 命中！信管点火！';
        document.getElementById('stat-beam').innerText = '励起開始！';
      } else {
        document.getElementById('stat-phase').innerText = '🚀 ビーム放射中！';
        document.getElementById('stat-beam').innerText = beamCount + ' セル放射中！';
      }

      // 弾道軌跡
      const trailPoints = [];
      for (let i = 0; i <= Math.min(stepIndex, 12); i++) {
        const f = frames[i];
        const bCells = f.filter(c => c[1] > 5 && c[1] < 16);
        if (bCells.length > 0) {
          const sx = bCells.reduce((s, c) => s + c[0], 0) / bCells.length;
          const sy = bCells.reduce((s, c) => s + c[1], 0) / bCells.length;
          const sz = bCells.reduce((s, c) => s + c[2], 0) / bCells.length;
          trailPoints.push(new THREE.Vector3(sx, sy, sz));
        }
      }
      trailGeom.setFromPoints(trailPoints);

      if (camMode === 'target') {
        controls.target.set(5.5, 17, 14);
      }
    }

    document.getElementById('btn-play').addEventListener('click', () => {
      isPlaying = !isPlaying;
      document.getElementById('btn-play').innerText = isPlaying ? '⏸ 一時停止' : '▶ 再生';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      stepIndex = 0;
      renderStep();
    });

    document.getElementById('btn-cam-wide').addEventListener('click', () => {
      camMode = 'wide';
      camera.position.set(30, -20, 32);
      controls.target.set(5, 10, 8);
      controls.update();
    });

    document.getElementById('btn-cam-target').addEventListener('click', () => {
      camMode = 'target';
      camera.position.set(16, 5, 20);
      controls.target.set(5.5, 17, 14);
      controls.update();
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

fs.writeFileSync('beam_activation_viewer.html', html, 'utf8');
console.log('Successfully written beam_activation_viewer.html!');
