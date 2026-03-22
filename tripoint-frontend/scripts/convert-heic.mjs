/**
 * One-off / CI: convert HEIC in public/images/new_images_2 to JPEG in public/images/new-images/
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import convert from 'heic-convert';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'public', 'images', 'new_images_2');
const OUT = join(ROOT, 'public', 'images', 'new-images');

const MAP = [
    ['citan_brakes.HEIC', 'citan-brakes.jpg'],
    ['fuel_price_on_pump.HEIC', 'fuel-price-on-pump.jpg'],
    ['transmission_service_on_9g_merc.HEIC', 'transmission-service-on-9g-merc.jpg'],
    ['using_torque_wrench_on_transmission.HEIC', 'using-torque-wrench-on-transmission.jpg'],
    ['xentry_on_mercedes_engine.HEIC', 'xentry-on-mercedes-engine.jpg'],
];

async function main() {
    await mkdir(OUT, { recursive: true });
    for (const [srcName, outName] of MAP) {
        const inputPath = join(SRC, srcName);
        const outPath = join(OUT, outName);
        try {
            const inputBuffer = await readFile(inputPath);
            const outputBuffer = await convert({
                buffer: inputBuffer,
                format: 'JPEG',
                quality: 0.85,
            });
            await writeFile(outPath, Buffer.from(outputBuffer));
            console.log(`  ✓ ${srcName} → ${outName}`);
        } catch (err) {
            console.error(`  ✗ ${srcName}:`, err.message);
            process.exitCode = 1;
        }
    }
}

main();
