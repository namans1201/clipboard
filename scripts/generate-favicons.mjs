import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [16, 32, 48, 192, 512];
const inputPath = path.join(__dirname, '../public/logo.png');
const outputDir = path.join(__dirname, '../public');

async function generateFavicons() {
  console.log('Generating favicons...');
  
  // Generate PNG favicons
  for (const size of sizes) {
    await sharp(inputPath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(outputDir, `icon-${size}.png`));
    console.log(`✓ Generated icon-${size}.png`);
  }

  // Generate ICO favicon (16x16)
  const ico16 = await sharp(inputPath)
    .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  
  await sharp(ico16)
    .toFile(path.join(outputDir, 'favicon.ico'));
  console.log('✓ Generated favicon.ico');

  // Generate Apple Touch Icon
  await sharp(inputPath)
    .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(path.join(outputDir, 'apple-touch-icon.png'));
  console.log('✓ Generated apple-touch-icon.png');

  console.log('All favicons generated successfully!');
}

generateFavicons().catch(console.error);
