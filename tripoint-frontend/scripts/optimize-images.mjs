/**
 * Build-time image optimization: WebP conversion, responsive sizes, compression.
 * Outputs to public/images/optimized/ (mirrors source structure).
 * Run before build: npm run optimize-images
 */

import { readdirSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

// Lower peak RAM on small VPS (OOM "Killed" during deploy); re-reads source per output.
sharp.cache(false);
sharp.concurrency(1);

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const SRC_DIR = join(PUBLIC, 'images');
const OUT_DIR = join(PUBLIC, 'images', 'optimized');
const LOGO_OUT = join(PUBLIC, 'optimized');

const WIDTHS = [320, 480, 640, 768, 1024, 1536];
const WEBP_QUALITY = 72;
const JPG_QUALITY = 75;
const AVIF_QUALITY = 50;

// Flag for AVIF generation
const GENERATE_AVIF = process.argv.includes('--avif');

/** Images that need responsive srcset (hero, feature, above-fold) */
const RESPONSIVE_IMAGES = new Set([
    'gallery/work-48.jpg', 'gallery/work-03.jpg', 'gallery/work-46.jpg',
    'sprinter-specialist.jpg', 'cta-bg.jpg', 'coverage-map.jpg',
    'diagnostic-callout.jpg', 'emissions-diagnostics.jpg', 'pre-purchase.jpg', 'vor-triage.jpg',
    'servicing-work/hero-sprinter.jpg',
    'servicing-work/hero-vito.jpg',
    'servicing-work/hero-citan.jpg',
    'servicing-work/hero-mercedes-parent.jpg',
    'blog/om654-turbo-failure/om654-turbo-compressor-split.jpeg',
]);

function* walkDir(dir, base = '') {
    if (!existsSync(dir)) return;
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
        const rel = join(base, e.name);
        if (e.isDirectory()) {
            if (e.name === 'optimized' || e.name === 'sample-report') continue; // skip output dir
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
    const normalizedRelPath = relPath.replace(/\\/g, '/');
    const needsResponsive = RESPONSIVE_IMAGES.has(normalizedRelPath) || 
        normalizedRelPath.startsWith('gallery/') || 
        normalizedRelPath.startsWith('blog/') ||
        normalizedRelPath.startsWith('sample-report/') ||
        normalizedRelPath === 'coverage-map.jpg';

    mkdirSync(baseDir, { recursive: true });

    const meta = await sharp(fullPath).metadata();
    const w = meta.width ?? 1920;

    if (needsResponsive) {
        for (const width of WIDTHS) {
            const outPathWebp = join(baseDir, `${fileName}-${width}.webp`);
            await sharp(fullPath)
                .resize(width, null, { withoutEnlargement: true })
                .webp({ quality: WEBP_QUALITY })
                .toFile(outPathWebp);
                
            if (GENERATE_AVIF) {
                const outPathAvif = join(baseDir, `${fileName}-${width}.avif`);
                await sharp(fullPath)
                    .resize(width, null, { withoutEnlargement: true })
                    .avif({ quality: AVIF_QUALITY, effort: 4 })
                    .toFile(outPathAvif);
            }
        }
        const fallbackPath = join(baseDir, `${fileName}-1536.jpg`);
        await sharp(fullPath)
            .resize(1536, null, { withoutEnlargement: true })
            .jpeg({ quality: JPG_QUALITY })
            .toFile(fallbackPath);
    } else {
        const maxW = Math.min(1536, w);
        const outWebp = join(baseDir, `${fileName}.webp`);
        const outJpg = join(baseDir, `${fileName}.jpg`);
        await sharp(fullPath)
            .resize(maxW, null, { withoutEnlargement: true })
            .webp({ quality: WEBP_QUALITY })
            .toFile(outWebp);
        await sharp(fullPath)
            .resize(maxW, null, { withoutEnlargement: true })
            .jpeg({ quality: JPG_QUALITY })
            .toFile(outJpg);
    }
}

/** Logos: 2x display size (h-14 = 56px, 2x = 112px height) */
const LOGO_FILES = ['logo-no-text-light.png', 'logo-light.png'];

async function optimizeLogo(fullPath, baseName) {
    mkdirSync(LOGO_OUT, { recursive: true });
    const img = sharp(fullPath);
    const meta = await img.metadata();
    const w = meta.width ?? 400;
    const h = meta.height ?? 400;
    const maxDim = 224; // 2x of 112px
    const scale = Math.min(1, maxDim / Math.max(w, h));
    const outW = Math.round(w * scale);
    const outH = Math.round(h * scale);
    const outPath = join(LOGO_OUT, `${baseName}.webp`);
    await img
        .resize(outW, outH, { fit: 'inside' })
        .webp({ quality: WEBP_QUALITY })
        .toFile(outPath);
}

async function main() {
    mkdirSync(OUT_DIR, { recursive: true });

    if (existsSync(SRC_DIR)) {
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
    }

    console.log('Optimizing logos...');
    for (const name of LOGO_FILES) {
        const fullPath = join(PUBLIC, name);
        if (existsSync(fullPath)) {
            try {
                await optimizeLogo(fullPath, name.replace(/\.png$/i, ''));
                console.log(`  ✓ ${name}`);
            } catch (err) {
                console.error(`  ✗ ${name}:`, err.message);
            }
        }
    }

    await ensureOgDefault();

    console.log('Done.');
}

/** Default Open Graph / Twitter image (1200×630) - social previews when page has no custom og:image */
async function ensureOgDefault() {
    const outPath = join(PUBLIC, 'og-default.jpg');
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0ea5e9"/>
      <stop offset="100%" style="stop-color:#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <text x="600" y="280" text-anchor="middle" fill="#ffffff" font-family="system-ui,sans-serif" font-size="52" font-weight="700">TriPoint Diagnostics</text>
  <text x="600" y="340" text-anchor="middle" fill="#94a3b8" font-family="system-ui,sans-serif" font-size="22">Mobile diagnostics &amp; repairs · Kent &amp; SE London</text>
</svg>`;
    try {
        await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(outPath);
        console.log('  ✓ og-default.jpg');
    } catch (err) {
        console.error('  ✗ og-default.jpg:', err.message);
    }
}

main();
