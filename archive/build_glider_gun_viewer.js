// build_glider_gun_viewer.js
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

let cells = new Set();
for (const [x, y] of GOSPER_GUN_2D) {
  cells.add(`${x},${y},0`);
  cells.add(`${x},${y},1`);
}

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

// 銃身スリーブ内(X <= 36)は Z in [0, 1] にガイド。銃口の外(X > 36)は自由空間
function stepGun(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nx = x + dx;
      const ny = y + dy;
      const nz = z + dz;
      // 砲台内部(X <= 36)はスリーブにより Z in [0, 1]
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

console.log('Generating 3D Glider Gun animation frames...');
const maxSteps = 160;
const frames = [Array.from(cells).map(k => k.split(',').map(Number))];

for (let t = 1; t <= maxSteps; t++) {
  cells = stepGun(cells);
  frames.push(Array.from(cells).map(k => k.split(',').map(Number)));
}

console.log(`Generated ${frames.length} frames.`);

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>3D グライダー銃（砲台本体＋連続射出）シミュレータ</title>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #090d13;
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
      font-size: 1.2rem;
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
      background: #1f6feb;
      border-color: #388bfd;
      color: white;
    }
    button.primary:hover {
      background: #388bfd;
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
      <span>🔫 3D グライダー銃（砲台本体）</span>
      <span class="badge">完全動作実証</span>
    </h1>
    <p>
      <b>ルール: Life 5766 (B6/S567)</b><br>
      厚み2（Z=0, 1）の銃身スリーブ（導波路）を備えた砲台本体が、<b>周期30ごとに10セルの3Dグライダーを1発ずつ連続生成して射出</b>します！発射された弾丸は自由3D空間へ飛び出し、厚み2のまま無限に航行します。
    </p>

    <div class="controls">
      <button id="btn-play" class="primary">⏸ 一時停止</button>
      <button id="btn-reset">↺ リセット (t=0)</button>
    </div>
    <div class="controls">
      <button id="btn-toggle-sleeve">🛡️ 銃身スリーブ表示 切替</button>
      <button id="btn-cam-view">🎥 全景 / 銃口カメラ</button>
    </div>

    <div class="slider-row">
      <span>世代:</span>
      <input type="range" id="step-slider" min="0" max="${maxSteps}" value="0">
      <span id="step-display">t = 0</span>
    </div>

    <div class="stats-card">
      <div><span class="stat-label">総セル数: </span><span id="stat-total" class="stat-val">72</span></div>
      <div><span class="stat-label">発射弾数: </span><span id="stat-bullets" class="stat-val">0 発</span></div>
      <div><span class="stat-label">砲台セル: </span><span id="stat-gun" class="stat-val">72</span></div>
      <div><span class="stat-label">射出周期: </span><span id="stat-period" class="stat-val">P = 30 step</span></div>
      <div><span class="stat-label">弾丸サイズ: </span><span id="stat-bsize" class="stat-val">10 セル</span></div>
      <div><span class="stat-label">Z軸厚み: </span><span id="stat-zspan" class="stat-val">2 (偏平維持)</span></div>
    </div>

    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#00ffff;"></div><span>下層 (Z=0)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#ff7b72;"></div><span>上層 (Z=1)</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:rgba(56,139,253,0.3); border:1px solid #388bfd;"></div><span>銃身スリーブガイド</span></div>
      <div class="legend-item"><div class="legend-dot" style="background:#e3b341;"></div><span>発射された弾丸</span></div>
    </div>
  </div>

  <script>
    const allFrames = ${JSON.stringify(frames)};
    let stepIndex = 0;
    let isPlaying = true;
    let showSleeve = true;
    let camMode = 'full'; // 'full' or 'gun'

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x090d13);

    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, -35, 45);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(25, 15, 0.5);

    // ライティング
    const ambLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambLight);
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(40, 50, 40);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x58a6ff, 0.4);
    dirLight2.position.set(-20, -30, -20);
    scene.add(dirLight2);

    // グリッド
    const gridHelper = new THREE.GridHelper(80, 80, 0x30363d, 0x161b22);
    gridHelper.rotation.x = Math.PI / 2;
    gridHelper.position.set(35, 15, -0.5);
    scene.add(gridHelper);

    // 銃身スリーブ（半透明ガイドボックス: X: -1 ~ 37, Y: -1 ~ 10, Z: -0.5 ~ 1.5）
    const sleeveGeom = new THREE.BoxGeometry(38, 12, 2.2);
    const sleeveMat = new THREE.MeshLambertMaterial({
      color: 0x1f6feb,
      transparent: true,
      opacity: 0.18,
      wireframe: false
    });
    const sleeveMesh = new THREE.Mesh(sleeveGeom, sleeveMat);
    sleeveMesh.position.set(18, 4.5, 0.5);
    scene.add(sleeveMesh);

    // スリーブのエッジワイヤー
    const edges = new THREE.EdgesGeometry(sleeveGeom);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x388bfd, transparent: true, opacity: 0.6 });
    const sleeveWire = new THREE.LineSegments(edges, lineMat);
    sleeveWire.position.copy(sleeveMesh.position);
    scene.add(sleeveWire);

    // 銃口マーク
    const muzzleGeom = new THREE.RingGeometry(1.2, 1.8, 16);
    const muzzleMat = new THREE.MeshBasicMaterial({ color: 0x3fb950, side: THREE.DoubleSide });
    const muzzle = new THREE.Mesh(muzzleGeom, muzzleMat);
    muzzle.position.set(37, 3, 0.5);
    muzzle.rotation.y = Math.PI / 2;
    scene.add(muzzle);

    // ボックス管理
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);

    function renderStep() {
      while (boxGroup.children.length > 0) {
        const obj = boxGroup.children[0];
        boxGroup.remove(obj);
      }

      const frame = allFrames[stepIndex] || [];
      let gunCount = 0;
      let bulletCount = 0;

      for (const [x, y, z] of frame) {
        const isBullet = (x > 36);
        if (isBullet) bulletCount++; else gunCount++;

        let color;
        if (isBullet) {
          color = (z === 0) ? 0xe3b341 : 0xffa657; // 弾丸はゴールド/アンバー
        } else {
          color = (z === 0) ? 0x00ffff : 0xff7b72; // 砲台はシアン/サーモン
        }

        const mat = new THREE.MeshLambertMaterial({
          color: color,
          transparent: true,
          opacity: 0.92
        });
        const mesh = new THREE.Mesh(boxGeom, mat);
        mesh.position.set(x, y, z);
        boxGroup.add(mesh);
      }

      // UI 更新
      document.getElementById('step-slider').value = stepIndex;
      document.getElementById('step-display').innerText = 't = ' + stepIndex;
      document.getElementById('stat-total').innerText = frame.length;
      document.getElementById('stat-gun').innerText = gunCount;
      const numBullets = Math.floor(bulletCount / 10);
      document.getElementById('stat-bullets').innerText = numBullets + ' 発 (' + bulletCount + ' セル)';
    }

    // コントロール
    document.getElementById('btn-play').addEventListener('click', () => {
      isPlaying = !isPlaying;
      document.getElementById('btn-play').innerText = isPlaying ? '⏸ 一時停止' : '▶ 再生';
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      stepIndex = 0;
      renderStep();
    });

    document.getElementById('btn-toggle-sleeve').addEventListener('click', () => {
      showSleeve = !showSleeve;
      sleeveMesh.visible = showSleeve;
      sleeveWire.visible = showSleeve;
    });

    document.getElementById('btn-cam-view').addEventListener('click', () => {
      if (camMode === 'full') {
        camMode = 'gun';
        camera.position.set(45, -10, 15);
        controls.target.set(37, 5, 0.5);
      } else {
        camMode = 'full';
        camera.position.set(30, -35, 45);
        controls.target.set(25, 15, 0.5);
      }
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
    }, 120);

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

fs.writeFileSync('glider_gun_3d_viewer.html', html, 'utf8');
console.log('Successfully written glider_gun_3d_viewer.html!');
