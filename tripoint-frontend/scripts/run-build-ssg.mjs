/**
 * Routes `npm run build:ssg` to the full pipeline or `build:ssg:skip-images` when
 * SKIP_IMAGE_OPTIMIZE=1 (OOM on small VPS). Works without deploy.sh changes.
 */
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skip = process.env.SKIP_IMAGE_OPTIMIZE === '1';
const script = skip ? 'build:ssg:skip-images' : 'build:ssg:full';

if (skip) {
    console.log(
        '>>> SKIP_IMAGE_OPTIMIZE=1 - skipping npm run optimize-images (ensure public/images/optimized and public/optimized exist).'
    );
}

try {
    execSync(`npm run ${script}`, { stdio: 'inherit', cwd: root, env: process.env, shell: true });
} catch (e) {
    process.exit(typeof e.status === 'number' ? e.status : 1);
}
