// One-shot asset optimisation for the production deploy.
//
// 1. Resize the profile-card avatar to 600x600 WebP (1.5 MB → ~50 KB).
// 2. Replace the 1.9 MB favicon.ico with a minimal one wrapping the
//    existing 1.7 KB icon-32.png.
// 3. Delete unreferenced /public assets (logos, icon.svg).
//
// Run once with: node scripts/optimize-assets.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PUB = new URL('../public/', import.meta.url).pathname;
const fmtKB = (n) => (n / 1024).toFixed(1) + ' KB';

function sizeOf(name) {
  try { return statSync(join(PUB, name)).size; } catch { return 0; }
}

console.log('── 1. Avatar → 600x600 WebP ──');
const beforeAvatar = sizeOf('naman-avatar.png');
await sharp(join(PUB, 'naman-avatar.png'))
  .resize(600, 600, { fit: 'cover', position: 'attention' })
  .webp({ quality: 82, effort: 6 })
  .toFile(join(PUB, 'naman-avatar.webp'));
const afterAvatar = sizeOf('naman-avatar.webp');
console.log(`  naman-avatar.png ${fmtKB(beforeAvatar)} → naman-avatar.webp ${fmtKB(afterAvatar)}`);

console.log('── 2. favicon.ico — rebuild from icon-32.png ──');
const beforeFav = sizeOf('favicon.ico');
const png32 = readFileSync(join(PUB, 'icon-32.png'));
// ICO container = 6-byte header + 16-byte directory entry + image bytes.
const ico = Buffer.alloc(22 + png32.length);
ico.writeUInt16LE(0, 0);              // reserved
ico.writeUInt16LE(1, 2);              // image type (1 = ICO)
ico.writeUInt16LE(1, 4);              // image count
ico.writeUInt8(32, 6);                // width  (32; 0 would mean 256)
ico.writeUInt8(32, 7);                // height
ico.writeUInt8(0, 8);                 // colour-palette count (0 = >=256)
ico.writeUInt8(0, 9);                 // reserved
ico.writeUInt16LE(1, 10);             // colour planes
ico.writeUInt16LE(32, 12);            // bits per pixel
ico.writeUInt32LE(png32.length, 14);  // image size
ico.writeUInt32LE(22, 18);            // offset to image data
png32.copy(ico, 22);
writeFileSync(join(PUB, 'favicon.ico'), ico);
const afterFav = sizeOf('favicon.ico');
console.log(`  favicon.ico ${fmtKB(beforeFav)} → ${fmtKB(afterFav)}`);

console.log('── 3. Delete unreferenced public assets ──');
const ORPHANS = [
  'logo-light.png',
  'logo-dark.png',
  'logo.png',
  'logo.svg',
  'logo-dark.svg',
  'icon.svg',
  'naman-avatar.png', // replaced by .webp
];
let freed = 0;
for (const f of ORPHANS) {
  const s = sizeOf(f);
  if (existsSync(join(PUB, f))) {
    unlinkSync(join(PUB, f));
    console.log(`  removed ${f} (${fmtKB(s)})`);
    freed += s;
  }
}
console.log(`\n✓ Freed ${fmtKB(freed)} of unused assets`);
