const fs = require('fs');

const bulletData = fs.readFileSync('bullet_prototype_data.json', 'utf8').trim();

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Bullet Lab - 2Dグライダーの2乗（直積）立体弾丸プロトタイプ</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #060914; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(10, 16, 34, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
    .glow-cyan { box-shadow: 0 0 25px rgba(6, 182, 212, 0.5); }
    .glow-purple { box-shadow: 0 0 25px rgba(168, 85, 247, 0.5); }
  </style>
</head>
<body class="select-none">
  <div id="canvas-container"></div>

  <!-- Header -->
  <header class="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-4">
      <div class="w-3.5 h-3.5 rounded-full bg-cyan-400 animate-pulse glow-cyan"></div>
      <div>
        <h1 class="text-base font-black tracking-wider text-white flex items-center gap-2.5">
          <span>3D BULLET DEVELOPMENT LAB</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold">2D Glider Squared</span>
        </h1>
        <div class="text-xs text-slate-300 mt-0.5 font-medium">
          2Dグライダー(5セル)の直積（2乗）から生まれた <span class="text-cyan-300 font-bold font-mono">9〜10セルの極小立体弾丸</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Status Overlay -->
  <div class="absolute top-4 right-4 z-10 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-6 text-sm">
      <div>
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在ステップ</div>
        <div class="text-2xl font-black text-cyan-400 font-mono">t = <span id="stat-step" class="text-white">0</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在セル数</div>
        <div class="text-2xl font-black text-purple-300 font-mono"><span id="stat-cells">9</span> <span class="text-xs text-slate-400 font-normal">(&le;25セル)</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">重心座標</div>
        <div class="text-sm font-bold text-emerald-400 font-mono"><span id="stat-centroid">[0, 0, 0]</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5 min-w-[220px]">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">弾丸ステータス</div>
        <div id="stat-desc" class="text-xs font-medium text-amber-300 mt-0.5 leading-relaxed">初期発射形状</div>
      </div>
    </div>
  </div>

  <!-- Left: Model & Rule Selector Panel -->
  <div class="absolute top-24 left-4 z-10 pointer-events-auto w-84">
    <div class="glass-panel p-4 rounded-2xl space-y-3 shadow-2xl">
      <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-700/60 pb-2">
        <span>🚀 2Dの2乗 立体弾モデル</span>
        <span class="text-[10px] text-cyan-400 font-mono">3D Models</span>
      </div>

      <!-- Model Tabs -->
      <div class="space-y-2">
        <button id="btn-m1" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-cyan-950/80 border border-cyan-500/60 text-cyan-100 shadow-md shadow-cyan-950/50">
          <div class="font-bold flex items-center justify-between">
            <span>🛸 モデル1: 十字翼型ミサイル (Cruciform)</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900 font-mono">9 Cells</span>
          </div>
          <div class="text-[11px] text-slate-300">
            X-Y平面の2Dグライダーと、Y-Z平面の2Dグライダーを直交交差結合！ミサイル型の十字尾翼を持ちます。
          </div>
        </button>

        <button id="btn-m2" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300">
          <div class="font-bold flex items-center justify-between">
            <span>🔺 モデル2: テンソル積デルタ翼 (Tensor Delta)</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">9 Cells</span>
          </div>
          <div class="text-[11px] text-slate-400">
            2Dグライダーの点同士の直積演算から生まれた、ステルス三角錐のような幾何形状！
          </div>
        </button>

        <button id="btn-m3" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300">
          <div class="font-bold flex items-center justify-between">
            <span>🌀 モデル3: 90°ツイスト結合弾 (Chiral Tandem)</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">10 Cells</span>
          </div>
          <div class="text-[11px] text-slate-400">
            前半分と後半分が90度ねじれながら結合したカイラル弾丸！
          </div>
        </button>
      </div>

      <!-- Rule Selection -->
      <div class="border-t border-slate-700/60 pt-3 space-y-2">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">テスト空間ルール</div>
        <div class="grid grid-cols-2 gap-1.5 text-xs font-mono" id="rule-list">
          <button class="btn-rule py-1.5 px-2 rounded-lg bg-cyan-900/60 border border-cyan-500/50 text-cyan-200 text-center" data-rule="Life 5766 (B6/S567)">Life 5766 (安定)</button>
          <button class="btn-rule py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-center" data-rule="Life 4555 (B5/S45)">Life 4555 (前進)</button>
          <button class="btn-rule py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-center" data-rule="B35/S4 (C3 Screw)">B35/S4 (スクリュー)</button>
          <button class="btn-rule py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-center" data-rule="B3/S23 (Conway 3D)">B3/S23 (Conway)</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Timeline & Controls Container -->
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center space-y-3">
    
    <!-- Camera & Action Bar -->
    <div class="glass-panel px-4 py-2 rounded-xl flex items-center space-x-4 shadow-xl text-xs">
      <div class="flex items-center space-x-2">
        <div class="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></div>
        <span class="text-slate-300 font-medium">水平X-Y翼 (シアン)</span>
      </div>
      <div class="flex items-center space-x-2 border-l border-slate-700 pl-3">
        <div class="w-2.5 h-2.5 rounded-sm bg-purple-400 shadow-[0_0_8px_#c084fc]"></div>
        <span class="text-slate-300 font-medium">垂直Y-Z翼 (パープル)</span>
      </div>
      <div class="flex items-center space-x-2 border-l border-slate-700 pl-3">
        <div class="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
        <span class="text-slate-300 font-medium">交差コア (ゴールド)</span>
      </div>

      <div class="border-l border-slate-700 pl-3">
        <button id="btn-reset-cam" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center gap-1 font-medium">
          <span>🎥</span><span>視点リセット</span>
        </button>
      </div>
    </div>

    <!-- Main Playback & Timeline Bar -->
    <div class="glass-panel px-6 py-3.5 rounded-2xl flex items-center space-x-5 shadow-2xl">
      <button id="btn-step-prev" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ戻る">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>

      <button id="btn-play-pause" class="w-11 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition shadow-lg shadow-cyan-500/30 font-bold">
        <svg id="icon-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button id="btn-step-next" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ進む">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <div class="flex items-center space-x-3 w-80">
        <span class="text-xs font-mono text-cyan-400 font-bold min-w-[36px]">t=<span id="label-step" class="text-white">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="8" value="0" step="1" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500">
        <span class="text-xs font-mono text-slate-400 min-w-[32px]">/ <span id="label-max-step">8</span></span>
      </div>

      <!-- Quick Jump Buttons -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700/80 pl-3">
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-mono font-medium transition" data-step="0">t=0(弾丸形状)</button>
        <button class="btn-jump px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 text-xs rounded font-mono font-bold transition" data-step="2">t=2(推進)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950/80 border border-purple-500/40 hover:bg-purple-900 text-purple-300 text-xs rounded font-mono font-bold transition" data-step="4">t=4(結晶化)</button>
      </div>
    </div>
  </div>

  <script>
    const DATA = ${bulletData};

    let currentModel = 'model1';
    let currentRule = 'Life 5766 (B6/S567)';
    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;

    // Three.js Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(10, 8, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(1, 1, 1);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(15, 25, 20);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(20, 20, 0x1e293b, 0x0f172a);
    grid.position.y = -0.55;
    scene.add(grid);

    // Cube Meshes (Instanced)
    const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.25
    });
    const MAX_CUBES = 500;
    const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, MAX_CUBES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    function getHistory() {
      const mSims = DATA.simulations[currentModel] || {};
      return mSims[currentRule] || [];
    }

    function renderStep() {
      const history = getHistory();
      const maxSteps = Math.max(0, history.length - 1);
      document.getElementById('slider-timeline').max = maxSteps;
      document.getElementById('label-max-step').textContent = maxSteps;

      if (currentStep > maxSteps) currentStep = maxSteps;

      const pts = history[currentStep] || [];

      document.getElementById('label-step').textContent = currentStep;
      document.getElementById('stat-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;
      document.getElementById('stat-cells').textContent = pts.length;

      let cx = 0, cy = 0, cz = 0;
      if (pts.length > 0) {
        for (const p of pts) { cx += p[0]; cy += p[1]; cz += p[2]; }
        cx /= pts.length; cy /= pts.length; cz /= pts.length;
        document.getElementById('stat-centroid').textContent = '[' + cx.toFixed(2) + ', ' + cy.toFixed(2) + ', ' + cz.toFixed(2) + ']';
      } else {
        document.getElementById('stat-centroid').textContent = '[消滅]';
      }

      let desc = '';
      if (currentStep === 0) {
        desc = DATA[currentModel].name + ' 発射初期形状 (' + pts.length + 'セル)';
      } else if (currentRule.includes('5766')) {
        if (currentStep >= 3) desc = '★t=' + currentStep + ': 7セルで完全静止結晶化！(銃の土台ブロックとして機能)';
        else desc = 't=' + currentStep + ': 推進中 (重心が前進しています)';
      } else if (currentRule.includes('4555')) {
        desc = 't=' + currentStep + ': Y軸方向へ自律前進中！(推進速度あり)';
      } else {
        desc = 't=' + currentStep + ': 活性変化中 (' + pts.length + 'セル)';
      }
      document.getElementById('stat-desc').textContent = desc;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        dummy.position.set(p[0], p[2], -p[1]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        if (currentStep === 0) {
          if (p[0] === 1 && p[2] === 1) {
            color.setHex(0xf59e0b); // 交差コア (ゴールド)
          } else if (p[2] === 1) {
            color.setHex(0x06b6d4); // 水平翼 (シアン)
          } else {
            color.setHex(0xc084fc); // 垂直翼 (パープル)
          }
        } else {
          color.setHex(0x38bdf8);
        }
        instancedMesh.setColorAt(i, color);
      }

      instancedMesh.count = pts.length;
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    }

    // Playback
    function startPlayback() {
      if (isPlaying) return;
      isPlaying = true;
      document.getElementById('icon-play').classList.add('hidden');
      document.getElementById('icon-pause').classList.remove('hidden');
      const maxSteps = Math.max(0, getHistory().length - 1);
      playInterval = setInterval(() => {
        if (currentStep < maxSteps) currentStep++;
        else currentStep = 0;
        renderStep();
      }, 500);
    }

    function pausePlayback() {
      isPlaying = false;
      document.getElementById('icon-play').classList.remove('hidden');
      document.getElementById('icon-pause').classList.add('hidden');
      if (playInterval) clearInterval(playInterval);
    }

    document.getElementById('btn-play-pause').addEventListener('click', () => {
      if (isPlaying) pausePlayback();
      else startPlayback();
    });

    document.getElementById('btn-step-prev').addEventListener('click', () => {
      pausePlayback();
      if (currentStep > 0) { currentStep--; renderStep(); }
    });
    document.getElementById('btn-step-next').addEventListener('click', () => {
      pausePlayback();
      const maxSteps = Math.max(0, getHistory().length - 1);
      if (currentStep < maxSteps) { currentStep++; renderStep(); }
    });

    document.getElementById('slider-timeline').addEventListener('input', (e) => {
      pausePlayback();
      currentStep = parseInt(e.target.value);
      renderStep();
    });

    document.querySelectorAll('.btn-jump').forEach(btn => {
      btn.addEventListener('click', () => {
        pausePlayback();
        currentStep = parseInt(btn.getAttribute('data-step'));
        renderStep();
      });
    });

    // Model Selector
    const btnM1 = document.getElementById('btn-m1');
    const btnM2 = document.getElementById('btn-m2');
    const btnM3 = document.getElementById('btn-m3');

    function updateModelButtons() {
      const active = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-cyan-950/80 border border-cyan-500/60 text-cyan-100 shadow-md shadow-cyan-950/50';
      const inactive = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300';
      btnM1.className = currentModel === 'model1' ? active : inactive;
      btnM2.className = currentModel === 'model2' ? active : inactive;
      btnM3.className = currentModel === 'model3' ? active : inactive;
    }

    btnM1.addEventListener('click', () => {
      currentModel = 'model1';
      currentStep = 0;
      pausePlayback();
      updateModelButtons();
      renderStep();
    });
    btnM2.addEventListener('click', () => {
      currentModel = 'model2';
      currentStep = 0;
      pausePlayback();
      updateModelButtons();
      renderStep();
    });
    btnM3.addEventListener('click', () => {
      currentModel = 'model3';
      currentStep = 0;
      pausePlayback();
      updateModelButtons();
      renderStep();
    });

    // Rule Buttons
    document.querySelectorAll('.btn-rule').forEach(btn => {
      btn.addEventListener('click', () => {
        currentRule = btn.getAttribute('data-rule');
        currentStep = 0;
        pausePlayback();
        document.querySelectorAll('.btn-rule').forEach(b => {
          b.className = 'btn-rule py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-center';
        });
        btn.className = 'btn-rule py-1.5 px-2 rounded-lg bg-cyan-900/60 border border-cyan-500/50 text-cyan-200 text-center';
        renderStep();
      });
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      camera.position.set(10, 8, 12);
      controls.target.set(1, 1, 1);
      controls.update();
    });

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

fs.writeFileSync('bullet_lab_viewer.html', html, 'utf8');
console.log('Successfully written bullet_lab_viewer.html! File size:', html.length);
