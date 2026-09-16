const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');
const scripts = html.split('<script');
scripts.forEach((s, i) => {
  const end = s.indexOf('</script>');
  if (end !== -1) {
    const content = s.slice(s.indexOf('>') + 1, end);
    console.log(`Script [${i}]: length=${content.length}, preview=${content.trim().slice(0, 50).replace(/\n/g, ' ')}`);
  }
});
