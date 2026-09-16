const fs = require('fs');
const path = require('path');
const html = fs.readFileSync('index.html', 'utf-8');
console.log('Contains T8_PRESETS:', html.includes('rep_t8_15cell_organic'));
console.log('Contains minStep selector:', html.includes('minStepSelect'));
