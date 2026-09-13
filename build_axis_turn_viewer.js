const fs = require('fs');

const axisData = fs.readFileSync('axis_turn_data.json', 'utf8').trim();

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Axis Redirection Lab - 3次元 軸変換・直角偏向実験室</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #060914; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(12, 18, 36, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
    .glow-cyan { box-shadow: 0 0 25px rgba(6, 182, 212, 0.5); }
    .glow-rose { box-shadow: 0 0 25px rgba(244, 63, 94, 0.5); }
  </style>
</head>
<body class="select-none">
  <div id="canvas-container"></div>

  <!-- Header -->
  <header class="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-4">
      <div class="w-3.5 h-3.5 rounded-full bg-rose-500 animate-pulse glow-rose"></div>
      <div>
        <h1 class="text-base font-black tracking-wider text-white flex items-center gap-2.5">
          <span>3D AXIS REDIRECTION LAB</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono font-bold">3次元 軸変換実験室</span>
        </h1>
        <div class="text-xs text-slate-300 mt-0.5 font-medium">
          2Dでは不可能な3次元現象：<span class="text-rose-400 font-semibold">進行軸を X軸（水平）から Z軸（真上）へ直角に切り替える！</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Status Overlay -->
  <div class="absolute top-4 right-4 z-10 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-6 text-sm">
      <div>
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在ステップ</div>
        <div class="text-2xl font-black text-rose-400 font-mono">t = <span id="stat-step" class="text-white">0</span> <span class="text-xs text-slate-400 font-normal">/ 12</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">総セル数</div>
        <div id="stat-cells" class="text-2xl font-black text-cyan-300 font-mono">0</div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">垂直スパン (Z軸)</div>
        <div id="stat-zspan" class="text-2xl font-black text-emerald-400 font-mono">0</div>
      </div>
      <div class="border-l border-slate-700/80 pl-5 min-w-[240px]">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在の現象</div>
        <div id="stat-desc" class="text-xs font-medium text-amber-300 mt-0.5 leading-relaxed">初期状態</div>
      </div>
    </div>
  </div>

  <!-- Left: Experiment Selection Panel -->
  <div class="absolute top-24 left-4 z-10 pointer-events-auto w-80">
    <div class="glass-panel p-4 rounded-2xl space-y-3 shadow-2xl">
      <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-700/60 pb-2">
        <span>🔬 実験テーマの選択</span>
        <span class="text-[10px] text-rose-400 font-mono">Vector Turn</span>
      </div>

      <div class="space-y-2">
        <button id="btn-exp-deflect" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-rose-950/80 border border-rose-500/60 text-rose-100 shadow-md shadow-rose-950/50">
          <div class="font-bold flex items-center justify-between">
            <span>🎯 実験1: 45度ミラーによる X→Z 軸偏向</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-900 font-mono">Collision</span>
          </div>
          <div class="text-[11px] text-slate-300">
            横（X軸）に進む波が、45度傾斜した障害物に当たって真上（Z軸）へ直角に跳ね上がります！
          </div>
        </button>

        <button id="btn-exp-c3" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300">
          <div class="font-bold flex items-center justify-between">
            <span>🌀 実験2: 自律3軸スクリュー (X→Y→Z)</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">Screw</span>
          </div>
          <div class="text-[11px] text-slate-400">
            障害物がなくても、自分自身の内部カイラリティで進行軸を順番に切り替えながら対角線を登ります。
          </div>
        </button>
      </div>

      <!-- Barrier Toggle for Exp 1 -->
      <div id="panel-barrier-toggle" class="border-t border-slate-700/60 pt-3 space-y-2">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ミラー障害物の有無</div>
        <button id="btn-toggle-barrier" class="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow">
          <span>🛡️</span><span id="lbl-barrier">障害物: あり (Z軸へ偏向)</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Bottom Timeline & Controls Container -->
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center space-y-3">
    
    <!-- Action / Helper Bar -->
    <div class="glass-panel px-4 py-2 rounded-xl flex items-center space-x-3 shadow-xl text-xs">
      <div class="flex items-center space-x-2">
        <div class="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></div>
        <span class="text-slate-300">元波 (X軸進行)</span>
      </div>
      <div class="flex items-center space-x-2 border-l border-slate-700 pl-3">
        <div class="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
        <span class="text-slate-300">45度反射ミラー</span>
      </div>
      <div class="flex items-center space-x-2 border-l border-slate-700 pl-3">
        <div class="w-2.5 h-2.5 rounded-sm bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
        <span class="text-slate-300">Z軸へ偏向した波</span>
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

      <button id="btn-play-pause" class="w-11 h-11 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 flex items-center justify-center transition shadow-lg shadow-rose-500/30 font-bold">
        <svg id="icon-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button id="btn-step-next" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ進む">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <div class="flex items-center space-x-3 w-80">
        <span class="text-xs font-mono text-rose-400 font-bold min-w-[36px]">t=<span id="label-step" class="text-white">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="12" value="0" step="1" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500">
        <span class="text-xs font-mono text-slate-400 min-w-[32px]">/12</span>
      </div>

      <!-- Quick Jump Buttons -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700/80 pl-3">
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-mono font-medium transition" data-step="0">t=0(発射)</button>
        <button class="btn-jump px-2 py-1 bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900 text-amber-300 text-xs rounded font-mono font-bold transition" data-step="3">⚡t=3(衝突)</button>
        <button class="btn-jump px-2 py-1 bg-rose-950/80 border border-rose-500/40 hover:bg-rose-900 text-rose-300 text-xs rounded font-mono font-bold transition" data-step="8">🚀t=8(Z軸偏向)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950/80 border border-purple-500/40 hover:bg-purple-900 text-purple-300 text-xs rounded font-mono font-bold transition" data-step="12">★t=12(垂直展開)</button>
      </div>
    </div>
  </div>

  <script>
    const DATA = ${axisData};

    let currentExp = 'deflect'; // 'deflect' or 'c3'
    let hasBarrier = true;
    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;

    // Three.js Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(18, 16, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(2, 2, 1);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(25, 40, 30);
    scene.add(dirLight);

    // Grid (Z=0 floor)
    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -0.55;
    scene.add(grid);

    // Cube Meshes (Instanced)
    const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
    const cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.2
    });
    const MAX_CUBES = 800;
    const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, MAX_CUBES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    // 3D Directional Arrows (Helper)
    const arrowGroup = new THREE.Group();
    // X Axis arrow (Red)
    const arrowX = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(-4, 0, 1), 6, 0xef4444, 1.2, 0.6);
    arrowGroup.add(arrowX);
    // Z Axis arrow (Blue, pointing UP)
    const arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(4, 0, 1), 6, 0x38bdf8, 1.2, 0.6);
    arrowGroup.add(arrowZ);
    scene.add(arrowGroup);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    function getCurrentHistory() {
      if (currentExp === 'deflect') {
        return hasBarrier ? DATA.exp1_deflected : DATA.exp1_free;
      } else {
        return DATA.exp2_c3_screw;
      }
    }

    function renderStep() {
      const history = getCurrentHistory();
      const pts = history[currentStep] || [];

      document.getElementById('label-step').textContent = currentStep;
      document.getElementById('stat-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;
      document.getElementById('stat-cells').textContent = pts.length;

      let minZ = Infinity, maxZ = -Infinity;
      let minX = Infinity, maxX = -Infinity;
      for (const p of pts) {
        if (p[2] < minZ) minZ = p[2];
        if (p[2] > maxZ) maxZ = p[2];
        if (p[0] < minX) minX = p[0];
        if (p[0] > maxX) maxX = p[0];
      }
      const spanZ = maxZ >= minZ ? maxZ - minZ : 0;
      document.getElementById('stat-zspan').textContent = spanZ;

      // Status desc
      let desc = '';
      if (currentExp === 'deflect') {
        if (hasBarrier) {
          if (currentStep === 0) desc = 't=0: 初期親波(シアン)と45度反射ミラー(アンバー)が配置';
          else if (currentStep <= 2) desc = 't=' + currentStep + ': 親波が水平(+X軸)に向かってミラーへ接近';
          else if (currentStep <= 4) desc = '⚡t=' + currentStep + ': 45度ミラーと激しく衝突！X方向の進行が急停止';
          else if (currentStep <= 7) desc = '🚀t=' + currentStep + ': 衝突の反動でエネルギーが真上(+Z軸)へ直角に噴射！';
          else desc = '★t=' + currentStep + ': 完全に進行軸が切り替わり、Z軸(上下)へ垂直展開中 (スパンZ=' + spanZ + ')';
        } else {
          desc = 't=' + currentStep + ': 障害物なし。波は水平(X軸)に沿って左右へ広がり続けます';
        }
      } else {
        desc = 't=' + currentStep + ': B35/S4 C3対角自己複製子。X→Y→Zと自律的に軸を回しながら登頂中！';
      }
      document.getElementById('stat-desc').textContent = desc;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // Coordinate mapping: Three.js Y is UP (CA Z coordinate!)
        dummy.position.set(p[0], p[2], -p[1]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        if (currentExp === 'deflect' && hasBarrier) {
          if (currentStep === 0 && p[0] >= 3 && p[2] >= 2) {
            color.setHex(0xf59e0b); // Mirror obstacle
          } else if (p[2] >= 3) {
            color.setHex(0xf43f5e); // Deflected upward to Z
          } else if (p[0] >= 3) {
            color.setHex(0xf59e0b); // Impact zone
          } else {
            color.setHex(0x06b6d4); // Base wave
          }
        } else if (currentExp === 'c3') {
          // Rainbow by height
          const ratio = (p[2] - minZ) / (spanZ || 1);
          color.setHSL(0.1 + 0.7 * ratio, 0.9, 0.6);
        } else {
          color.setHex(0x06b6d4);
        }
        instancedMesh.setColorAt(i, color);
      }

      instancedMesh.count = pts.length;
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;
    }

    // Controls
    function startPlayback() {
      if (isPlaying) return;
      isPlaying = true;
      document.getElementById('icon-play').classList.add('hidden');
      document.getElementById('icon-pause').classList.remove('hidden');
      playInterval = setInterval(() => {
        if (currentStep < 12) currentStep++;
        else currentStep = 0;
        renderStep();
      }, 450);
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
      if (currentStep < 12) { currentStep++; renderStep(); }
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

    // Experiment Selectors
    const btnExpDeflect = document.getElementById('btn-exp-deflect');
    const btnExpC3 = document.getElementById('btn-exp-c3');
    const panelBarrier = document.getElementById('panel-barrier-toggle');

    btnExpDeflect.addEventListener('click', () => {
      currentExp = 'deflect';
      currentStep = 0;
      pausePlayback();
      btnExpDeflect.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-rose-950/80 border border-rose-500/60 text-rose-100 shadow-md shadow-rose-950/50';
      btnExpC3.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300';
      panelBarrier.classList.remove('hidden');
      arrowGroup.visible = true;
      camera.position.set(18, 16, 22);
      controls.target.set(2, 2, 1);
      renderStep();
    });

    btnExpC3.addEventListener('click', () => {
      currentExp = 'c3';
      currentStep = 0;
      pausePlayback();
      btnExpC3.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-cyan-950/80 border border-cyan-500/60 text-cyan-100 shadow-md shadow-cyan-950/50';
      btnExpDeflect.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300';
      panelBarrier.classList.add('hidden');
      arrowGroup.visible = false;
      camera.position.set(16, 18, 20);
      controls.target.set(2, 2, 2);
      renderStep();
    });

    // Barrier Toggle
    const btnToggleBarrier = document.getElementById('btn-toggle-barrier');
    const lblBarrier = document.getElementById('lbl-barrier');
    btnToggleBarrier.addEventListener('click', () => {
      hasBarrier = !hasBarrier;
      if (hasBarrier) {
        btnToggleBarrier.className = 'w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow';
        lblBarrier.textContent = '障害物: あり (Z軸へ偏向)';
      } else {
        btnToggleBarrier.className = 'w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-600 transition flex items-center justify-center gap-1.5';
        lblBarrier.textContent = '障害物: なし (自由直進)';
      }
      renderStep();
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      if (currentExp === 'deflect') {
        camera.position.set(18, 16, 22);
        controls.target.set(2, 2, 1);
      } else {
        camera.position.set(16, 18, 20);
        controls.target.set(2, 2, 2);
      }
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

fs.writeFileSync('axis_turn_viewer.html', html, 'utf8');
console.log('Successfully written axis_turn_viewer.html! File size:', html.length);
