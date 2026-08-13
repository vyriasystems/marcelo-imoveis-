const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist');
const assets = ['css', 'js', 'images', 'videos', 'data'];
const pages = ['index.html', 'imovel.html'];

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

pages.forEach(function (page) {
  const source = path.join(root, page);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(dist, page));
  }
});

if (fs.existsSync(path.join(root, '.nojekyll'))) {
  fs.copyFileSync(path.join(root, '.nojekyll'), path.join(dist, '.nojekyll'));
}

assets.forEach(function (dir) {
  const source = path.join(root, dir);
  if (fs.existsSync(source)) {
    fs.cpSync(source, path.join(dist, dir), { recursive: true });
  }
});

console.log('Build concluído em dist/');
