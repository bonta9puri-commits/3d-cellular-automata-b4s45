const fs = require('fs');

const naturalData = fs.readFileSync('b5_s4567_t32_data.json', 'utf8').trim();
const cascadeData = fs.readFileSync('b5_cascade_t32.json', 'utf8').trim();

const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B5/S4567 15セル有機的メタ自己複製子 3D解析ビューア (t=0..32)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #060913; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
    .glow-cyan { box-shadow: 0 0 25px rgba(6, 182, 212, 0.4); }
    .glow-purple { box-shadow: 0 0 25px rgba(168, 85, 247, 0.4); }
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
          <span>15-CELL ORGANIC META-SPLITTER</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold">Rule: B5 / S4567</span>
        </h1>
        <div class="text-xs text-slate-300 mt-0.5 font-medium">
          中央干渉回避による多世代完全複製：<span class="text-cyan-300 font-mono font-bold">1体(t=0) → 2体(t=8) → 4体(t=16) → 8体(t=24) → 16体(t=32)</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Step Info Overlay -->
  <div class="absolute top-4 right-4 z-10 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-6 text-sm">
      <div>
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在ステップ</div>
        <div class="text-2xl font-black text-cyan-300 font-mono">t = <span id="stat-step" class="text-white">0</span> <span class="text-xs text-slate-400 font-normal">/ 32</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">総セル数</div>
        <div id="stat-cells" class="text-2xl font-black text-purple-300 font-mono">15</div>
      </div>
      <div class="border-l border-slate-700/80 pl-5 min-w-[280px]">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">状態・解説</div>
        <div id="stat-status" class="text-xs font-medium text-emerald-300 mt-0.5 leading-relaxed">初期親シード C0 (15セル)</div>
      </div>
    </div>
  </div>

  <!-- Bottom Timeline & Controls Container -->
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center space-y-3">
    
    <!-- Action / Verification Toolbar -->
    <div class="glass-panel px-4 py-2 rounded-xl flex items-center space-x-2.5 shadow-xl text-xs">
      <button id="btn-mode-clearance" class="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold border border-cyan-400 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20">
        <span>🚀</span><span id="lbl-clearance">中央クリア: ON (16体増殖)</span>
      </button>

      <button id="btn-ghost" class="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/50 transition flex items-center gap-1.5 font-medium">
        <span>👻</span><span id="lbl-ghost">ゴースト照合(t=8)</span>
      </button>

      <button id="btn-snap" class="hidden px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 transition flex items-center gap-1.5 font-medium">
        <span>🧩</span><span id="lbl-snap">親に重ねる</span>
      </button>

      <button id="btn-reset-cam" class="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/50 transition flex items-center gap-1.5 font-medium" title="カメラ位置をリセット">
        <span>🎥</span><span>視点リセット</span>
      </button>
    </div>

    <!-- Main Playback & Timeline Bar -->
    <div class="glass-panel px-6 py-3.5 rounded-2xl flex items-center space-x-5 shadow-2xl">
      <button id="btn-step-prev" class="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ戻る">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>

      <button id="btn-play-pause" class="w-11 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition shadow-lg shadow-cyan-500/30 font-bold">
        <svg id="icon-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button id="btn-step-next" class="p-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ進む">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <div class="flex items-center space-x-3 w-80">
        <span class="text-xs font-mono text-cyan-400 font-bold min-w-[36px]">t=<span id="label-step" class="text-white">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="32" value="0" step="1" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400">
        <span class="text-xs font-mono text-slate-400 min-w-[32px]">/32</span>
      </div>

      <!-- Quick Jump Buttons -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700/80 pl-3">
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-mono font-medium transition" data-step="0">t=0(親)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950/80 border border-purple-500/40 hover:bg-purple-900 text-purple-300 text-xs rounded font-mono font-bold transition" data-step="8">★t=8(2体)</button>
        <button class="btn-jump px-2 py-1 bg-cyan-950/80 border border-cyan-500/40 hover:bg-cyan-900 text-cyan-300 text-xs rounded font-mono font-bold transition" data-step="16">🏆t=16(4体)</button>
        <button class="btn-jump px-2 py-1 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs rounded font-mono font-bold transition" data-step="24">🚀t=24(8体)</button>
        <button class="btn-jump px-2 py-1 bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900 text-amber-300 text-xs rounded font-mono font-bold transition" data-step="32">👑t=32(16体!)</button>
      </div>
    </div>
  </div>

  <script>
    const NATURAL_DATA = ${naturalData};
    const CASCADE_DATA = ${cascadeData};

    let isClearedMode = true; // デフォルトで指数増殖モード
    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;
    let isGhostMode = false;
    let isSnapped = false;

    // Three.js Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(30, 25, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 1, 3);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(30, 50, 40);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.5);
    dirLight2.position.set(-30, -20, -20);
    scene.add(dirLight2);

    // Grid helper
    const gridHelper = new THREE.GridHelper(100, 50, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Cube Meshes (Instanced)
    const cubeGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
    const cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.15
    });
    const MAX_INSTANCES = 500;
    const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, MAX_INSTANCES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // Ghost Wireframes for t=8 matching verification
    const ghostGroup = new THREE.Group();
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.35 });
    for (let i = 0; i < 30; i++) {
      const gm = new THREE.Mesh(cubeGeo, ghostMat);
      gm.visible = false;
      ghostGroup.add(gm);
    }
    scene.add(ghostGroup);

    const descriptions = {
      0: "t=0: 初期親シード C0 (15セル)。点対称な内部空洞を持つ立体構造",
      1: "t=1: 活性化・外郭へ拡張 (20セル)",
      2: "t=2: 内部コアの再編成・脈動 (20セル)",
      3: "t=3: 収縮・高密度化 (18セル)。分裂の臨界圧",
      4: "t=4: 予備膨張 (20セル)。左右両極への質量偏向",
      5: "t=5: 大波紋展開 (38セル)。最大体積へ爆発的膨張",
      6: "t=6: 急速収束・中央くびれ (26セル)。2極化の決定打",
      7: "t=7: 2体へ分断完了 (左右各10セル)",
      8: "★t=8: 完全自己複製完了！親シードと同型の2体(15セル×2)に結晶化",
      9: "t=9: 各クローンが第2サイクルの活動を開始",
      16: "🏆t=16: 第2世代分裂完了！",
      24: "🚀t=24: 第3世代分裂完了！",
      32: "👑t=32: 第4世代分裂完了！"
    };

    function getStepDescription(step, count) {
      if (isClearedMode) {
        if (step === 0) return "t=0: 初期親シード C0 (15セル)。1個体";
        if (step === 8) return "★t=8: 初回分裂完了！中央クリアにより2体のクローン(15セル×2=30セル)が完全独立化";
        if (step === 16) return "🏆t=16: 孫分裂完了！完全な4体のクローン(15セル×4=60セル)へ倍々増殖！";
        if (step === 24) return "🚀t=24: 曾孫分裂完了！完全な8体のクローン(15セル×8=120セル)へ指数増殖！";
        if (step === 32) return "👑t=32: 極大分裂完了！完全な16体のクローン(15セル×16=240セル)が整然と整列！";
        if (descriptions[step]) return descriptions[step] + " (計" + count + "セル)";
        return "t=" + step + ": 各世代のクローンが中央干渉なく次の分裂へ自律進行中 (計" + count + "セル)";
      } else {
        if (step === 8) return "★t=8: 完全自己複製完了！親シードと同型の2体(15セル×2=30セル)";
        if (descriptions[step]) return descriptions[step] + " (計" + count + "セル)";
        return "t=" + step + ": 中央クリアなし自然放置。左右ペアの有機的共鳴成長 (計" + count + "セル)";
      }
    }

    function renderStep() {
      const curData = isClearedMode ? CASCADE_DATA : NATURAL_DATA;
      const pts = curData.history[currentStep] || [];

      document.getElementById('label-step').textContent = currentStep;
      document.getElementById('stat-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;
      document.getElementById('stat-cells').textContent = pts.length;
      document.getElementById('stat-status').textContent = getStepDescription(currentStep, pts.length);

      let displayPts = pts;
      if (isSnapped && currentStep === 8 && !isClearedMode) {
        // 自然モード時の吸着照合
        displayPts = pts.map(p => {
          if (p[0] < 1) return [p[0] + 2, p[1], p[2] - 1];
          return p;
        });
      }

      for (let i = 0; i < displayPts.length; i++) {
        const p = displayPts[i];
        dummy.position.set(p[0], p[1], p[2]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        if (currentStep === 0) {
          color.setHex(0x38bdf8); // 親: 鮮やかなシアン
        } else if (currentStep === 8) {
          if (p[0] < 0) color.setHex(0x10b981); // クローンA: エメラルドグリーン
          else color.setHex(0xa855f7); // クローンB: パープル
        } else if (isClearedMode && [8, 16, 24, 32].includes(currentStep)) {
          // X座標に応じた虹色グラデーションで各クローン個体を鮮明に識別
          const minX = Math.min(...pts.map(pt => pt[0]));
          const maxX = Math.max(...pts.map(pt => pt[0]));
          const ratio = maxX > minX ? (p[0] - minX) / (maxX - minX) : 0.5;
          color.setHSL(0.52 + 0.55 * ratio, 0.95, 0.6);
        } else {
          // X極性に応じた発色
          if (p[0] < 0) color.setHex(0x06b6d4); // 左翼シアン
          else color.setHex(0xd946ef); // 右翼マゼンタ
        }
        instancedMesh.setColorAt(i, color);
      }

      instancedMesh.count = displayPts.length;
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      // Ghost at t=8
      if (isGhostMode && currentStep === 8 && !isClearedMode) {
        ghostGroup.visible = true;
        const c0 = NATURAL_DATA.history[0];
        for (let i = 0; i < 15; i++) {
          const p = c0[i];
          const meshA = ghostGroup.children[i];
          meshA.position.set(p[0] - 2, p[1], p[2] + 1);
          meshA.visible = true;

          const meshB = ghostGroup.children[i + 15];
          meshB.position.set(p[0] + 2, p[1], p[2] + 1);
          meshB.visible = true;
        }
      } else {
        ghostGroup.visible = false;
      }
    }

    // Clearance Mode Toggle
    const btnClearance = document.getElementById('btn-mode-clearance');
    const lblClearance = document.getElementById('lbl-clearance');

    btnClearance.addEventListener('click', () => {
      isClearedMode = !isClearedMode;
      pausePlayback();
      if (isClearedMode) {
        btnClearance.className = 'px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold border border-cyan-400 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20';
        lblClearance.textContent = '中央クリア: ON (16体増殖)';
      } else {
        btnClearance.className = 'px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium border border-slate-600/50 transition flex items-center gap-1.5';
        lblClearance.textContent = '中央クリア: OFF (自然放置)';
      }
      renderStep();
    });

    // Playback Controls
    function startPlayback() {
      if (isPlaying) return;
      isPlaying = true;
      document.getElementById('icon-play').classList.add('hidden');
      document.getElementById('icon-pause').classList.remove('hidden');
      playInterval = setInterval(() => {
        if (currentStep < 32) currentStep++;
        else currentStep = 0;
        renderStep();
      }, 350);
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
      if (currentStep < 32) { currentStep++; renderStep(); }
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

    // Ghost mode
    const btnGhost = document.getElementById('btn-ghost');
    const snapBtn = document.getElementById('btn-snap');

    btnGhost.addEventListener('click', () => {
      isGhostMode = !isGhostMode;
      if (isGhostMode) {
        btnGhost.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400', 'font-bold');
        btnGhost.classList.remove('bg-slate-800/80', 'text-slate-200');
        snapBtn.classList.remove('hidden');
      } else {
        btnGhost.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-400', 'font-bold');
        btnGhost.classList.add('bg-slate-800/80', 'text-slate-200');
        snapBtn.classList.add('hidden');
        isSnapped = false;
      }
      renderStep();
    });

    snapBtn.addEventListener('click', () => {
      isSnapped = !isSnapped;
      if (isSnapped) {
        snapBtn.classList.add('bg-emerald-500', 'text-slate-950', 'font-bold');
        snapBtn.classList.remove('bg-emerald-500/20', 'text-emerald-300');
        document.getElementById('lbl-snap').textContent = '吸着中(100%一致)';
      } else {
        snapBtn.classList.remove('bg-emerald-500', 'text-slate-950', 'font-bold');
        snapBtn.classList.add('bg-emerald-500/20', 'text-emerald-300');
        document.getElementById('lbl-snap').textContent = '親に重ねる';
      }
      renderStep();
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      camera.position.set(30, 25, 40);
      controls.target.set(0, 1, 3);
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

    // 初期化描画
    renderStep();
    animate();
  </script>
</body>
</html>`;

fs.writeFileSync('t8_organic_viewer.html', html, 'utf8');
console.log('Successfully written t8_organic_viewer.html! File size:', html.length);
