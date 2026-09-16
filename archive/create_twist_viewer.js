const fs = require('fs');
const path = require('path');

// Read verified_twist_b3_s145_t32.json
const rawData = fs.readFileSync(path.join(__dirname, 'verified_twist_b3_s145_t32.json'), 'utf-8');
const replicatorData = JSON.parse(rawData);

const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Chiral Twist Replicator - B3/S145 (t=0..32..64)</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Three.js and OrbitControls -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background-color: #060913;
      color: #e2e8f0;
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    }
    #canvas-container {
      width: 100vw;
      height: 100vh;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
    }
    .glass-panel {
      background: rgba(10, 15, 30, 0.88);
      backdrop-filter: blur(14px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 10px 35px 0 rgba(0, 0, 0, 0.55);
    }
    ::-webkit-scrollbar {
      width: 5px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(56, 189, 248, 0.5);
      border-radius: 3px;
    }
    .glow-cyan {
      box-shadow: 0 0 18px rgba(6, 182, 212, 0.6);
    }
  </style>
</head>
<body class="select-none">

  <!-- 3D Canvas -->
  <div id="canvas-container"></div>

  <!-- Header -->
  <header class="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
    <div class="glass-panel px-4 py-2.5 rounded-xl flex items-center space-x-3">
      <div class="w-3 h-3 rounded-full bg-cyan-400 animate-pulse glow-cyan"></div>
      <h1 class="text-base font-bold tracking-wider text-white flex items-center gap-2">
        <span>B3 / S145</span>
        <span class="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono border border-cyan-800/50">90°ツイスト自己複製子</span>
      </h1>
      <span class="text-xs text-slate-400 border-l border-slate-700 pl-3">カイラル偏光波 (t=0..32..64)</span>
    </div>

    <!-- Wide View Toggle -->
    <button id="btn-toggle-ui" class="glass-panel px-3.5 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:border-cyan-500/50 flex items-center space-x-2 transition shadow-lg active:scale-95" title="UIの表示/非表示を切り替え">
      <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
      <span id="label-ui-toggle">ワイド鑑賞</span>
    </button>
  </header>

  <!-- Right Info Panel -->
  <div id="panel-info" class="absolute right-4 top-4 w-84 glass-panel rounded-2xl p-4 z-10 pointer-events-auto space-y-3 transition-all duration-300">
    <div class="flex items-center justify-between pb-2 border-b border-slate-800">
      <h2 class="text-xs font-bold tracking-wider text-slate-300 uppercase">90°ツイスト複製ステータス</h2>
      <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/40">✨ 無限検証済</span>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex justify-between items-center">
        <span class="text-slate-400">Totalisticルール:</span>
        <span class="font-mono text-yellow-400 font-bold">B3 / S1,4,5</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">初期シード:</span>
        <span class="font-mono text-cyan-300 font-bold">6 セル (立体交差十字)</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">基本分裂周期:</span>
        <span class="font-mono text-emerald-400 font-bold">t = 2 (D = 4.0 units)</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">完全クローン集束:</span>
        <span class="font-mono text-cyan-400 font-bold">t = 2, 4, 8, 16, 32, 64</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">進行方向:</span>
        <span class="font-mono text-indigo-300 font-bold">±Z 軸方向 (ツイスト伝播)</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">現在ステップ:</span>
        <span id="info-current-step" class="font-mono text-white font-bold">t = 0</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">現在セル総数:</span>
        <span id="info-cell-count" class="font-mono text-cyan-400 font-bold">6</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">Z軸スパン幅:</span>
        <span id="info-z-span" class="font-mono text-slate-300 font-bold">2 units</span>
      </div>
    </div>

    <!-- Twist Mechanism Explanation -->
    <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1 text-slate-300">
      <div class="font-semibold text-cyan-300 flex items-center gap-1">
        <span>🔄</span><span>ツイスト偏光波の仕組み:</span>
      </div>
      <p class="text-slate-400 leading-relaxed">
        各ステップで先端が <b class="text-cyan-300">横バー(X)</b> と <b class="text-pink-400">縦バー(Y)</b> を90度交互に生み出しながら進み、<b class="text-emerald-400">t=2^n</b> の瞬間に両端に親と完全同型のペアが集束・分裂します。
      </p>
    </div>

    <!-- Actions -->
    <div class="pt-1 flex flex-col space-y-2">
      <button id="btn-load-t64" class="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-cyan-300 flex items-center justify-center space-x-2 transition border border-slate-700">
        <span>🚀</span><span>超深層 t=64 まで拡張 (スパン130)</span>
      </button>
      <button id="btn-export-json" class="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600/80 to-blue-600/80 hover:from-cyan-500 hover:to-blue-500 text-xs font-semibold text-white flex items-center justify-center space-x-2 transition shadow-md shadow-cyan-950 active:scale-95 border border-cyan-500/30">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        <span>この完全データをJSON保存</span>
      </button>
    </div>

    <!-- Color Legend -->
    <div class="pt-2 border-t border-slate-800 flex items-center justify-around text-[11px]">
      <div class="flex items-center space-x-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
        <span class="text-slate-300">横バー (X軸)</span>
      </div>
      <div class="flex items-center space-x-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
        <span class="text-slate-300">縦バー (Y軸)</span>
      </div>
      <div class="flex items-center space-x-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
        <span class="text-slate-300">中間セル</span>
      </div>
    </div>
  </div>

  <!-- Bottom Playback Control Bar -->
  <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
    <div class="glass-panel px-6 py-3.5 rounded-2xl flex items-center space-x-5 shadow-2xl">
      
      <!-- Step Back -->
      <button id="btn-step-prev" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition" title="1ステップ戻る">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>

      <!-- Play / Pause -->
      <button id="btn-play-pause" class="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition shadow-lg shadow-cyan-500/25 active:scale-95" title="再生 / 一時停止">
        <svg id="icon-play" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <!-- Step Forward -->
      <button id="btn-step-next" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition" title="1ステップ進む">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <!-- Step Indicator & Slider -->
      <div class="flex items-center space-x-3 w-72 sm:w-96">
        <span class="text-xs font-mono font-bold text-cyan-400 w-12 text-right">t = <span id="label-current-step">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="32" value="0" class="flex-1 accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none">
        <span class="text-xs font-mono text-slate-400 w-10">/<span id="label-max-step">32</span></span>
      </div>

      <!-- Speed Selector -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700 pl-4">
        <span class="text-xs text-slate-400">速度:</span>
        <select id="select-speed" class="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-cyan-300 font-mono focus:outline-none">
          <option value="600">0.5x</option>
          <option value="350" selected>1.0x</option>
          <option value="180">2.0x</option>
          <option value="80">4.0x</option>
        </select>
      </div>

      <!-- Reset Camera -->
      <button id="btn-reset-cam" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="カメラ視点をリセット">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      </button>

    </div>
  </div>

  <script>
    // Embedded Replicator Data
    let replicatorData = ${JSON.stringify(replicatorData)};
    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;
    let playSpeedMs = 350;

    // --- Three.js Setup ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.003);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 4000);
    camera.position.set(24, 18, 38);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x060913);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight1.position.set(40, 70, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf43f5e, 1.0);
    dirLight2.position.set(-40, -30, -50);
    scene.add(dirLight2);

    // Wide Grid
    const gridHelper = new THREE.GridHelper(160, 80, 0x1e293b, 0x0b1329);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // InstancedMesh
    const MAX_INSTANCES = 8000;
    const boxGeometry = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    const boxMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.4,
      vertexColors: true
    });
    const instancedMesh = new THREE.InstancedMesh(boxGeometry, boxMaterial, MAX_INSTANCES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const dummyMatrix = new THREE.Matrix4();
    const tempColor = new THREE.Color();

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // --- Render Logic ---
    function renderStep() {
      const history = replicatorData.history;
      if (!history || currentStep >= history.length) return;

      const points = history[currentStep] || [];
      const count = Math.min(points.length, MAX_INSTANCES);
      instancedMesh.count = count;

      // Calculate Bounding Box & Centroid
      let sx = 0, sy = 0, sz = 0;
      let minZ = Infinity, maxZ = -Infinity;
      for (const p of points) {
        sx += p[0]; sy += p[1]; sz += p[2];
        if (p[2] < minZ) minZ = p[2];
        if (p[2] > maxZ) maxZ = p[2];
      }
      const n = points.length || 1;
      const center = [sx / n, sy / n, sz / n];
      const zSpan = points.length > 0 ? (maxZ - minZ + 1) : 0;

      // Classify layers for twist visualization:
      // In each Z layer: if diff along X is greater -> Horizontal (Cyan)
      // if diff along Y is greater -> Vertical (Pink)
      const zLayerPoints = new Map();
      for (const p of points) {
        if (!zLayerPoints.has(p[2])) zLayerPoints.set(p[2], []);
        zLayerPoints.get(p[2]).push(p);
      }
      const zOrientation = new Map();
      for (const [z, pts] of zLayerPoints.entries()) {
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        pts.forEach(p => {
          if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
          if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
        });
        const dx = maxX - minX;
        const dy = maxY - minY;
        if (dx > dy) zOrientation.set(z, 'horizontal');
        else if (dy > dx) zOrientation.set(z, 'vertical');
        else zOrientation.set(z, 'neutral');
      }

      for (let i = 0; i < count; i++) {
        const p = points[i];
        dummyMatrix.setPosition(p[0] - center[0], p[1] - center[1], p[2] - center[2]);
        instancedMesh.setMatrixAt(i, dummyMatrix);

        const ori = zOrientation.get(p[2]);
        if (ori === 'horizontal') {
          tempColor.setHex(0x06b6d4); // Cyan for X-axis bar
        } else if (ori === 'vertical') {
          tempColor.setHex(0xf43f5e); // Pink/Rose for Y-axis bar
        } else {
          tempColor.setHex(0x818cf8); // Indigo
        }

        instancedMesh.setColorAt(i, tempColor);
      }

      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      // Update UI labels
      document.getElementById('label-current-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;
      document.getElementById('info-current-step').textContent = 't = ' + currentStep;
      document.getElementById('info-cell-count').textContent = points.length;
      document.getElementById('info-z-span').textContent = zSpan + ' units';

      // Auto Camera Scaling for wide Z expansion
      if (points.length > 0) {
        let maxDistSq = 0;
        for (const p of points) {
          const dx = p[0] - center[0];
          const dy = p[1] - center[1];
          const dz = p[2] - center[2];
          const dsq = dx*dx + dy*dy + dz*dz;
          if (dsq > maxDistSq) maxDistSq = dsq;
        }
        const radius = Math.sqrt(maxDistSq);
        const desiredCamDist = Math.max(22, radius * 2.3);
        const curDist = camera.position.length();
        if (curDist < desiredCamDist * 0.85) {
          camera.position.multiplyScalar(desiredCamDist / curDist);
          controls.update();
        }
      }
    }

    // --- Playback Controls ---
    function startPlayback() {
      if (isPlaying) return;
      isPlaying = true;
      document.getElementById('icon-play').classList.add('hidden');
      document.getElementById('icon-pause').classList.remove('hidden');

      playInterval = setInterval(() => {
        const maxStep = replicatorData.history.length - 1;
        if (currentStep < maxStep) {
          currentStep++;
        } else {
          currentStep = 0;
        }
        renderStep();
      }, playSpeedMs);
    }

    function pausePlayback() {
      isPlaying = false;
      document.getElementById('icon-play').classList.remove('hidden');
      document.getElementById('icon-pause').classList.add('hidden');
      if (playInterval) {
        clearInterval(playInterval);
        playInterval = null;
      }
    }

    document.getElementById('btn-play-pause').addEventListener('click', () => {
      if (isPlaying) pausePlayback();
      else startPlayback();
    });

    document.getElementById('btn-step-prev').addEventListener('click', () => {
      pausePlayback();
      if (currentStep > 0) {
        currentStep--;
        renderStep();
      }
    });

    document.getElementById('btn-step-next').addEventListener('click', () => {
      pausePlayback();
      const maxStep = replicatorData.history.length - 1;
      if (currentStep < maxStep) {
        currentStep++;
        renderStep();
      }
    });

    document.getElementById('slider-timeline').addEventListener('input', (e) => {
      pausePlayback();
      currentStep = parseInt(e.target.value);
      renderStep();
    });

    document.getElementById('select-speed').addEventListener('change', (e) => {
      playSpeedMs = parseInt(e.target.value);
      if (isPlaying) {
        pausePlayback();
        startPlayback();
      }
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      camera.position.set(24, 18, 38);
      controls.target.set(0, 0, 0);
      controls.update();
    });

    // UI Toggle
    let isWide = false;
    document.getElementById('btn-toggle-ui').addEventListener('click', () => {
      isWide = !isWide;
      const pInfo = document.getElementById('panel-info');
      const lbl = document.getElementById('label-ui-toggle');
      if (isWide) {
        pInfo.style.transform = 'translateX(120%)';
        lbl.textContent = 'UI復帰';
      } else {
        pInfo.style.transform = 'translateX(0)';
        lbl.textContent = 'ワイド鑑賞';
      }
    });

    // Load t=64 Version Dynamically
    document.getElementById('btn-load-t64').addEventListener('click', async () => {
      try {
        const btn = document.getElementById('btn-load-t64');
        btn.textContent = '⏳ t=64 データ読み込み中...';
        const res = await fetch('verified_twist_b3_s145_t64.json');
        if (!res.ok) throw new Error('File not found');
        const data64 = await res.json();
        replicatorData = data64;
        const maxStep = replicatorData.history.length - 1;
        document.getElementById('slider-timeline').max = maxStep;
        document.getElementById('label-max-step').textContent = maxStep;
        btn.innerHTML = '<span>✨</span><span>t=64 読み込み完了! (Span=130)</span>';
        renderStep();
      } catch (err) {
        console.error(err);
        alert('t=64データの読み込みに失敗しました。');
      }
    });

    // Export JSON
    document.getElementById('btn-export-json').addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(replicatorData, null, 2));
      const dlAnchor = document.createElement('a');
      dlAnchor.setAttribute("href", dataStr);
      dlAnchor.setAttribute("download", 'verified_twist_b3_s145.json');
      dlAnchor.click();
    });

    // Initial render
    renderStep();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'b3_s145_twist.html'), htmlContent, 'utf-8');
console.log('Successfully created b3_s145_twist.html!');
