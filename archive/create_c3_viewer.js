const fs = require('fs');
const path = require('path');

const c3Data = JSON.parse(fs.readFileSync(path.join(__dirname, 'verified_c3_b35_s4.json'), 'utf-8'));

const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D C3 Diagonal Replicator - B35/S4 (Disp=[2,2,2])</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #080c14; color: #e2e8f0; font-family: system-ui, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(12, 18, 32, 0.88); backdrop-filter: blur(14px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 10px 35px 0 rgba(0,0,0,0.55); }
    .glow-amber { box-shadow: 0 0 18px rgba(245, 158, 11, 0.6); }
  </style>
</head>
<body class="select-none">
  <div id="canvas-container"></div>

  <header class="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
    <div class="glass-panel px-4 py-2.5 rounded-xl flex items-center space-x-3">
      <div class="w-3 h-3 rounded-full bg-amber-400 animate-pulse glow-amber"></div>
      <h1 class="text-base font-bold tracking-wider text-white flex items-center gap-2">
        <span>B35 / S4</span>
        <span class="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono border border-amber-800/50">3軸C3対角レプリケーター</span>
      </h1>
      <span class="text-xs text-slate-400 border-l border-slate-700 pl-3">X=Y=Z 巡回不変シード</span>
    </div>
  </header>

  <div class="absolute right-4 top-4 w-84 glass-panel rounded-2xl p-4 z-10 pointer-events-auto space-y-3">
    <div class="flex items-center justify-between pb-2 border-b border-slate-800">
      <h2 class="text-xs font-bold tracking-wider text-slate-300 uppercase">3軸完全等方分裂</h2>
      <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/40">Step 2 分裂</span>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex justify-between items-center">
        <span class="text-slate-400">Totalisticルール:</span>
        <span class="font-mono text-yellow-400 font-bold">B3,5 / S4</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">初期シード:</span>
        <span class="font-mono text-amber-300 font-bold">9 セル (C3 巡回対称立体)</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">変位ベクトル:</span>
        <span class="font-mono text-emerald-400 font-bold">[dx=2, dy=2, dz=2]</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">重心間距離:</span>
        <span class="font-mono text-cyan-300 font-bold">3.46 units (2√3)</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">現在ステップ:</span>
        <span id="info-current-step" class="font-mono text-white font-bold">t = 0</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-slate-400">現在セル総数:</span>
        <span id="info-cell-count" class="font-mono text-amber-400 font-bold">9</span>
      </div>
    </div>

    <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] space-y-1 text-slate-300">
      <div class="font-semibold text-amber-300 flex items-center gap-1">
        <span>📐</span><span>3軸同時展開の特徴:</span>
      </div>
      <p class="text-slate-400 leading-relaxed">
        X軸・Y軸・Z軸のどれか1つではなく、<b class="text-amber-300">3つの軸すべてに均等に (2, 2, 2) の立体対角線方向</b> へ射出され、親と完全合同な2つのクローンに分かれます。
      </p>
    </div>
  </div>

  <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
    <div class="glass-panel px-6 py-3.5 rounded-2xl flex items-center space-x-5 shadow-2xl">
      <button id="btn-step-prev" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>
      <button id="btn-play-pause" class="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg">
        <svg id="icon-play" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>
      <button id="btn-step-next" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>
      <div class="flex items-center space-x-3 w-64">
        <span class="text-xs font-mono font-bold text-amber-400 w-12 text-right">t = <span id="label-current-step">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="8" value="0" class="flex-1 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg appearance-none">
        <span class="text-xs font-mono text-slate-400 w-6">/8</span>
      </div>
      <button id="btn-reset-cam" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      </button>
    </div>
  </div>

  <script>
    const replicatorData = ${JSON.stringify(c3Data)};
    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;

    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080c14, 0.005);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(16, 14, 18);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x080c14);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dLight = new THREE.DirectionalLight(0xfbbf24, 1.3);
    dLight.position.set(30, 40, 30);
    scene.add(dLight);

    const grid = new THREE.GridHelper(60, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -6;
    scene.add(grid);

    // Vector line along main diagonal (1,1,1)
    const lineMat = new THREE.LineDashedMaterial({ color: 0x38bdf8, dashSize: 0.4, gapSize: 0.2 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-6,-6,-6), new THREE.Vector3(6,6,6)]);
    const diagLine = new THREE.Line(lineGeo, lineMat);
    diagLine.computeLineDistances();
    scene.add(diagLine);

    const MAX_INSTANCES = 3000;
    const boxGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    const boxMat = new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0.3, vertexColors: true });
    const instMesh = new THREE.InstancedMesh(boxGeo, boxMat, MAX_INSTANCES);
    scene.add(instMesh);

    const dummy = new THREE.Matrix4();
    const tempCol = new THREE.Color();

    function renderStep() {
      const history = replicatorData.history;
      const points = history[currentStep] || [];
      instMesh.count = Math.min(points.length, MAX_INSTANCES);

      let sx=0, sy=0, sz=0;
      points.forEach(p => { sx+=p[0]; sy+=p[1]; sz+=p[2]; });
      const n = points.length || 1;
      const c = [sx/n, sy/n, sz/n];

      for (let i=0; i<instMesh.count; i++) {
        const p = points[i];
        dummy.setPosition(p[0]-c[0], p[1]-c[1], p[2]-c[2]);
        instMesh.setMatrixAt(i, dummy);

        if (currentStep === 2) {
          // Cluster A (Cyan) vs Cluster B (Amber)
          if (p[0] <= 0 && p[1] <= 0 && p[2] <= 0) tempCol.setHex(0x06b6d4);
          else tempCol.setHex(0xf59e0b);
        } else if (currentStep === 0) {
          tempCol.setHex(0xa855f7); // Purple for C0
        } else {
          tempCol.setHex(0xe2e8f0);
        }
        instMesh.setColorAt(i, tempCol);
      }
      instMesh.instanceMatrix.needsUpdate = true;
      if (instMesh.instanceColor) instMesh.instanceColor.needsUpdate = true;

      document.getElementById('label-current-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;
      document.getElementById('info-current-step').textContent = 't = ' + currentStep;
      document.getElementById('info-cell-count').textContent = points.length;
    }

    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    function play() {
      isPlaying = true;
      document.getElementById('icon-play').classList.add('hidden');
      document.getElementById('icon-pause').classList.remove('hidden');
      playInterval = setInterval(() => {
        if (currentStep < 8) currentStep++; else currentStep = 0;
        renderStep();
      }, 500);
    }
    function pause() {
      isPlaying = false;
      document.getElementById('icon-play').classList.remove('hidden');
      document.getElementById('icon-pause').classList.add('hidden');
      clearInterval(playInterval);
    }

    document.getElementById('btn-play-pause').addEventListener('click', () => { if (isPlaying) pause(); else play(); });
    document.getElementById('btn-step-prev').addEventListener('click', () => { pause(); if (currentStep>0) { currentStep--; renderStep(); } });
    document.getElementById('btn-step-next').addEventListener('click', () => { pause(); if (currentStep<8) { currentStep++; renderStep(); } });
    document.getElementById('slider-timeline').addEventListener('input', (e) => { pause(); currentStep=parseInt(e.target.value); renderStep(); });
    document.getElementById('btn-reset-cam').addEventListener('click', () => { camera.position.set(16,14,18); controls.target.set(0,0,0); controls.update(); });

    renderStep();
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'c3_b35_s4.html'), htmlContent, 'utf-8');
console.log('Created c3_b35_s4.html!');
