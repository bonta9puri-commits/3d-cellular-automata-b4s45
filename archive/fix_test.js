// update test_runtime_error.js
const fs = require('fs');
let code = fs.readFileSync('test_runtime_error.js', 'utf-8');
code = code.replace(
  'InstancedMesh: function() { this.setMatrixAt = ()=>{}; this.setColorAt = ()=>{}; this.instanceMatrix = {}; this.instanceColor = {}; }',
  'InstancedMesh: function() { this.setMatrixAt = ()=>{}; this.setColorAt = ()=>{}; this.instanceMatrix = { setUsage: ()=>{} }; this.instanceColor = { setUsage: ()=>{} }; }'
);
fs.writeFileSync('test_runtime_error.js', code, 'utf-8');
