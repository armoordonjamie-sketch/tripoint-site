/**
 * Build-time image optimization: WebP conversion, responsive sizes, compression.
 * Outputs to public/images/optimized/ (mirrors source structure).
 * Run before build: npm run optimize-images
 */

import { readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_DIR = join(ROOT, 'public', 'images');
const OUT_DIR = join(ROOT, 'public', 'images', 'optimized');

const WIDTHS = [640, 1024, 1536];
const WEBP_QUALITY = 82;
const JPG_QUALITY = 80;

/** Images that need responsive srcset (hero, feature, above-fold) */
const RESPONSIVE_IMAGES = new Set([
    'gallery/work-48.jpg', 'gallery/work-03.jpg', 'gallery/work-46.jpg',
    'sprinter-specialist.jpg', 'cta-bg.jpg', 'coverage-map.jpg',
    'diagnostic-callout.jpg', 'emissions-diagnostics.jpg', 'pre-purchase.jpg', 'vor-triage.jpg',
]);

function* walkDir(dir, base = '') {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const rel = join(base, e.name);
        if (e.isDirectory()) {
            if (e.name === 'optimized') continue; // skip output dir
            yield* walkDir(join(dir, e.name), rel);
        } else if (/\.(jpg|jpeg|png)$/i.test(e.name)) {
            yield { fullPath: join(dir, e.name), relPath: rel };
        }
    }
}

async function optimizeImage(fullPath, relPath) {
    const baseDir = dirname(join(OUT_DIR, relPath));
    const baseName = relPath.replace(/\.(jpg|jpeg|png)$/i, '');
    const fileName = baseName.split(/[/\\]/).pop();
    const needsResponsive = RESPONSIVE_IMAGES.has(relPath.replace(/\\/g, '/'));

    mkdirSync(baseDir, { recursive: true });

    const img = sharp(fullPath);
    const meta = await img.metadata();
    const w = meta.width ?? 1920;
    const h = meta.height ?? 1080;

    if (needsResponsive) {
        for (const width of WIDTHS) {
            const outPath = join(baseDir, `${fileName}-${width}.webp`);
            await img
                .clone()
                .resize(width, null, { withoutEnlargement: true })
                .webp({ quality: WEBP_QUALITY })
                .toFile(outPath);
        }
        const fallbackPath = join(baseDir, `${fileName}-1536.jpg`);
        await img
            .clone()
            .resize(1536, null, { withoutEnlargement: true })
            .jpeg({ quality: JPG_QUALITY })
            .toFile(fallbackPath);
    } else {
        const maxW = Math.min(1536, w);
        const outWebp = join(baseDir, `${fileName}.webp`);
        const outJpg = join(baseDir, `${fileName}.jpg`);
        await img
            .clone()
            .resize(maxW, null, { withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toFile(outWebp);
        await img
            .clone()
            .resize(maxW, null, { withoutEnlargement: true })
            .jpeg({ quality: JPG_QUALITY })
            .toFile(outJpg);
    }
}

async function main() {
    if (!existsSync(SRC_DIR)) {
        console.log('No public/images directory, skipping.');
        return;
    }
    mkdirSync(OUT_DIR, { recursive: true });

    const files = [...walkDir(SRC_DIR)];
    console.log(`Optimizing ${files.length} images...`);

    for (const { fullPath, relPath } of files) {
        try {
            await optimizeImage(fullPath, relPath);
            console.log(`  ✓ ${relPath}`);
        } catch (err) {
            console.error(`  ✗ ${relPath}:`, err.message);
        }
    }
    console.log('Done.');
}

main();
