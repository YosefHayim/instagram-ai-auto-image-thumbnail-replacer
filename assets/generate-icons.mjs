import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [16, 32, 48, 128];
const svgPath = 'assets/icon.svg';

async function generateIcons() {
  const svgBuffer = fs.readFileSync(svgPath);
  
  for (const size of sizes) {
    const outputPath = `assets/icon${size}.png`;
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created ${outputPath}`);
  }
}

generateIcons().catch(console.error);
