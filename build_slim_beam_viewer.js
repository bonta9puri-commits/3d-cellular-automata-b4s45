const fs = require('fs');

const beamData = fs.readFileSync('slim_beam_data.json', 'utf8').trim();

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B3/S3467 3x3 超極細ビーム 3Dビューア (5^2以内・非爆発パルス)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #060913; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(12, 18, 36, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
    .glow-emerald { box-shadow: 0 0 25px rgba(16, 185, 129, 0.5); }
    .glow-cyan { box-shadow: 0 0 25px rgba(6, 182, 212, 0.5); }
  </style>
</head>
<body class="select-none">
  <div id="canvas-container"></div>

  <!-- Header -->
  <header class="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-4">
      <div class="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-pulse glow-emerald"></div>
      <div>
        <h1 class="text-base font-black tracking-wider text-white flex items-center gap-2.5">
          <span>3x3 ULTRA-SLIM BEAM</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono font-bold">Rule: B3 / S3467</span>
        </h1>
        <div class="text-xs text-slate-300 mt-0.5 font-medium">
          断面わずか <span class="text-emerald-300 font-bold font-mono">3x3 (9セル面積)</span>・セル数 <span class="text-cyan-300 font-bold font-mono">8〜16セル</span> の超コンパクト非爆発弾！
        </div>
      </div>
    </div>
  </header>

  <!-- Status Overlay -->
  <div class="absolute top-4 right-4 z-10 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-6 text-sm">
      <div>
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在ステップ</div>
        <div class="text-2xl font-black text-emerald-400 font-mono">t = <span id="stat-step" class="text-white">0</span> <span class="text-xs text-slate-400 font-normal">/ 16</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">総セル数</div>
        <div class="text-2xl font-black text-cyan-300 font-mono"><span id="stat-cells">4</span> <span class="text-xs text-slate-400 font-normal">(目標 &le;25)</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">断面フットプリント</div>
        <div class="text-2xl font-black text-amber-400 font-mono"><span id="stat-cross">3 x 3</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5 min-w-[220px]">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">状態解説</div>
        <div id="stat-desc" class="text-xs font-medium text-emerald-300 mt-0.5 leading-relaxed">初期 4セルシード</div>
      </div>
    </div>
  </div>

  <!-- Left: Mode Selector Panel -->
  <div class="absolute top-24 left-4 z-10 pointer-events-auto w-80">
    <div class="glass-panel p-4 rounded-2xl space-y-3 shadow-2xl">
      <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-700/60 pb-2">
        <span>🔬 鑑賞モードの選択</span>
        <span class="text-[10px] text-emerald-400 font-mono">&le; 25 cells</span>
      </div>

      <div class="space-y-2">
        <button id="btn-mode-free" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-100 shadow-md shadow-emerald-950/50">
          <div class="font-bold flex items-center justify-between">
            <span>🚀 モード1: 3x3 極細自由直進</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900 font-mono">Pure Beam</span>
          </div>
          <div class="text-[11px] text-slate-300">
            初期4セルから断面3x3を完全維持しながら、8&harr;16セルで呼吸しながら直進します！
          </div>
        </button>

        <button id="btn-mode-obstacle" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300">
          <div class="font-bold flex items-center justify-between">
            <span>🛡️ モード2: 障害物との接触 (非爆発)</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">Catalyst</span>
          </div>
          <div class="text-[11px] text-slate-400">
            途中に障害物があっても大爆発せず、綺麗にスッと吸収・通過して8セルに戻ります。
          </div>
        </button>

        <button id="btn-mode-collision" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300">
          <div class="font-bold flex items-center justify-between">
            <span>💥 モード3: 直交2ビームの正面衝突</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">Collision</span>
          </div>
          <div class="text-[11px] text-slate-400">
            XビームとYビームが中央で激突！干渉時の花火と物理挙動を観察します。
          </div>
        </button>
      </div>
    </div>
  </div>

  <!-- Bottom Timeline & Controls Container -->
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center space-y-3">
    
    <!-- Info & Camera Bar -->
    <div class="glass-panel px-4 py-2 rounded-xl flex items-center space-x-4 shadow-xl text-xs">
      <div class="flex items-center space-x-2">
        <div class="w-2.5 h-2.5 rounded-sm bg-emerald-400 shadow-[0_0_8px_#10b981]"></div>
        <span class="text-slate-300 font-medium">進行先端 (エメラルド)</span>
      </div>
      <div class="flex items-center space-x-2 border-l border-slate-700 pl-3">
        <div class="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#06b6d4]"></div>
        <span class="text-slate-300 font-medium">コア脈動 (シアン)</span>
      </div>
      <div class="flex items-center space-x-2 border-l border-slate-700 pl-3">
        <div class="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
        <span class="text-slate-300 font-medium">触媒障害物 (アンバー)</span>
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

      <button id="btn-play-pause" class="w-11 h-11 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition shadow-lg shadow-emerald-500/30 font-bold">
        <svg id="icon-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button id="btn-step-next" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ進む">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <div class="flex items-center space-x-3 w-80">
        <span class="text-xs font-mono text-emerald-400 font-bold min-w-[36px]">t=<span id="label-step" class="text-white">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="16" value="0" step="1" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500">
        <span class="text-xs font-mono text-slate-400 min-w-[32px]">/16</span>
      </div>

      <!-- Quick Jump Buttons -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700/80 pl-3">
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-mono font-medium transition" data-step="0">t=0(4セル)</button>
        <button class="btn-jump px-2 py-1 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs rounded font-mono font-bold transition" data-step="2">t=2(8セル)</button>
        <button class="btn-jump px-2 py-1 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs rounded font-mono font-bold transition" data-step="4">t=4(8セル)</button>
        <button class="btn-jump px-2 py-1 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs rounded font-mono font-bold transition" data-step="8">t=8(8セル)</button>
        <button class="btn-jump px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 text-xs rounded font-mono font-bold transition" data-step="16">t=16(長大直進)</button>
      </div>
    </div>
  </div>

  <script>
    const DATA = ${beamData};

    let currentMode = 'free'; // 'free', 'obstacle', 'collision'
    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;

    // Three.js Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(22, 18, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(1, 1, 1);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(20, 35, 25);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    grid.position.y = -0.55;
    scene.add(grid);

    // Cube Meshes (Instanced)
    const cubeGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    const cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.2
    });
    const MAX_CUBES = 600;
    const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, MAX_CUBES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    function getCurrentHistory() {
      if (currentMode === 'free') return DATA.freeBeam;
      if (currentMode === 'obstacle') return DATA.withObstacle;
      return DATA.collision;
    }

    function renderStep() {
      const history = getCurrentHistory();
      const pts = history[currentStep] || [];

      document.getElementById('label-step').textContent = currentStep;
      document.getElementById('stat-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;
      document.getElementById('stat-cells').textContent = pts.length;

      let minX = Infinity, maxX = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      let minZ = Infinity, maxZ = -Infinity;
      for (const p of pts) {
        if (p[0] < minX) minX = p[0]; if (p[0] > maxX) maxX = p[0];
        if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1];
        if (p[2] < minZ) minZ = p[2]; if (p[2] > maxZ) maxZ = p[2];
      }

      const spanX = maxX >= minX ? maxX - minX + 1 : 0;
      const spanY = maxY >= minY ? maxY - minY + 1 : 0;
      const spanZ = maxZ >= minZ ? maxZ - minZ + 1 : 0;

      if (currentMode === 'free' || currentMode === 'obstacle') {
        document.getElementById('stat-cross').textContent = spanX + ' x ' + spanZ + ' (断面)';
      } else {
        document.getElementById('stat-cross').textContent = spanX + ' x ' + spanY;
      }

      let desc = '';
      if (currentMode === 'free') {
        if (currentStep === 0) desc = 't=0: 初期親シード(たったの4セル！)';
        else if (currentStep % 2 === 0) desc = 't=' + currentStep + ': 収縮パルス (8セル)。断面3x3を完全維持して前進中！';
        else desc = 't=' + currentStep + ': 膨張パルス (16セル)。極小のままレーザーのように直進！';
      } else if (currentMode === 'obstacle') {
        if (currentStep === 0) desc = 't=0: ビーム親シード(4セル)と触媒ピン(金アンバー1セル)';
        else if (currentStep === 2) desc = '⚡t=2: 触媒ピンと接触！';
        else if (currentStep <= 4) desc = 't=' + currentStep + ': ピンを吸収通過中。セル数は最大でも32セルで非爆発！';
        else desc = '★t=' + currentStep + ': 完全に通り抜け！セル数は元の8セルにスッと復元！';
      } else {
        desc = 't=' + currentStep + ': 直交2ビーム衝突。中央で相互干渉が起きています (計' + pts.length + 'セル)';
      }
      document.getElementById('stat-desc').textContent = desc;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // Map Y to Three.js Z, and Z to Three.js Y
        dummy.position.set(p[0], p[2], -p[1]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        if (currentMode === 'obstacle' && currentStep === 0 && p[0] === 1 && p[1] === 5 && p[2] === 1) {
          color.setHex(0xf59e0b); // Obstacle gold
        } else if (currentStep % 2 === 0) {
          color.setHex(0x10b981); // Emerald pulse
        } else {
          color.setHex(0x06b6d4); // Cyan pulse
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
      playInterval = setInterval(() => {
        if (currentStep < 16) currentStep++;
        else currentStep = 0;
        renderStep();
      }, 400);
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
      if (currentStep < 16) { currentStep++; renderStep(); }
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

    // Mode Selector Buttons
    const btnFree = document.getElementById('btn-mode-free');
    const btnObstacle = document.getElementById('btn-mode-obstacle');
    const btnCollision = document.getElementById('btn-mode-collision');

    function updateModeButtons() {
      const activeClass = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-emerald-950/80 border border-emerald-500/60 text-emerald-100 shadow-md shadow-emerald-950/50';
      const inactiveClass = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300';
      btnFree.className = currentMode === 'free' ? activeClass : inactiveClass;
      btnObstacle.className = currentMode === 'obstacle' ? activeClass : inactiveClass;
      btnCollision.className = currentMode === 'collision' ? activeClass : inactiveClass;
    }

    btnFree.addEventListener('click', () => {
      currentMode = 'free';
      currentStep = 0;
      pausePlayback();
      updateModeButtons();
      camera.position.set(22, 18, 26);
      controls.target.set(1, 1, 1);
      renderStep();
    });

    btnObstacle.addEventListener('click', () => {
      currentMode = 'obstacle';
      currentStep = 0;
      pausePlayback();
      updateModeButtons();
      camera.position.set(20, 16, 24);
      controls.target.set(1, 1, 3);
      renderStep();
    });

    btnCollision.addEventListener('click', () => {
      currentMode = 'collision';
      currentStep = 0;
      pausePlayback();
      updateModeButtons();
      camera.position.set(26, 26, 30);
      controls.target.set(0, 1, 0);
      renderStep();
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      camera.position.set(22, 18, 26);
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

fs.writeFileSync('slim_beam_viewer.html', html, 'utf8');
console.log('Successfully written slim_beam_viewer.html! File size:', html.length);
