const fs = require('fs');
const path = require('path');

let html = fs.readFileSync(path.join(__dirname, 'b3_s145_twist.html'), 'utf-8');

// 1. Add Ghost buttons to bottom bar
const oldBarTarget = `<button id="btn-reset-cam"`;
const newButtons = `<!-- Ghost Alignment Button -->
      <button id="btn-toggle-ghost" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/40 flex items-center space-x-1.5 transition active:scale-95 shadow" title="親シード(C0)の半透明ゴースト枠を表示して、形状が合同か一目で照合する">
        <span>👻</span>
        <span id="label-ghost-btn">ゴースト照合</span>
      </button>

      <!-- Snap Align to Parent Button -->
      <button id="btn-snap-align" class="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-xs font-semibold text-emerald-300 border border-emerald-500/50 flex items-center space-x-1.5 transition active:scale-95 shadow hidden" title="分裂したクローンを親の位置に自動回転してピタッと重ね合わせる">
        <span>🧩</span>
        <span id="label-snap-btn">親に重ねる</span>
      </button>

      <button id="btn-reset-cam"`;

html = html.replace(oldBarTarget, newButtons);

// 2. Add ghostGroup and render logic in script
const scriptTarget = `const dummyMatrix = new THREE.Matrix4();`;
const ghostInit = `// --- Ghost Overlay Objects ---
    const ghostGroup = new THREE.Group();
    scene.add(ghostGroup);
    let isGhostMode = false;
    let isSnappedToParent = false;

    const dummyMatrix = new THREE.Matrix4();`;

html = html.replace(scriptTarget, ghostInit);

// 3. Update renderStep in b3_s145_twist.html
const oldRenderTarget = `function renderStep() {
      const history = replicatorData.history;
      if (!history || currentStep >= history.length) return;`;

const newRenderHead = `function renderStep() {
      while (ghostGroup.children.length > 0) {
        const obj = ghostGroup.children[0];
        if (obj.geometry) obj.geometry.dispose();
        ghostGroup.remove(obj);
      }

      const history = replicatorData.history;
      if (!history || currentStep >= history.length) return;

      const c0Points = replicatorData.c0 || history[0];
      const isSplit = (currentStep === 2 || currentStep === 4 || currentStep === 8 || currentStep === 16 || currentStep === 32);

      // Snap Align Mode
      if (isSnappedToParent && isSplit && c0Points) {
        let s0x=0, s0y=0, s0z=0;
        c0Points.forEach(p => { s0x+=p[0]; s0y+=p[1]; s0z+=p[2]; });
        const c0Center = [s0x/c0Points.length, s0y/c0Points.length, s0z/c0Points.length];

        instancedMesh.count = c0Points.length;
        for (let i = 0; i < c0Points.length; i++) {
          const p = c0Points[i];
          dummyMatrix.setPosition(p[0]-c0Center[0], p[1]-c0Center[1], p[2]-c0Center[2]);
          instancedMesh.setMatrixAt(i, dummyMatrix);
          tempColor.setHex(0x10b981); // Emerald Green
          instancedMesh.setColorAt(i, tempColor);
        }
        instancedMesh.instanceMatrix.needsUpdate = true;
        if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

        const boxGeo = new THREE.BoxGeometry(0.92, 0.92, 0.92);
        const edgesGeo = new THREE.EdgesGeometry(boxGeo);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x34d399, linewidth: 2 });
        c0Points.forEach(p => {
          const wire = new THREE.LineSegments(edgesGeo, lineMat);
          wire.position.set(p[0]-c0Center[0], p[1]-c0Center[1], p[2]-c0Center[2]);
          ghostGroup.add(wire);
        });

        document.getElementById('label-current-step').textContent = currentStep + " (照合中)";
        document.getElementById('info-current-step').textContent = 't = ' + currentStep + ' (親に重ね合わせ中)';
        document.getElementById('info-cell-count').textContent = c0Points.length + ' (完全合同一致!)';
        return;
      }`;

html = html.replace(oldRenderTarget, newRenderHead);

// 4. In renderStep, add ghost wireframes when isGhostMode is true
const postRenderInstanced = `instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;`;

const ghostWireframeCode = `instancedMesh.instanceMatrix.needsUpdate = true;
      if (instancedMesh.instanceColor) instancedMesh.instanceColor.needsUpdate = true;

      // Ghost Mode Wireframes
      if (isGhostMode && c0Points) {
        const boxGeo = new THREE.BoxGeometry(0.96, 0.96, 0.96);
        const edgesGeo = new THREE.EdgesGeometry(boxGeo);
        const ghostLineMat = new THREE.LineBasicMaterial({ color: 0xfbbf24, transparent: true, opacity: 0.85, linewidth: 2 });
        for (let i = 0; i < count; i++) {
          const p = points[i];
          const wire = new THREE.LineSegments(edgesGeo, ghostLineMat);
          wire.position.set(p[0]-center[0], p[1]-center[1], p[2]-center[2]);
          ghostGroup.add(wire);
        }
      }`;

html = html.replace(postRenderInstanced, ghostWireframeCode);

// 5. Add button click handlers
const scriptEndTarget = `// Initial render\n    renderStep();`;
const buttonHandlers = `// Ghost Mode Handlers
    const btnGhost = document.getElementById('btn-toggle-ghost');
    const btnSnap = document.getElementById('btn-snap-align');
    const lblGhost = document.getElementById('label-ghost-btn');
    const lblSnap = document.getElementById('label-snap-btn');

    btnGhost.addEventListener('click', () => {
      isGhostMode = !isGhostMode;
      if (isGhostMode) {
        btnGhost.classList.remove('bg-slate-800', 'text-amber-300', 'border-amber-500/40');
        btnGhost.classList.add('bg-amber-500', 'text-slate-950', 'border-amber-400', 'font-bold');
        lblGhost.textContent = 'ゴーストON';
        btnSnap.classList.remove('hidden');
      } else {
        btnGhost.classList.remove('bg-amber-500', 'text-slate-950', 'border-amber-400', 'font-bold');
        btnGhost.classList.add('bg-slate-800', 'text-amber-300', 'border-amber-500/40');
        lblGhost.textContent = 'ゴースト照合';
        isSnappedToParent = false;
        btnSnap.classList.add('hidden');
      }
      renderStep();
    });

    btnSnap.addEventListener('click', () => {
      isSnappedToParent = !isSnappedToParent;
      if (isSnappedToParent) {
        btnSnap.classList.remove('bg-emerald-950/80', 'text-emerald-300', 'border-emerald-500/50');
        btnSnap.classList.add('bg-emerald-500', 'text-slate-950', 'border-emerald-400', 'font-bold');
        lblSnap.textContent = '吸着中(100%一致)';
      } else {
        btnSnap.classList.remove('bg-emerald-500', 'text-slate-950', 'border-emerald-400', 'font-bold');
        btnSnap.classList.add('bg-emerald-950/80', 'text-emerald-300', 'border-emerald-500/50');
        lblSnap.textContent = '親に重ねる';
      }
      renderStep();
    });

    // Initial render
    renderStep();`;

html = html.replace(scriptEndTarget, buttonHandlers);

fs.writeFileSync(path.join(__dirname, 'b3_s145_twist.html'), html, 'utf-8');
console.log('Successfully added Ghost Match & Snap Align to b3_s145_twist.html!');
