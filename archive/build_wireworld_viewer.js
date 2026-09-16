const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3D Wireworld - 立体セル・オートマトン論理回路シミュレータ</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
  <style>
    body { margin: 0; overflow: hidden; background-color: #050811; color: #e2e8f0; font-family: system-ui, -apple-system, sans-serif; }
    #canvas-container { width: 100vw; height: 100vh; position: absolute; top: 0; left: 0; }
    .glass-panel { background: rgba(10, 16, 32, 0.88); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6); }
    .glow-cyan { box-shadow: 0 0 25px rgba(6, 182, 212, 0.5); }
    .glow-amber { box-shadow: 0 0 20px rgba(245, 158, 11, 0.4); }
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
          <span>3D WIREWORLD LOGIC SIMULATOR</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-mono font-bold">立体論理回路・計算機</span>
        </h1>
        <div class="text-xs text-slate-300 mt-0.5 font-medium">
          2Dの限界を超えた <span class="text-amber-300 font-semibold">立体交差（3D Bridge）</span> と <span class="text-cyan-300 font-semibold">自律論理ゲート（Logic Gates）</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Step & Status Info -->
  <div class="absolute top-4 right-4 z-10 pointer-events-auto">
    <div class="glass-panel px-5 py-3 rounded-2xl flex items-center space-x-6 text-sm">
      <div>
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">クロック Tick</div>
        <div class="text-2xl font-black text-cyan-300 font-mono">t = <span id="stat-tick" class="text-white">0</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">回路規模</div>
        <div class="text-2xl font-black text-amber-400 font-mono"><span id="stat-conductors">0</span> <span class="text-xs text-slate-400 font-normal">導線</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">活動電子</div>
        <div class="text-2xl font-black text-cyan-400 font-mono"><span id="stat-heads">0</span> <span class="text-xs text-slate-400 font-normal">Head</span></div>
      </div>
      <div class="border-l border-slate-700/80 pl-5 min-w-[220px]">
        <div class="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">動作状態</div>
        <div id="stat-desc" class="text-xs font-medium text-emerald-300 mt-0.5 leading-relaxed">回路待機中</div>
      </div>
    </div>
  </div>

  <!-- Left: Preset Circuits Panel -->
  <div class="absolute top-24 left-4 z-10 pointer-events-auto w-72">
    <div class="glass-panel p-4 rounded-2xl space-y-3 shadow-2xl">
      <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between border-b border-slate-700/60 pb-2">
        <span>⚡ プリセット回路選択</span>
        <span class="text-[10px] text-cyan-400 font-mono">3D Gates</span>
      </div>

      <div class="space-y-1.5" id="preset-list">
        <button class="btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-cyan-950/80 border border-cyan-500/50 text-cyan-200" data-preset="bridge">
          <span>🌉 3D立体交差ブリッジ</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/60 font-mono">Z-Overpass</span>
        </button>

        <button class="btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-200" data-preset="clock">
          <span>⏰ クロック発振器 (Ring)</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">T=12</span>
        </button>

        <button class="btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-200" data-preset="spiralClock">
          <span>🌀 3Dスパイラル発振器</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">3D Helix</span>
        </button>

        <button class="btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-200" data-preset="orGate">
          <span>🔀 3D OR ゲート</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">A + B</span>
        </button>

        <button class="btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-200" data-preset="diode">
          <span>🛑 ダイオード (一方通行)</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">Valve</span>
        </button>

        <button class="btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-200" data-preset="tower">
          <span>🏢 3D多層集積タワー</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 font-mono">3-Layer</span>
        </button>
      </div>

      <!-- Pulse Injection Toolbar -->
      <div class="border-t border-slate-700/60 pt-3 space-y-2">
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">信号パルス注入 (Input)</div>
        <div class="grid grid-cols-2 gap-1.5">
          <button id="btn-inject-a" class="px-2.5 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow">
            <span>⚡</span><span>入力 A 注入</span>
          </button>
          <button id="btn-inject-b" class="px-2.5 py-1.5 rounded-lg bg-purple-600/80 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center justify-center gap-1 shadow">
            <span>⚡</span><span>入力 B 注入</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Timeline & Controls Container -->
  <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto flex flex-col items-center space-y-3">
    
    <!-- Speed & Camera Bar -->
    <div class="glass-panel px-4 py-2 rounded-xl flex items-center space-x-4 shadow-xl text-xs">
      <div class="flex items-center space-x-2">
        <span class="text-slate-400 font-medium">シミュレーション速度:</span>
        <input id="slider-speed" type="range" min="30" max="500" value="120" step="10" class="w-28 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400">
        <span id="label-speed" class="font-mono text-cyan-300 w-12 text-right">120ms</span>
      </div>

      <div class="border-l border-slate-700 pl-3 flex items-center space-x-2">
        <button id="btn-reset-cam" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition flex items-center gap-1 font-medium">
          <span>🎥</span><span>視点リセット</span>
        </button>
        <button id="btn-clear-pulses" class="px-3 py-1 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-200 border border-slate-600 hover:border-rose-500 transition flex items-center gap-1 font-medium">
          <span>🧹</span><span>電子クリア</span>
        </button>
      </div>
    </div>

    <!-- Main Playback Bar -->
    <div class="glass-panel px-6 py-3.5 rounded-2xl flex items-center space-x-5 shadow-2xl">
      <button id="btn-reset" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="回路を初期状態に戻す">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>
      </button>

      <button id="btn-play-pause" class="w-11 h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center transition shadow-lg shadow-cyan-500/30 font-bold">
        <svg id="icon-play" class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        <svg id="icon-pause" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>

      <button id="btn-step" class="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition shadow" title="1ステップ進む (1 Tick)">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
      </button>

      <div class="border-l border-slate-700/80 pl-4 pr-2 flex items-center space-x-4 text-xs">
        <div class="flex items-center space-x-1.5">
          <div class="w-2.5 h-2.5 rounded-sm bg-amber-500"></div>
          <span class="text-slate-400">導線 (Conductor)</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <div class="w-2.5 h-2.5 rounded-sm bg-cyan-400 shadow-[0_0_8px_#38bdf8]"></div>
          <span class="text-cyan-300 font-bold">電子頭 (Head)</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <div class="w-2.5 h-2.5 rounded-sm bg-rose-500"></div>
          <span class="text-rose-300 font-bold">電子尾 (Tail)</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    // 3D Wireworld Engine
    class Wireworld3D {
      constructor() {
        this.cells = new Map();
      }

      setCell(x, y, z, state) {
        const key = \`\${x},\${y},\${z}\`;
        if (state === 0) this.cells.delete(key);
        else this.cells.set(key, state);
      }

      getCell(x, y, z) {
        return this.cells.get(\`\${x},\${y},\${z}\`) || 0;
      }

      clear() {
        this.cells.clear();
      }

      step() {
        const nextCells = new Map();
        for (const [key, state] of this.cells.entries()) {
          if (state === 2) {
            nextCells.set(key, 3); // Head -> Tail
          } else if (state === 3) {
            nextCells.set(key, 1); // Tail -> Conductor
          } else if (state === 1) {
            const [x, y, z] = key.split(',').map(Number);
            let headCount = 0;
            for (let dx = -1; dx <= 1; dx++) {
              for (let dy = -1; dy <= 1; dy++) {
                for (let dz = -1; dz <= 1; dz++) {
                  if (dx === 0 && dy === 0 && dz === 0) continue;
                  if (this.getCell(x + dx, y + dy, z + dz) === 2) {
                    headCount++;
                    if (headCount > 2) break;
                  }
                }
                if (headCount > 2) break;
              }
              if (headCount > 2) break;
            }

            if (headCount === 1 || headCount === 2) {
              nextCells.set(key, 2);
            } else {
              nextCells.set(key, 1);
            }
          }
        }
        this.cells = nextCells;
      }

      addWire(x1, y1, z1, x2, y2, z2) {
        const dx = Math.sign(x2 - x1);
        const dy = Math.sign(y2 - y1);
        const dz = Math.sign(z2 - z1);
        const len = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), Math.abs(z2 - z1));
        let cx = x1, cy = y1, cz = z1;
        for (let i = 0; i <= len; i++) {
          this.setCell(cx, cy, cz, 1);
          cx += dx; cy += dy; cz += dz;
        }
      }
    }

    const sim = new Wireworld3D();
    let tickCount = 0;
    let isPlaying = false;
    let timer = null;
    let speedMs = 120;
    let currentPresetKey = 'bridge';
    let initialPresetState = [];

    // Predefined 3D Circuits
    const PRESETS = {
      bridge: {
        name: "3D立体交差ブリッジ (3D Bridge Overpass)",
        desc: "2Dではショートしてしまう直交配線を、Z軸方向（高さZ=2）に立体交差。すれ違う2本の電子パルスが完全無干渉で直進します！",
        camera: [20, 20, 25],
        setup: (s) => {
          // Line X at Z=0
          s.addWire(-12, 0, 0, 12, 0, 0);
          // Line Y at Z=2 (elevated overpass bridge)
          s.addWire(0, -12, 2, 0, 12, 2);

          // Pulses heading into center
          s.setCell(-12, 0, 0, 3);
          s.setCell(-11, 0, 0, 2);

          s.setCell(0, -12, 2, 3);
          s.setCell(0, -11, 2, 2);
        },
        injectA: (s) => {
          s.setCell(-12, 0, 0, 3);
          s.setCell(-11, 0, 0, 2);
        },
        injectB: (s) => {
          s.setCell(0, -12, 2, 3);
          s.setCell(0, -11, 2, 2);
        }
      },

      clock: {
        name: "クロック発振器 (Ring Oscillator, Period=12)",
        desc: "閉じた導線ループ内を電子が光速（1マス/ステップ）で周回し、右側の出力導線へ周期12ステップで無限に連続パルスを発射します！",
        camera: [18, 16, 22],
        setup: (s) => {
          // 4x4 loop (Circumference = 12 steps)
          s.addWire(0, 0, 0, 3, 0, 0);
          s.addWire(3, 0, 0, 3, 3, 0);
          s.addWire(3, 3, 0, 0, 3, 0);
          s.addWire(0, 3, 0, 0, 0, 0);

          // Output wire from (3, 1, 0)
          s.addWire(3, 1, 0, 15, 1, 0);

          // Single electron inside loop
          s.setCell(0, 1, 0, 3);
          s.setCell(0, 2, 0, 2);
        },
        injectA: (s) => {
          s.setCell(0, 1, 0, 3);
          s.setCell(0, 2, 0, 2);
        },
        injectB: (s) => {}
      },

      spiralClock: {
        name: "3Dスパイラル発振器 (Helical 3D Pulse Clock)",
        desc: "Z軸（高さ）方向にらせん状に登り、最上階から一気に垂直エレベーターで下降する立体リングクロック。3次元空間全体を使った立体発振器です。",
        camera: [22, 24, 28],
        setup: (s) => {
          // Floor 0: (0,0,0) -> (4,0,0) -> (4,4,0)
          s.addWire(0, 0, 0, 4, 0, 0);
          s.addWire(4, 0, 0, 4, 4, 0);
          // Rise to Floor 2: (4,4,0) -> (0,4,2)
          s.addWire(4, 4, 0, 2, 4, 1);
          s.addWire(2, 4, 1, 0, 4, 2);
          s.addWire(0, 4, 2, 0, 0, 2);
          // Vertical drop: (0,0,2) -> (0,0,0)
          s.setCell(0, 0, 1, 1);

          // Horizontal output wire from top floor
          s.addWire(0, 4, 2, 14, 4, 2);

          // Electron
          s.setCell(0, 0, 0, 3);
          s.setCell(1, 0, 0, 2);
        },
        injectA: (s) => {
          s.setCell(0, 0, 0, 3);
          s.setCell(1, 0, 0, 2);
        },
        injectB: (s) => {}
      },

      orGate: {
        name: "3D OR 論理ゲート (Logic OR Gate)",
        desc: "入力Aまたは入力Bのどちらか（または両方）から電子が来ると、中央の接合部で出力導線に点火します。「入力A注入」「入力B注入」ボタンでテスト可能です。",
        camera: [20, 18, 24],
        setup: (s) => {
          // Input A
          s.addWire(-10, 4, 0, -2, 4, 0);
          s.addWire(-2, 4, 0, 0, 2, 0);
          // Input B
          s.addWire(-10, -2, 0, -2, -2, 0);
          s.addWire(-2, -2, 0, 0, 0, 0);
          // Junction at (1, 1, 0)
          s.setCell(1, 1, 0, 1);
          // Output wire
          s.addWire(2, 1, 0, 14, 1, 0);

          // Initial pulse on Input A
          s.setCell(-10, 4, 0, 3);
          s.setCell(-9, 4, 0, 2);
        },
        injectA: (s) => {
          s.setCell(-10, 4, 0, 3);
          s.setCell(-9, 4, 0, 2);
        },
        injectB: (s) => {
          s.setCell(-10, -2, 0, 3);
          s.setCell(-9, -2, 0, 2);
        }
      },

      diode: {
        name: "ダイオード (Diode / 一方通行素子)",
        desc: "左から右（順方向）への信号はスイスイ通過しますが、右から左（逆方向）への信号は構造的に点火条件を満たせず完全に消滅（遮断）します。",
        camera: [18, 14, 20],
        setup: (s) => {
          // Left wire
          s.addWire(-10, 0, 0, -2, 0, 0);
          // Diode pattern at x=-1..1
          s.setCell(-1, 1, 0, 1);
          s.setCell(-1, 0, 0, 1);
          s.setCell(-1, -1, 0, 1);
          s.setCell(0, 0, 0, 1);
          s.setCell(0, 1, 0, 1);
          s.setCell(1, -1, 0, 1);
          // Right wire
          s.addWire(2, 0, 0, 12, 0, 0);

          // Forward pulse from left
          s.setCell(-10, 0, 0, 3);
          s.setCell(-9, 0, 0, 2);
        },
        injectA: (s) => {
          // Forward (left -> right)
          s.setCell(-10, 0, 0, 3);
          s.setCell(-9, 0, 0, 2);
        },
        injectB: (s) => {
          // Reverse (right -> left, should be blocked!)
          s.setCell(12, 0, 0, 3);
          s.setCell(11, 0, 0, 2);
        }
      },

      tower: {
        name: "3D多層集積タワー (3D Multi-Layer Logic Tower)",
        desc: "1階（Z=0）と2階（Z=4）に独立した回路フロアがあり、四隅の垂直エレベーター導線で信号が立体的に行き交う次世代3Dチップモデルです。",
        camera: [26, 26, 32],
        setup: (s) => {
          // Ground Floor (Z=0) loop
          s.addWire(-5, -5, 0, 5, -5, 0);
          s.addWire(5, -5, 0, 5, 5, 0);
          s.addWire(5, 5, 0, -5, 5, 0);
          s.addWire(-5, 5, 0, -5, -5, 0);

          // Top Floor (Z=4) loop
          s.addWire(-5, -5, 4, 5, -5, 4);
          s.addWire(5, -5, 4, 5, 5, 4);
          s.addWire(5, 5, 4, -5, 5, 4);
          s.addWire(-5, 5, 4, -5, -5, 4);

          // 4 Vertical elevator columns
          for (let z = 1; z <= 3; z++) {
            s.setCell(-5, -5, z, 1);
            s.setCell(5, 5, z, 1);
          }

          // Initial pulses on both floors
          s.setCell(-5, 0, 0, 3);
          s.setCell(-5, 1, 0, 2);

          s.setCell(5, 0, 4, 3);
          s.setCell(5, -1, 4, 2);
        },
        injectA: (s) => {
          s.setCell(-5, 0, 0, 3);
          s.setCell(-5, 1, 0, 2);
        },
        injectB: (s) => {
          s.setCell(5, 0, 4, 3);
          s.setCell(5, -1, 4, 2);
        }
      }
    };

    // Three.js Setup
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050811);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20, 20, 25);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight.position.set(30, 40, 30);
    scene.add(dirLight);

    // Multi-level Grids
    const grid0 = new THREE.GridHelper(40, 40, 0x1e293b, 0x0f172a);
    grid0.position.y = -0.55;
    scene.add(grid0);

    // Cube Meshes (Instanced)
    const cubeGeo = new THREE.BoxGeometry(0.88, 0.88, 0.88);
    const cubeMat = new THREE.MeshStandardMaterial({
      roughness: 0.3,
      metalness: 0.3
    });
    const MAX_CUBES = 2000;
    const instancedMesh = new THREE.InstancedMesh(cubeGeo, cubeMat, MAX_CUBES);
    instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    scene.add(instancedMesh);

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    function updateRender() {
      let idx = 0;
      let conductorCount = 0;
      let headCount = 0;

      for (const [key, state] of sim.cells.entries()) {
        if (idx >= MAX_CUBES) break;
        const [x, y, z] = key.split(',').map(Number);
        dummy.position.set(x, z, -y); // Three.js Y is UP, map CA Z to Three.js Y!
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(idx, dummy.matrix);

        if (state === 1) {
          // Conductor: Bronze / Copper
          color.setHex(0xd97706);
          conductorCount++;
        } else if (state === 2) {
          // Electron Head: Glowing Cyan
          color.setHex(0x00f0ff);
          headCount++;
        } else if (state === 3) {
          // Electron Tail: Neon Rose
          color.setHex(0xf43f5e);
        }
        instancedMesh.setColorAt(idx, color);
        idx++;
      }

      instancedMesh.count = idx;
      instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      document.getElementById('stat-tick').textContent = tickCount;
      document.getElementById('stat-conductors').textContent = conductorCount;
      document.getElementById('stat-heads').textContent = headCount;
    }

    function loadPreset(key) {
      currentPresetKey = key;
      const p = PRESETS[key];
      if (!p) return;

      pause();
      tickCount = 0;
      sim.clear();
      p.setup(sim);

      // Save initial snapshot for reset
      initialPresetState = [];
      for (const [k, st] of sim.cells.entries()) {
        const [x, y, z] = k.split(',').map(Number);
        initialPresetState.push({ x, y, z, st });
      }

      document.getElementById('stat-desc').textContent = p.desc;
      if (p.camera) {
        camera.position.set(...p.camera);
        controls.target.set(0, 1, 0);
        controls.update();
      }

      // Update preset list UI
      document.querySelectorAll('.btn-preset').forEach(btn => {
        if (btn.getAttribute('data-preset') === key) {
          btn.className = 'btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-cyan-950/80 border border-cyan-500/50 text-cyan-200';
        } else {
          btn.className = 'btn-preset w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700 text-slate-200';
        }
      });

      updateRender();
    }

    function step() {
      sim.step();
      tickCount++;
      updateRender();
    }

    function play() {
      if (isPlaying) return;
      isPlaying = true;
      document.getElementById('icon-play').classList.add('hidden');
      document.getElementById('icon-pause').classList.remove('hidden');
      timer = setInterval(step, speedMs);
    }

    function pause() {
      isPlaying = false;
      document.getElementById('icon-play').classList.remove('hidden');
      document.getElementById('icon-pause').classList.add('hidden');
      if (timer) clearInterval(timer);
    }

    // Playback Listeners
    document.getElementById('btn-play-pause').addEventListener('click', () => {
      if (isPlaying) pause();
      else play();
    });

    document.getElementById('btn-step').addEventListener('click', () => {
      pause();
      step();
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
      pause();
      tickCount = 0;
      sim.clear();
      for (const item of initialPresetState) {
        sim.setCell(item.x, item.y, item.z, item.st);
      }
      updateRender();
    });

    document.getElementById('btn-clear-pulses').addEventListener('click', () => {
      // Turn all Heads and Tails back to Conductor
      for (const [k, st] of sim.cells.entries()) {
        if (st === 2 || st === 3) sim.cells.set(k, 1);
      }
      updateRender();
    });

    // Speed Slider
    document.getElementById('slider-speed').addEventListener('input', (e) => {
      speedMs = parseInt(e.target.value);
      document.getElementById('label-speed').textContent = speedMs + 'ms';
      if (isPlaying) {
        pause();
        play();
      }
    });

    // Reset Camera
    document.getElementById('btn-reset-cam').addEventListener('click', () => {
      const p = PRESETS[currentPresetKey];
      if (p && p.camera) camera.position.set(...p.camera);
      else camera.position.set(20, 20, 25);
      controls.target.set(0, 1, 0);
      controls.update();
    });

    // Preset Buttons
    document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        loadPreset(btn.getAttribute('data-preset'));
      });
    });

    // Injection Buttons
    document.getElementById('btn-inject-a').addEventListener('click', () => {
      const p = PRESETS[currentPresetKey];
      if (p && p.injectA) {
        p.injectA(sim);
        updateRender();
      }
    });

    document.getElementById('btn-inject-b').addEventListener('click', () => {
      const p = PRESETS[currentPresetKey];
      if (p && p.injectB) {
        p.injectB(sim);
        updateRender();
      }
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

    // Init
    loadPreset('bridge');
    animate();
  </script>
</body>
</html>`;

fs.writeFileSync('wireworld3d_viewer.html', htmlContent, 'utf8');
console.log('Successfully written wireworld3d_viewer.html! File size:', htmlContent.length);
