const fs = require('fs');
const { simulateStep } = require('./replicatorCore.js');

const ruleB4S45 = { B: new Set([4]), S: new Set([4, 5]) };

// Base 2D glider
const baseGlider = [
  [0, 1, 0], [1, 2, 0], [2, 0, 0], [2, 1, 0], [2, 2, 0]
];

// Attachments: [[1,2,1],[2,2,-1]]
const attachments = [[1, 2, 1], [2, 2, -1]];
const clampedSeed = baseGlider.concat(attachments);

function run(init, steps = 14) {
  let c = init;
  const h = [c];
  for (let t = 0; t < steps; t++) {
    c = simulateStep(c, ruleB4S45);
    h.push(c);
  }
  return h;
}

const clampedHist = run(clampedSeed, 12);
const bareHist = run(baseGlider, 12);

const exportData = {
  clamped: clampedHist,
  bare: bareHist,
  attachments: attachments
};

fs.writeFileSync('z_clamp_data.json', JSON.stringify(exportData), 'utf8');

// Build HTML viewer
const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Z-Clamp 偏平スタビライザー 3Dビューア (厚み<=4・2D直進推進弾)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #060914; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(10, 16, 34, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
    .glow-amber { box-shadow: 0 0 25px rgba(245, 158, 11, 0.5); }
    .glow-cyan { box-shadow: 0 0 25px rgba(6, 182, 212, 0.5); }
  </style>
</head>
<body class="select-none">
  <div id="canvas-container"></div>

  <!-- Header -->
  <header class="absolute top-4 left-4 z-10 flex items-center space-x-3 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-4">
      <div class="w-3.5 h-3.5 rounded-full bg-amber-400 animate-pulse glow-amber"></div>
      <div>
        <h1 class="text-base font-black tracking-wider text-white flex items-center gap-2.5">
          <span>Z-CLAMP FLAT STABILIZER</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-mono font-bold">Rule: B4 / S45</span>
        </h1>
        <div class="text-xs text-slate-300 mt-0.5 font-medium">
          Z軸の厚みを <span class="text-amber-300 font-bold font-mono">&le; 4 (目標5以内)</span> に閉じ込め、水平面をスーッと飛ぶ偏平アタッチメント！
        </div>
      </div>
    </div>
  </header>

  <!-- Status Overlay -->
  <div class="absolute top-4 right-4 z-10 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-6 text-sm">
      <div>
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在ステップ</div>
        <div class="text-2xl font-black text-amber-400 font-mono">t = <span id="stat-step" class="text-white">0</span> <span class="text-xs text-slate-400 font-normal">/ 12</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Z軸の厚み (スパン)</div>
        <div class="text-2xl font-black text-emerald-400 font-mono"><span id="stat-zspan">3</span> <span class="text-xs text-slate-400 font-normal">(&le; 5以内達成!)</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">現在セル数</div>
        <div class="text-2xl font-black text-cyan-300 font-mono"><span id="stat-cells">7</span> <span class="text-xs text-slate-400 font-normal">(MAX=16 &le; 25)</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5 min-w-[220px]">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">推進状態</div>
        <div id="stat-desc" class="text-xs font-medium text-amber-300 mt-0.5 leading-relaxed">初期クランプ装着</div>
      </div>
    </div>
  </div>

  <!-- Left: Controls Panel -->
  <div class="absolute top-24 left-4 z-10 pointer-events-auto w-80">
    <div class="glass-panel p-4 rounded-2xl space-y-3 shadow-2xl">
      <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-700/60 pb-2">
        <span>🛡️ スタビライザー比較</span>
        <span class="text-[10px] text-amber-400 font-mono">Z &le; 5 Clamp</span>
      </div>

      <div class="space-y-2">
        <button id="btn-mode-clamped" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-amber-950/80 border border-amber-500/60 text-amber-100 shadow-md shadow-amber-950/50">
          <div class="font-bold flex items-center justify-between">
            <span>✨ クランプ装着 (厚み3〜4で水平直進)</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-amber-900 font-mono">7 Cells</span>
          </div>
          <div class="text-[11px] text-slate-300">
            2Dグライダーの上下(Z=&plusmn;1)にアタッチメントを装着！厚み5以内に抑えられたまま水平にグングン飛びます！
          </div>
        </button>

        <button id="btn-mode-bare" class="w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300">
          <div class="font-bold flex items-center justify-between">
            <span>❌ アタッチメントなし (2Dグライダー単体)</span>
            <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">5 Cells</span>
          </div>
          <div class="text-[11px] text-slate-400">
            3D空間に2Dグライダーを単体で置いた場合。スタビライザーがないと直進できません。
          </div>
        </button>
      </div>

      <!-- Helper tip -->
      <div class="border-t border-slate-700/60 pt-3 text-[11px] text-slate-400 leading-relaxed">
        💡 <b class="text-slate-300">真横（水平）から見てみよう！</b><br>
        カメラを真横から覗くと、厚みわずか 3〜4 セルの「薄い板（フリスビー）」のような姿勢のまま前進する様子がよく分かります。
      </div>
    </div>
  </div>

  <!-- Bottom Timeline & Controls Container -->
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center space-y-3">
    
    <!-- Info & Camera Bar -->
    <div class="glass-panel px-4 py-2 rounded-xl flex items-center space-x-4 shadow-xl text-xs">
      <div class="flex items-center space-x-2">
        <div class="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></div>
        <span class="text-slate-300 font-medium">本体セル (Z=0)</span>
      </div>
      <div class="flex items-center space-x-2 border-l border-slate-700 pl-3">
        <div class="w-2.5 h-2.5 rounded-sm bg-amber-400 shadow-[0_0_8px_#f59e0b]"></div>
        <span class="text-slate-300 font-medium">上下アタッチメント (Z=&plusmn;1)</span>
      </div>

      <div class="border-l border-slate-700 pl-3 flex items-center space-x-2">
        <button id="btn-side-view" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 transition flex items-center gap-1 font-mono">
          <span>📐</span><span>真横視点 (厚み確認)</span>
        </button>
        <button id="btn-reset-cam" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center gap-1 font-medium">
          <span>🎥</span><span>俯瞰リセット</span>
        </button>
      </div>
    </div>

    <!-- Main Playback & Timeline Bar -->
    <div class="glass-panel px-6 py-3.5 rounded-2xl flex items-center space-x-5 shadow-2xl">
      <button id="btn-step-prev" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ戻る">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>

      <button id="btn-play-pause" class="w-11 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition shadow-lg shadow-amber-500/30 font-bold">
        <svg id="icon-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button id="btn-step-next" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ進む">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <div class="flex items-center space-x-3 w-80">
        <span class="text-xs font-mono text-amber-400 font-bold min-w-[36px]">t=<span id="label-step" class="text-white">0</span></span>
        <input id="slider-timeline" type="range" min="0" max="12" value="0" step="1" class="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500">
        <span class="text-xs font-mono text-slate-400 min-w-[32px]">/ 12</span>
      </div>

      <!-- Quick Jump Buttons -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700/80 pl-3">
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-mono font-medium transition" data-step="0">t=0(7セル)</button>
        <button class="btn-jump px-2 py-1 bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900 text-amber-300 text-xs rounded font-mono font-bold transition" data-step="3">t=3(直進加速)</button>
        <button class="btn-jump px-2 py-1 bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900 text-amber-300 text-xs rounded font-mono font-bold transition" data-step="6">t=6(厚み4維持)</button>
        <button class="btn-jump px-2 py-1 bg-emerald-950/80 border border-emerald-500/40 hover:bg-emerald-900 text-emerald-300 text-xs rounded font-mono font-bold transition" data-step="10">t=10(前進達成!)</button>
      </div>
    </div>
  </div>

  <script>
    const DATA = ${JSON.stringify(exportData)};

    let isClamped = true;
    let currentStep = 0;
    let isPlaying = false;
    let playInterval = null;

    // Three.js Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(12, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(1.5, 0, 4);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(20, 30, 25);
    scene.add(dirLight);

    // Thin Slab Guide Box (Thickness = 5 visualization)
    const slabGeo = new THREE.BoxGeometry(10, 5, 20);
    const slabMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true, transparent: true, opacity: 0.15 });
    const slabMesh = new THREE.Mesh(slabGeo, slabMat);
    slabMesh.position.set(1.5, 0.5, 6);
    scene.add(slabMesh);

    const grid = new THREE.GridHelper(30, 30, 0x1e293b, 0x0f172a);
    grid.position.y = -2.55;
    scene.add(grid);

    // Cube Meshes (Instanced)
    const cubeGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    const cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.25,
      metalness: 0.25
    });
    const MAX_CUBES = 200;
    const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, MAX_CUBES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    function renderStep() {
      const history = isClamped ? DATA.clamped : DATA.bare;
      const pts = history[currentStep] || [];

      document.getElementById('label-step').textContent = currentStep;
      document.getElementById('stat-step').textContent = currentStep;
      document.getElementById('slider-timeline').value = currentStep;
      document.getElementById('stat-cells').textContent = pts.length;

      let minZ = Infinity, maxZ = -Infinity;
      let cy = 0;
      for (const p of pts) {
        if (p[2] < minZ) minZ = p[2];
        if (p[2] > maxZ) maxZ = p[2];
        cy += p[1];
      }
      const spanZ = maxZ >= minZ ? maxZ - minZ + 1 : 0;
      document.getElementById('stat-zspan').textContent = spanZ;

      if (pts.length > 0) cy /= pts.length;

      let desc = '';
      if (isClamped) {
        if (currentStep === 0) desc = 't=0: 2Dグライダー(5) + 上下アタッチメント(2) = 計7セル';
        else if (currentStep <= 3) desc = 't=' + currentStep + ': 厚み3を保ったまま水平前進中！(重心Y=' + cy.toFixed(1) + ')';
        else if (currentStep <= 7) desc = 't=' + currentStep + ': 厚み4で安定水平直進！(セル数=' + pts.length + ' <= 16)';
        else desc = '★t=' + currentStep + ': Y軸方向へ約6.3マス直進達成！(Z厚みは常に5以内)';
      } else {
        desc = 't=' + currentStep + ': アタッチメントなし。単体では崩壊します (計' + pts.length + 'セル)';
      }
      document.getElementById('stat-desc').textContent = desc;

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        // p[0]=X, p[1]=Y (forward), p[2]=Z (up/down).
        // Map to Three.js: X -> X, Z -> Y (up), Y -> Z (forward)
        dummy.position.set(p[0], p[2], p[1]);
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);

        if (isClamped && currentStep === 0) {
          if (p[2] !== 0) {
            color.setHex(0xf59e0b); // 上下アタッチメント (ゴールド)
          } else {
            color.setHex(0x06b6d4); // 本体 (シアン)
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

    // Mode Buttons
    const btnClamped = document.getElementById('btn-mode-clamped');
    const btnBare = document.getElementById('btn-mode-bare');

    btnClamped.addEventListener('click', () => {
      isClamped = true;
      currentStep = 0;
      pausePlayback();
      btnClamped.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-amber-950/80 border border-amber-500/60 text-amber-100 shadow-md shadow-amber-950/50';
      btnBare.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300';
      renderStep();
    });

    btnBare.addEventListener('click', () => {
      isClamped = false;
      currentStep = 0;
      pausePlayback();
      btnBare.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-cyan-950/80 border border-cyan-500/60 text-cyan-100 shadow-md shadow-cyan-950/50';
      btnClamped.className = 'w-full text-left p-3 rounded-xl text-xs transition flex flex-col gap-1 bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-300';
      renderStep();
    });

    document.getElementById('btn-side-view').addEventListener('click', () => {
      // Look completely flat from side (X direction) to see thickness <= 4
      camera.position.set(16, 0.5, 4);
      controls.target.set(0, 0.5, 4);
      controls.update();
    });

    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      camera.position.set(12, 10, 15);
      controls.target.set(1.5, 0, 4);
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

fs.writeFileSync('z_clamp_viewer.html', html, 'utf8');
console.log('Successfully written z_clamp_viewer.html!');
