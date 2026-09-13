// update_t8_viewer_with_toggle.js
const fs = require('fs');
const naturalData = require('./b5_s4567_t32_data.json');
const clearedData = require('./b5_s4567_grandchild_history.json');

let html = fs.readFileSync('t8_organic_viewer.html', 'utf-8');

// Replace REP_DATA with dual dataset support
const dataSnippet = `
    const NATURAL_DATA = ${JSON.stringify(naturalData)};
    const CLEARED_DATA = ${JSON.stringify(clearedData)};
    let isClearedMode = false;
    let REP_DATA = NATURAL_DATA;
`;

html = html.replace(/const REP_DATA = \{[\s\S]*?\};\n/, dataSnippet);

// Add the "🚀 中央クリア (+2拡張で孫分裂)" button in the control panel
const buttonSnippet = `
      <!-- Central Clearance Mode Button -->
      <button id="btn-clearance" class="px-3.5 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-xs font-semibold text-cyan-300 border border-cyan-500/40 flex items-center space-x-1.5 transition active:scale-95 shadow" title="ユーザー様のご提案：中央の距離を+2広げて干渉を回避し、t=16で完全な4体の孫クローンへ自己複製させる">
        <span>🚀</span>
        <span id="lbl-clearance">中央クリア(孫分裂)</span>
      </button>
`;

html = html.replace('<!-- Ghost Alignment Button -->', buttonSnippet + '\n      <!-- Ghost Alignment Button -->');

// Add the button event listener and mode switch logic
const logicSnippet = `
    const btnClearance = document.getElementById('btn-clearance');
    const lblClearance = document.getElementById('lbl-clearance');

    btnClearance.addEventListener('click', () => {
      isClearedMode = !isClearedMode;
      pausePlayback();
      if (isClearedMode) {
        btnClearance.classList.remove('bg-indigo-950/80', 'text-cyan-300', 'border-cyan-500/40');
        btnClearance.classList.add('bg-cyan-500', 'text-slate-950', 'border-cyan-400', 'font-bold');
        lblClearance.textContent = '中央クリアON (t=16で4体)';
        REP_DATA = CLEARED_DATA;
        document.getElementById('slider-timeline').max = 16;
        if (currentStep > 16) currentStep = 16;
      } else {
        btnClearance.classList.remove('bg-cyan-500', 'text-slate-950', 'border-cyan-400', 'font-bold');
        btnClearance.classList.add('bg-indigo-950/80', 'text-cyan-300', 'border-cyan-500/40');
        lblClearance.textContent = '中央クリア(孫分裂)';
        REP_DATA = NATURAL_DATA;
        document.getElementById('slider-timeline').max = 32;
      }
      renderStep();
    });
`;

html = html.replace('// Playback', logicSnippet + '\n    // Playback');

// Update descriptions when in cleared mode
html = html.replace(
  'const desc = descriptions[currentStep]',
  'let desc = isClearedMode ? (currentStep === 16 ? "🏆【中央干渉回避 成功！】t=16で完全な4体の孫クローン(15セル×4=60セル)へ自己複製！" : (currentStep >= 8 ? `t=${currentStep}: 中央干渉を回避し、各クローンが互いに非干渉で第2分裂へ進行中 (計${REP_DATA.history[currentStep].length}セル)` : descriptions[currentStep])) : descriptions[currentStep]'
);

fs.writeFileSync('t8_organic_viewer.html', html, 'utf-8');
console.log("Successfully updated t8_organic_viewer.html with Interactive Central Clearance Mode!");
