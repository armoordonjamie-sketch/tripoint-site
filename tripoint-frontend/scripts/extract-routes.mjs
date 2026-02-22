/**
 * Extracts route manifest from routes.ts to JSON for the prerender script.
 * Uses dynamic import - run with Node that can load TS, or we read and eval.
 * Simpler: use a static import of the built file. But routes.ts is TS.
 *
 * Alternative: use import with a loader. Node 18+ can use --experimental-strip-types.
 * Or we use a simple approach: the routes.ts file is the source. We run this script
 * with: node --experimental-strip-types scripts/extract-routes.mjs
 * That requires Node 22+. Or we use tsx.
 *
 * Simplest: output the routes as a static JSON. We'll use a different approach:
 * run this as: npx tsx -e "
 *   import { routeManifest } from './src/routes';
 *   import { writeFileSync } from 'fs';
 *   writeFileSync('./src/routes.manifest.json', JSON.stringify(routeManifest, null, 2));
 * "
 *
 * We'll add that as an npm script. This file can be a simple runner.
 */
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Dynamic import of routes - requires tsx or similar to handle .ts
// We'll use import() with a path. In Node 20+, we can use import attributes.
// For maximum compatibility, we use a workaround: the prerender will be run
// after "npm run build", and we can add a step that compiles routes to a simple
// JS file. Actually, the cleanest: use tsx for the prerender. So we have:
// "prerender": "npx tsx scripts/prerender.ts"
// And prerender.ts imports from '../src/routes'.
// Let me convert prerender to .ts and have it import routes directly.
// This extract script becomes unnecessary - we delete it and use prerender.ts with tsx.

// For now, this script will be run by tsx to generate the JSON
async function main() {
    const { routeManifest } = await import('../src/routes.ts');
    const outPath = join(ROOT, 'src', 'routes.manifest.json');
    writeFileSync(outPath, JSON.stringify(routeManifest, null, 2), 'utf8');
    console.log('Wrote', outPath);
}

main().catch(console.error);
