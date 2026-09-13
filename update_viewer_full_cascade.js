// update_viewer_full_cascade.js
const fs = require('fs');
const naturalData = require('./b5_s4567_t32_data.json');
const cascadeData = require('./b5_cascade_t32.json');

let html = fs.readFileSync('t8_organic_viewer.html', 'utf-8');

// Replace data section
const oldData = /const NATURAL_DATA = [\s\S]*?let REP_DATA = NATURAL_DATA;\n/;
const newData = `const NATURAL_DATA = ${JSON.stringify(naturalData)};
    const CASCADE_DATA = ${JSON.stringify(cascadeData)};
    let isClearedMode = false;
    let REP_DATA = NATURAL_DATA;
`;

html = html.replace(oldData, newData);

// Update slider max and button handler
html = html.replace('lblClearance.textContent = \'中央クリアON (t=16で4体)\';', 'lblClearance.textContent = \'中央クリアON (t=32で16体)\';');
html = html.replace('REP_DATA = CLEARED_DATA;', 'REP_DATA = CASCADE_DATA;');
html = html.replace('document.getElementById(\'slider-timeline\').max = 16;', 'document.getElementById(\'slider-timeline\').max = 32;');

// Update quick jump buttons for cascade
const jumpButtons = `
      <!-- Quick Jump Buttons -->
      <div class="flex items-center space-x-1.5 border-l border-slate-700 pl-3">
        <button class="btn-jump px-2 py-1 bg-slate-800 hover:bg-purple-900 text-purple-300 text-xs rounded font-mono" data-step="0">t=0(親)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950 border border-purple-500/50 hover:bg-purple-800 text-purple-200 text-xs rounded font-mono font-bold" data-step="8">★t=8(2体)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950 border border-purple-500/50 hover:bg-purple-800 text-cyan-200 text-xs rounded font-mono font-bold" data-step="16">★t=16(4体)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950 border border-purple-500/50 hover:bg-purple-800 text-emerald-200 text-xs rounded font-mono font-bold" data-step="24">★t=24(8体)</button>
        <button class="btn-jump px-2 py-1 bg-purple-950 border border-purple-500/50 hover:bg-purple-800 text-amber-200 text-xs rounded font-mono font-bold" data-step="32">★t=32(16体!)</button>
      </div>
`;

html = html.replace(/<!-- Quick Jump Buttons -->[\s\S]*?<\/div>\s*<\/div>/, jumpButtons.trim() + '\n    </div>');

// Update description logic for cascade mode
const oldDesc = `let desc = isClearedMode ? (currentStep === 16 ? "🏆【中央干渉回避 成功！】t=16で完全な4体の孫クローン(15セル×4=60セル)へ自己複製！" : (currentStep >= 8 ? \`t=\${currentStep}: 中央干渉を回避し、各クローンが互いに非干渉で第2分裂へ進行中 (計\${REP_DATA.history[currentStep].length}セル)\` : descriptions[currentStep])) : descriptions[currentStep]`;

const newDesc = `let desc = descriptions[currentStep];
      if (isClearedMode) {
        if (currentStep === 8) desc = "★t=8: 初回分裂完了！中央クリアにより2体のクローン(15セル×2=30セル)が非干渉化";
        else if (currentStep === 16) desc = "🏆t=16: 孫分裂完了！完全な4体のクローン(15セル×4=60セル)へ倍々増殖！";
        else if (currentStep === 24) desc = "🚀t=24: 曾孫分裂完了！完全な8体のクローン(15セル×8=120セル)へ指数増殖！";
        else if (currentStep === 32) desc = "👑t=32: 極大分裂完了！完全な16体のクローン(15セル×16=240セル)が整然と整列！";
        else if (currentStep > 0) desc = \`t=\${currentStep}: 中央干渉を遮断し、各世代のクローンが互いに非干渉で次の分裂へ進行中 (計\${REP_DATA.history[currentStep].length}セル)\`;
      }`;

html = html.replace(oldDesc, newDesc);

// Color coding for up to 16 clones
const colorCode = `} else if (isClearedMode && [8, 16, 24, 32].includes(currentStep)) {
          // Dynamic distinct coloring across X spectrum
          const minX = Math.min(...pts.map(pt => pt[0]));
          const maxX = Math.max(...pts.map(pt => pt[0]));
          const ratio = (p[0] - minX) / (maxX - minX || 1);
          color.setHSL(0.55 + 0.5 * ratio, 0.9, 0.6);
        } else {`;

html = html.replace(/} else if \(isClearedMode && currentStep === 16\) {[\s\S]*?} else {/, colorCode);

fs.writeFileSync('t8_organic_viewer.html', html, 'utf-8');
console.log("Successfully updated t8_organic_viewer.html for full t=0..32 cascade (16 clones)!");
