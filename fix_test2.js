const fs = require('fs');
let code = fs.readFileSync('test_runtime_error.js', 'utf-8');
code = code.replace(
  'MeshBasicMaterial: function() {},',
  'MeshBasicMaterial: function() {}, LineDashedMaterial: function() {}, BufferGeometry: function() { this.setFromPoints = ()=>{}; }, Line: function() { this.computeLineDistances = ()=>{}; },'
);
fs.writeFileSync('test_runtime_error.js', code, 'utf-8');
