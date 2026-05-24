import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

async function processImage(inputName, outputWebp, outputPng, width, height) {
    const inputPath = path.join(PUBLIC_DIR, inputName);
    
    if (!fs.existsSync(inputPath)) {
        console.warn(`[WARN] ${inputPath} not found. Skipping.`);
        return;
    }

    const img = sharp(inputPath);
    
    // Convert to WebP
    await img
        .resize({ width, height, fit: 'inside' })
        .webp({ quality: 80 })
        .toFile(path.join(PUBLIC_DIR, outputWebp));
    console.log(`Generated ${outputWebp} (${width}x${height})`);

    // Generate scaled PNG fallback
    if (outputPng) {
        await img
            .resize({ width, height, fit: 'inside' })
            .png({ quality: 80 })
            .toFile(path.join(PUBLIC_DIR, outputPng));
        console.log(`Generated ${outputPng} (${width}x${height})`);
    }
}

async function main() {
    console.log('Converting assets for C1 & M2...');
    // C1: carl-icon.png (1254x1254 to 200x200)
    // We will keep the original carl-icon.png for source, and generate carl-icon.webp and carl-icon-fallback.png
    await processImage('carl-icon.png', 'carl-icon.webp', 'carl-icon-fallback.png', 200, 200);

    // M2: 01_plain_english_summary.png (1431x466 to 662x215)
    // The audit said: "/images/sample-report/01_plain_english_summary.png is 132 KiB at 1431 by 466 pixels, displayed at 662 by 215."
    // We will convert it to webp and save to the same dir.
    // We will do this explicitly:
    const sampleDir = path.join(PUBLIC_DIR, 'images', 'sample-report');
    if (fs.existsSync(sampleDir)) {
        const sampleIn = path.join(sampleDir, '01_plain_english_summary.png');
        if (fs.existsSync(sampleIn)) {
            await sharp(sampleIn)
                .resize({ width: 662 })
                .webp({ quality: 80 })
                .toFile(path.join(sampleDir, '01_plain_english_summary.webp'));
            console.log('Generated 01_plain_english_summary.webp');
        }
    }
}

main().catch(err => {
    console.error('Image conversion failed:', err);
    process.exit(1);
});
