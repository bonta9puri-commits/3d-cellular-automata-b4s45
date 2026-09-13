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
  // Mirror X around X=1 means x -> 2-x, y -> y, z -> z
  const mx = [2 - p[0], p[1], p[2]];
  const hasMx = c0_15.some(q => q[0] === mx[0] && q[1] === mx[1] && q[2] === mx[2]);
  console.log(`Point [${p}] -> MirrorX [${mx}]: ${hasMx ? "EXISTS" : "MISSING!"}`);
});
