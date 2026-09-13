const fs = require('fs');
let code = fs.readFileSync('test_runtime_error.js', 'utf-8');
code = code.replace(
  'PerspectiveCamera: function() { this.position = { set: ()=>{} };',
  'PerspectiveCamera: function() { this.position = { set: ()=>{}, length: ()=>25, multiplyScalar: ()=>{} };'
);
fs.writeFileSync('test_runtime_error.js', code, 'utf-8');
