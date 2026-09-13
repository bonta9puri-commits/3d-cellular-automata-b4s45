// update_t8_viewer_to_t32.js
const fs = require('fs');
const data = require('./b5_s4567_t32_data.json');

const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>B5/S4567 15セル有機的メタ自己複製子 長世代3D解析ビューア (t=0..32)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #060913; color: #e2e8f0; font-family: 'Segoe UI', sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5); }
    .glow-purple { box-shadow: 0 0 20px rgba(168, 85, 247, 0.5); }
  </style>
</head>
<body class="select-none">
  <div id="canvas-container"></div>

  <!-- Header -->
  <header class="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
    <div class="glass-panel px-4 py-2.5 rounded-xl flex items-center space-x-3">
      <div class="w-3 h-3 rounded-full bg-purple-400 animate-pulse glow-purple"></div>
      <div>
        <h1 class="text-sm font-bold tracking-wider text-white flex items-center gap-2">
          <span>15-CELL ORGANIC META-SPLITTER</span>
          <span class="text-xs px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 font-mono">Rule: B5 / S4567 (t=0..32)</span>
        </h1>
        <div class="text-[11px] text-slate-400 font-mono">初回完全分裂: t=8 (15セル×2) | t=9〜32: 2極クラスターの有機的共鳴成長</div>
      </div>
    </div>
  </header>

  <!-- Step Info Overlay -->
  <div class="absolute top-4 right-4 z-10 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-xl flex items-center space-x-6 text-sm">
      <div>
        <div class="text-[11px] text-slate-400 uppercase tracking-wider">現在ステップ</div>
        <div class="text-xl font-bold text-purple-300 font-mono">t = <span id="stat-step" class="text-white">0</span> <span class="text-xs text-slate-400">/ 32</span></div>
      </div>
      <div class="border-l border-slate-700 pl-4">
        <div class="text-[11px] text-slate-400 uppercase tracking-wider">総セル数</div>
        <div id="stat-cells" class="text-xl font-bold text-cyan-300 font-mono">15</div>
      </div>
      <div class="border-l border-slate-700 pl-4">
        <div class="text-[11px] text-slate-400 uppercase tracking-wider">状態解説</div>
        <div id="stat-status" class="text-xs font-semibold text-emerald-400 max-w-xs truncate">初期状態 (親 C0)</div>
      </div>
    </div>
  </div>

  <!-- Bottom Timeline & Controls -->
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
    <div class="glass-panel px-6 py-3.5 rounded-2xl flex items-center space-x-5 shadow-2xl">
      <button id="btn-step-prev" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition" title="1ステップ戻る">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>

      <button id="btn-play-pause" class="w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition shadow-lg shadow-purple-600/30">
        <svg id="icon-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button id="btn-step-next" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition" title="1ステップ進む">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <div class="flex items-center space-x-3 w-80">
        <span class="text-xs font-mono text-slate-400 min-w-[32px]">t=<span id="label-step" class="text-white font-bold">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="32" value="0" step="1" class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500">
        <span class="text-xs font-mono text-slate-400 min-w-[32px]">/32</span>
      </div>

      <!-- Quick Jump Buttons -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700 pl-3">
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-purple-900 text-purple-300 text-xs rounded font-mono" data-step="0">t=0(親)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950 border border-purple-500/50 hover:bg-purple-800 text-purple-200 text-xs rounded font-mono font-bold" data-step="8">★t=8(完全分裂)</button>
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-purple-900 text-purple-300 text-xs rounded font-mono" data-step="16">t=16</button>
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-purple-900 text-purple-300 text-xs rounded font-mono" data-step="32">t=32</button>
      </div>

      <!-- Ghost Alignment Button -->
      <button id="btn-ghost" class="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 transition active:scale-95 shadow">
        <span>👻</span>
        <span id="lbl-ghost">ゴースト照合</span>
      </button>

      <!-- Snap Align to Parent Button -->
      <button id="btn-snap" class="px-3.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-xs font-semibold text-emerald-300 border border-emerald-500/50 flex items-center space-x-1.5 transition active:scale-95 shadow hidden">
        <span>🧩</span>
        <span id="lbl-snap">親に重ねる</span>
      </button>

      <button id="btn-reset" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition" title="カメラ視点リセット">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
      </button>
    </div>
  </div>

  <script>
    const REP_DATA = ${JSON.stringify(data)};

    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;
    let isGhostMode = false;
    let isSnapped = false;

    // --- Three.js Setup ---
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.012);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(22, 18, 28);

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
    const dirLight1 = new THREE.DirectionalLight(0xa855f7, 1.4);
    dirLight1.position.set(40, 60, 40);
    scene.add(dirLight1);
    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.0);
    dirLight2.position.set(-40, -30, -40);
    scene.add(dirLight2);

    const gridHelper = new THREE.GridHelper(80, 80, 0x1e293b, 0x0f172a);
    gridHelper.position.y = -8;
    scene.add(gridHelper);

    // InstancedMesh
    const boxGeometry = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    const boxMaterial = new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0.4, vertexColors: true });
    const instancedMesh = new THREE.InstancedMesh(boxGeometry, boxMaterial, 2000);
    scene.add(instancedMesh);

    // Ghost Wireframe
    const ghostGroup = new THREE.Group();
    const wireGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
    const ghostMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, wireframe: true, transparent: true, opacity: 0.6 });
    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(wireGeo, ghostMat);
      ghostGroup.add(mesh);
    }
    ghostGroup.visible = false;
    scene.add(ghostGroup);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

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
      9: "t=9: 各クローンが第2サイクルの活動を開始 (各20セル)",
      10: "t=10: 左右の対称構造を維持しながら脈動 (各19セル)",
      12: "t=12: 左右のコアが再び15セルへ収束 (各15セル, 合計30セル)",
      16: "t=16: 第2周期の脈動膨張 (合計68セル)",
      24: "t=24: 左右の超対称構造が安定持続 (合計154セル)",
      32: "t=32: 長大空間での2極オーガニック・クラウド展開 (合計378セル)"
    };

    function renderStep() {
      document.getElementById('label-step').textContent = currentStep;
      document.getElementById('stat-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;

      const desc = descriptions[currentStep] || (\`t=\${currentStep}: 左右対称クラスターの有機的変形・共鳴 (合計\${REP_DATA.history[currentStep].length}セル)\`);
      document.getElementById('stat-status').textContent = desc;

      const pts = REP_DATA.history[currentStep];
      document.getElementById('stat-cells').textContent = pts.length;

      let displayPts = pts;
      if (isSnapped && currentStep === 8) {
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
          color.setHex(0x38bdf8); // Cyan for Parent
        } else if (currentStep === 8) {
          if (p[0] < 1) color.setHex(0x10b981); // Emerald Clone A
          else color.setHex(0xa855f7); // Purple Clone B
        } else {
          // Color based on X axis polarity (Left vs Right cluster)
          if (p[0] < 1) color.setHex(0x06b6d4); // Cyan-Blue for Left
          else color.setHex(0xd946ef); // Magenta-Purple for Right
        }
        instancedMesh.setColorAt(i, color);
      }
      instancedMesh.count = displayPts.length;
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      // Update Ghost at t=8
      if (isGhostMode && currentStep === 8) {
        ghostGroup.visible = true;
        const c0 = REP_DATA.history[0];
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

    // Playback
    function startPlayback() {
      if (isPlaying) return;
      isPlaying = true;
      document.getElementById('icon-play').classList.add('hidden');
      document.getElementById('icon-pause').classList.remove('hidden');
      playInterval = setInterval(() => {
        if (currentStep < 32) currentStep++;
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

    document.getElementById('btn-ghost').addEventListener('click', () => {
      isGhostMode = !isGhostMode;
      const btn = document.getElementById('btn-ghost');
      const snapBtn = document.getElementById('btn-snap');
      if (isGhostMode) {
        btn.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400');
        document.getElementById('lbl-ghost').textContent = 'ゴーストON';
        snapBtn.classList.remove('hidden');
      } else {
        btn.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-400');
        document.getElementById('lbl-ghost').textContent = 'ゴースト照合';
        snapBtn.classList.add('hidden');
        isSnapped = false;
      }
      renderStep();
    });

    document.getElementById('btn-snap').addEventListener('click', () => {
      isSnapped = !isSnapped;
      const btn = document.getElementById('btn-snap');
      if (isSnapped) {
        btn.classList.add('bg-emerald-500', 'text-slate-950', 'border-emerald-400');
        document.getElementById('lbl-snap').textContent = '吸着中(100%一致)';
      } else {
        btn.classList.remove('bg-emerald-500', 'text-slate-950', 'border-emerald-400');
        document.getElementById('lbl-snap').textContent = '親に重ねる';
      }
      renderStep();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      camera.position.set(22, 18, 28);
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

fs.writeFileSync('t8_organic_viewer.html', htmlContent, 'utf-8');
console.log("Updated t8_organic_viewer.html with t=0..32 data successfully!");
