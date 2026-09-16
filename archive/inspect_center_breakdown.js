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

const leftC0 = c0_15.filter(p => p[0] === 0);
const centerC0 = c0_15.filter(p => p[0] === 1);
const rightC0 = c0_15.filter(p => p[0] === 2);

console.log("Left (X=0):", leftC0.length, "cells:", JSON.stringify(leftC0));
console.log("Center (X=1):", centerC0.length, "cells:", JSON.stringify(centerC0));
console.log("Right (X=2):", rightC0.length, "cells:", JSON.stringify(rightC0));
