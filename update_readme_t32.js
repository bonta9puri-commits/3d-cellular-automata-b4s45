// update_readme_t32.js
const fs = require('fs');
let md = fs.readFileSync('README_SUMMARY.md', 'utf-8');

md = md.replace(
  '| **B5 / S4,5,6,7** | **15-Cell Organic Meta-Splitter**<br>(深層変形メタ分裂) | 15セル | **$t=8$ (深層)** | $t=0\\sim7$ で有機的脈動（15→20→18→38→26→20セル）を経て、$t=8$ で親と100%同一の2体（15セル×2）に初分裂。変位 $[-2,0,1]$ & $[2,0,1]$。 | **第1世代 ($t=8$) 合同完全一致**<br>(ゴースト吸着100%照合済) |',
  '| **B5 / S4,5,6,7** | **15-Cell Organic Meta-Splitter**<br>(深層変形メタ分裂) | 15セル | **$t=8 \\sim 32$ (長世代拡張)** | $t=0\\sim7$ で有機的脈動を経て $t=8$ で親と100%同一の2体に初分裂。さらに $t=9\\sim32$ では左右の2極クラスターが崩壊せず有機的な共鳴・成長を安定持続。 | **$t=0\\sim32$ 完全シミュレーション対応**<br>(ゴースト吸着100%照合済) |'
);

fs.writeFileSync('README_SUMMARY.md', md, 'utf-8');
console.log("README_SUMMARY.md updated with B5/S4567 long-run info!");
