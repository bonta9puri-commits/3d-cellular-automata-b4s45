// test_add_fourth_gun.js
// ���󂩂�N���Ă����u�E�̐��F�̒e�i�����e�j�v�������I
// �����Ƒ�4�̖C��u�����e�C�� C�i�΁E28�Z���j�v���E�� (X=16, Z=38) �ɐ����z������I
//
// ����ɂ��F
// �C��A (����: X=-24, Z=-20) -> ���Z����A
// �C��B (�E��O: X=16, Z=24) -> ���Z����B
// �C��C (�E��: X=16, Z=36) -> �����������������ݒe�i���F�j�𐳎����ˁI
// �C��RESET (��O��: X=-3, Z=54) -> RESET�e�i�ԁj�𔭎ˁI

const fs = require('fs');

const b = [4];
const s = [4, 5];

const NEIGHBORS = [];
for (let dx = -1; dx <= 1; dx++) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dz = -1; dz <= 1; dz++) {
      if (dx === 0 && dy === 0 && dz === 0) continue;
      NEIGHBORS.push([dx, dy, dz]);
    }
  }
}

function pureStep(current) {
  const counts = new Map();
  for (const k of current) {
    const [x,y,z] = k.split(',').map(Number);
    for (const [dx,dy,dz] of NEIGHBORS) {
      const nk = `${x+dx},${y+dy},${z+dz}`;
      counts.set(nk, (counts.get(nk) || 0) + 1);
    }
  }
  const next = new Set();
  for (const [k, cnt] of counts.entries()) {
    const alive = current.has(k);
    if (alive && s.includes(cnt)) next.add(k);
    else if (!alive && b.includes(cnt)) next.add(k);
  }
  return next;
}

const init7 = [
  [0,0,0], [0,2,0], [0,1,0],
  [0,1,1], [1,0,1], [1,2,1], [1,1,1]
];

const osc8 = [
  [0,1,0],[0,2,0],[0,3,0],[1,3,0],
  [1,0,0],[2,0,0],[2,1,0],[2,2,0]
];
const still6 = [
  [0,1,1],[0,2,0],[0,2,1],
  [1,1,0],[1,1,1],[1,2,0]
];

function buildGun(ox, oy, oz, dirX = 1, dirZ = 1) {
  const cells = [];
  osc8.forEach(([x,y,z]) => cells.push([ox + x * dirX, oy + y, oz + z * dirZ]));
  osc8.forEach(([x,y,z]) => cells.push([ox + (10 - x) * dirX, oy + y, oz + z * dirZ]));
  still6.forEach(([x,y,z]) => {
    cells.push([ox + (x + 4) * dirX, oy + (y + 6), oz + z * dirZ]);
    cells.push([ox + (x + 4) * dirX, oy + (y - 5), oz + z * dirZ]);
  });
  return cells;
}

// 4��̖C��
const gunA = buildGun(-24, 0, -20, 1, 1);
const gunB = buildGun(16, 0, 24, -1, -1);
const gunC = buildGun(16, 0, 38, -1, -1); // ���E���琅�F�e�������o����p�C��I
const gunReset = buildGun(-3, 0, 54, 1, -1);

const adderAttach = still6.map(([x,y,z]) => [x - 4, y + 4, z + 2]);
const memOrigin = [-3, 1, 18];

// �����̌������V�[�P���X (10�X�e�b�v)
let stateSET = new Set();
init7.forEach(([x,y,z]) => stateSET.add(`${x},${y},${z}`));
init7.forEach(([x,y,z]) => stateSET.add(`${-x - 3},${y - 3},${5 - z}`));
const setFrames = [Array.from(stateSET).map(k => k.split(',').map(Number))];
for (let t = 1; t <= 10; t++) {
  stateSET = pureStep(stateSET);
  setFrames.push(Array.from(stateSET).map(k => k.split(',').map(Number)));
}

// �����̑Ώ��ŃV�[�P���X (9�X�e�b�v)
let stateRESET = new Set(stateSET);
init7.forEach(([x,y,z]) => stateRESET.add(`${x - 3},${y - 3},${5 - z}`));
const resetFrames = [Array.from(stateRESET).map(k => k.split(',').map(Number))];
for (let t = 1; t <= 9; t++) {
  stateRESET = pureStep(stateRESET);
  resetFrames.push(Array.from(stateRESET).map(k => k.split(',').map(Number)));
}

const totalSteps = 80;
const frames = [];

for (let t = 0; t <= totalSteps; t++) {
  const active = [];

  gunA.forEach(([x,y,z]) => active.push({ type: 'gun', coord: [x,y,z] }));
  gunB.forEach(([x,y,z]) => active.push({ type: 'gun', coord: [x,y,z] }));
  gunC.forEach(([x,y,z]) => active.push({ type: 'gun', coord: [x,y,z] })); // �C��C���ΐF�ŏ풓
  gunReset.forEach(([x,y,z]) => active.push({ type: 'gunReset', coord: [x,y,z] }));
  adderAttach.forEach(([x,y,z]) => active.push({ type: 'attach_adder', coord: [x,y,z] }));

  // Phase 1: ���Z�e�� A & B (t=0..18)
  if (t <= 18) {
    const p = t / 18;
    const ax = -19 + p * 15;
    const az = -16 + p * 18;
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletA', coord: [Math.round(ax + x), 1 + y, Math.round(az + z)] }));

    const bx = 11 - p * 15;
    const bz = 20 - p * 18;
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletB', coord: [Math.round(bx - x), 1 + y, Math.round(bz - z)] }));
  }

  // Phase 2: �Փˉ��Z (t=18..21)
  if (t >= 18 && t <= 21) {
    [[-4, 2, 2], [-4, 3, 2], [-3, 2, 2], [-5, 2, 2]].forEach(([x,y,z]) => {
      active.push({ type: 'spark', coord: [x,y,z] });
    });
  }

  // Phase 3: Carry bullet (t=21..32)\n  if (t >= 21 && t < 32) {\n    const p = (t - 21) / 11;\n    const cx = -4 + p * 1;\n    const cz = 2 + p * 16;\n    init7.forEach(([x,y,z]) => active.push({ type: 'bulletCarry', coord: [Math.round(cx + x), 1 + y, Math.round(cz + z)] }));\n  }\n\n  // Phase 3-Sync: Sync bullet smoothly launched from Gun C mouth! (t=14..32)\n  if (t >= 14 && t < 32) {\n    const p = (t - 14) / 18;\n    const sx = 11 - p * 14;\n    const sz = 34 - p * 16;\n    init7.forEach(([x,y,z]) => active.push({ type: 'bulletCarry', coord: [Math.round(sx - x), 1 + y, Math.round(sz - z)] }));\n  }\n\n  // Phase 4: �A�^�b�`�����g������ (t=32..42)
  if (t >= 32 && t <= 42) {
    const stepIdx = Math.min(t - 32, setFrames.length - 1);
    const raw = setFrames[stepIdx];
    raw.forEach(([x,y,z]) => {
      const type = (stepIdx >= 8) ? 'crystalMem' : 'spark';
      active.push({ type, coord: [x + memOrigin[0], y + memOrigin[1], z + memOrigin[2]] });
    });
  }

  // Phase 5: �Î~�A�^�b�`�����g��ݕێ� (t=42..58)
  if (t > 42 && t < 58) {
    const raw = setFrames[setFrames.length - 1];
    raw.forEach(([x,y,z]) => {
      active.push({ type: 'crystalMem', coord: [x + memOrigin[0], y + memOrigin[1], z + memOrigin[2]] });
    });
  }

  // Phase 6: ���Z�b�g�C�䂩���RESET�e (t=38..58)
  if (t >= 38 && t < 58) {
    const p = (t - 38) / 20;
    const rx = -3;
    const rz = 50 - p * 29;
    init7.forEach(([x,y,z]) => active.push({ type: 'bulletReset', coord: [Math.round(rx + x), 1 + y, Math.round(rz - z)] }));
  }

  // Phase 7: �����E���S�Ώ��� (t=58..67)
  if (t >= 58 && t <= 67) {
    const stepIdx = Math.min(t - 58, resetFrames.length - 1);
    const raw = resetFrames[stepIdx];
    raw.forEach(([x,y,z]) => {
      active.push({ type: 'spark', coord: [x + memOrigin[0], y + memOrigin[1], z + memOrigin[2]] });
    });
  }

  frames.push(active);
}

// HTML �e���v���[�g�֓K�p
let html = fs.readFileSync('all_in_one_3d_viewer.html', 'utf8');

// �}��̍X�V
html = html.replace(
  '<div class="legend-item"><div class="dot" style="background: #34d399;"></div> ���Z�C�� A & B (�e28�Z��)</div>',
  '<div class="legend-item"><div class="dot" style="background: #34d399;"></div> �����C�� A, B, C (�e28�Z��)</div>'
);

const sIdx = html.indexOf('const FRAMES = ');
const eIdx = html.indexOf('let stepIndex = 0;');

if (sIdx !== -1 && eIdx !== -1) {
  html = html.substring(0, sIdx) + 'const FRAMES = ' + JSON.stringify(frames) + ';\n    ' + html.substring(eIdx);
  fs.writeFileSync('all_in_one_3d_viewer.html', html, 'utf8');
  console.log('Successfully updated all_in_one_3d_viewer.html with 4th Gun C!');
}
