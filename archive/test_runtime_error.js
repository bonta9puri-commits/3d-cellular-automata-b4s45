const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const s = html.split('<script')[5];
const scriptContent = s.slice(s.indexOf('>') + 1, s.indexOf('</script>'));

const vm = require('vm');
// Mock browser environment
const mockElements = {};
function getMock(id) {
  if (!mockElements[id]) {
    mockElements[id] = {
      id,
      innerHTML: '',
      textContent: '',
      value: '',
      classList: { add: ()=>{}, remove: ()=>{} },
      addEventListener: ()=>{},
      prepend: (child)=>{ mockElements[id].children = mockElements[id].children || []; mockElements[id].children.unshift(child); },
      appendChild: (child)=>{},
      children: []
    };
  }
  return mockElements[id];
}

const windowMock = {
  innerWidth: 1200,
  innerHeight: 800,
  devicePixelRatio: 1,
  addEventListener: ()=>{}
};

const documentMock = {
  getElementById: (id) => getMock(id),
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = {
      className: '',
      innerHTML: '',
      querySelector: () => ({ addEventListener: ()=>{} }),
      addEventListener: ()=>{}
    };
    return el;
  }
};

const threeMock = {
  Scene: function() { this.add = ()=>{}; this.fog = {}; },
  FogExp2: function() {},
  PerspectiveCamera: function() { this.position = { set: ()=>{}, length: ()=>25, multiplyScalar: ()=>{} }; this.aspect = 1; this.updateProjectionMatrix = ()=>{}; },
  WebGLRenderer: function() { this.setSize = ()=>{}; this.setPixelRatio = ()=>{}; this.setClearColor = ()=>{}; this.domElement = {}; this.render = ()=>{}; },
  OrbitControls: function() { this.target = { set: ()=>{} }; this.update = ()=>{}; },
  AmbientLight: function() {},
  DirectionalLight: function() { this.position = { set: ()=>{} }; },
  GridHelper: function() { this.position = {}; },
  BoxGeometry: function() {},
  MeshStandardMaterial: function() {},
  InstancedMesh: function() { this.setMatrixAt = ()=>{}; this.setColorAt = ()=>{}; this.instanceMatrix = { setUsage: ()=>{} }; this.instanceColor = { setUsage: ()=>{} }; },
  Group: function() { this.add = ()=>{}; this.children = []; this.visible = false; },
  MeshBasicMaterial: function() {}, LineDashedMaterial: function() {}, BufferGeometry: function() { this.setFromPoints = ()=>{}; }, Line: function() { this.computeLineDistances = ()=>{}; },
  Mesh: function() { this.position = { set: ()=>{} }; },
  Vector3: function(x,y,z) { this.x=x; this.y=y; this.z=z; }, Matrix4: function() { this.setPosition = ()=>{}; this.set = ()=>{}; }, Object3D: function() { this.position = { set: ()=>{} }; this.updateMatrix = ()=>{}; this.matrix = {}; },
  Color: function() { this.setHex = ()=>{}; this.setRGB = ()=>{}; }
};

const sandbox = {
  window: windowMock,
  document: documentMock,
  THREE: threeMock,
  console: console,
  setInterval: ()=>{},
  clearInterval: ()=>{},
  requestAnimationFrame: ()=>{}
};

try {
  vm.runInNewContext(scriptContent, sandbox);
  console.log("Mock execution SUCCESS! No errors thrown.");
  console.log("Replicators in list container:", mockElements['replicator-list'].children.length);
} catch (e) {
  console.error("Mock execution FAILED:", e);
}
