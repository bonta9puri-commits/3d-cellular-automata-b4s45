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
const centerC0 = c0_15.filter(p => p[0] === 1);
console.log("Center cells count:", centerC0.length);
console.log("Center cells:", centerC0);

// Check which mask in test_center_tuning corresponded to original C0:
// (1, 0, 0) <-> (1, 2, 2) : present! (pair 0)
// (1, 0, 1) <-> (1, 2, 1) : present! (pair 1)
// (1, 0, 2) <-> (1, 2, 0) : present! (pair 2)
// (1, 1, 0) <-> (1, 1, 2) : only (1, 1, 0) is present! (1, 1, 2) is NOT present!
