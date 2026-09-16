// testAxisShift.js
const {
  simulateStep,
  findConnectedComponents,
  generateSymmetrySignatures,
  normalizeAndHash
} = require('./replicatorCore.js');

// Function to find dominant elongation axis of a point set
function getDominantAxis(points) {
  let minX=Infinity, maxX=-Infinity;
  let minY=Infinity, maxY=-Infinity;
  let minZ=Infinity, maxZ=-Infinity;
  for (const p of points) {
    if (p[0]<minX) minX=p[0]; if (p[0]>maxX) maxX=p[0];
    if (p[1]<minY) minY=p[1]; if (p[1]>maxY) maxY=p[1];
    if (p[2]<minZ) minZ=p[2]; if (p[2]>maxZ) maxZ=p[2];
  }
  const dx = maxX - minX;
  const dy = maxY - minY;
  const dz = maxZ - minZ;

  if (dx > dy && dx > dz) return 'X';
  if (dy > dx && dy > dz) return 'Y';
  if (dz > dx && dz > dy) return 'Z';
  return 'tie';
}

console.log('Testing Dominant Axis function:');
console.log('Bar along X:', getDominantAxis([[0,0,0], [1,0,0], [2,0,0]]));
console.log('Bar along Y:', getDominantAxis([[0,0,0], [0,1,0], [0,2,0]]));
console.log('Bar along Z:', getDominantAxis([[0,0,0], [0,0,1], [0,0,2]]));
