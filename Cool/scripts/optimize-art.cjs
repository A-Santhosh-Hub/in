// Responsive encodings of generated masters; no retouching or compositing.
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname,'../assets/art');
const names = ['chapter-home','chapter-work','chapter-about','chapter-contact','santhosh-character'];
(async () => {
  for (const name of names) {
    const source = path.join(root,'originals',name+'.png');
    const portrait = name === 'santhosh-character';
    const metadata = await sharp(source).metadata();
    if (portrait && !metadata.hasAlpha) throw new Error('Portrait must retain a transparent background');
    await sharp(source).resize({width:portrait ? 1000 : 1680,withoutEnlargement:true}).webp({quality:86,effort:6,alphaQuality:100}).toFile(path.join(root,name+'.webp'));
    await sharp(source).resize({width:portrait ? 640 : 960,withoutEnlargement:true}).webp({quality:82,effort:6,alphaQuality:100}).toFile(path.join(root,name+'-mobile.webp'));
    const original = (await fs.stat(source)).size;
    const desktop = (await fs.stat(path.join(root,name+'.webp'))).size;
    const mobile = (await fs.stat(path.join(root,name+'-mobile.webp'))).size;
    console.log(`${name}: original ${Math.round(original/1024)}KB → desktop ${Math.round(desktop/1024)}KB / mobile ${Math.round(mobile/1024)}KB; alpha=${!!metadata.hasAlpha}`);
  }
})().catch(error => {console.error(error);process.exit(1);});
