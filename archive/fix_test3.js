const fs = require('fs');
let code = fs.readFileSync('test_runtime_error.js', 'utf-8');
code = code.replace(
  'Object3D: function()',
  'Vector3: function(x,y,z) { this.x=x; this.y=y; this.z=z; }, Matrix4: function() { this.setPosition = ()=>{}; this.set = ()=>{}; }, Object3D: function()'
);
fs.writeFileSync('test_runtime_error.js', code, 'utf-8');
