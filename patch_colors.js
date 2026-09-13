const fs = require('fs');
let html = fs.readFileSync('t8_organic_viewer.html', 'utf-8');

// Color 4 clones distinctly at t=16 in cleared mode
const oldColorLogic = `} else if (currentStep === 8) {
          if (p[0] < 1) color.setHex(0x10b981); // Emerald Clone A
          else color.setHex(0xa855f7); // Purple Clone B
        } else {`;

const newColorLogic = `} else if (currentStep === 8) {
          if (p[0] < 1) color.setHex(0x10b981); // Emerald Clone A
          else color.setHex(0xa855f7); // Purple Clone B
        } else if (isClearedMode && currentStep === 16) {
          // 4 distinct colors for the 4 grandchild clones
          if (p[0] < -3) color.setHex(0x06b6d4); // Cyan (Clone A1)
          else if (p[0] < 0) color.setHex(0x10b981); // Emerald (Clone A2)
          else if (p[0] < 4) color.setHex(0xa855f7); // Purple (Clone B1)
          else color.setHex(0xf43f5e); // Rose (Clone B2)
        } else {`;

html = html.replace(oldColorLogic, newColorLogic);
fs.writeFileSync('t8_organic_viewer.html', html, 'utf-8');
console.log("Updated 4-clone color highlighting at t=16!");
