const c0_15 = [
  [ 0, 0, 1 ], [ 2, 2, 1 ],
  [ 0, 1, 1 ], [ 2, 1, 1 ],
  [ 0, 1, 2 ], [ 2, 1, 2 ],
  [ 0, 2, 1 ], [ 2, 0, 1 ],
  [ 1, 0, 1 ], [ 1, 2, 1 ],
  [ 1, 0, 2 ], [ 1, 2, 2 ],
  [ 1, 1, 0 ], [ 1, 2, 0 ],
  [ 1, 0, 0 ]
];

c0_15.forEach(p => {
  const inv = [2 - p[0], 2 - p[1], 2 - p[2]];
  const hasInv = c0_15.some(q => q[0] === inv[0] && q[1] === inv[1] && q[2] === inv[2]);
  console.log(`Point [${p}] -> Inversion [${inv}]: ${hasInv ? "EXISTS" : "MISSING!"}`);
});
