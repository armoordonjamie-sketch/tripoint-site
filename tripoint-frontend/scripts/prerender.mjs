/**
 * Build-time prerender script.
 * Run after: npm run build && npm run extract-routes && vite build --ssr src/entry-server.tsx --outDir dist/server
 *
 * Reads dist/index.html, renders each route via entry-server, injects HTML + head tags,
 * writes to dist/{path}/index.html. Also generates sitemap.xml, robots.txt, and 404.html.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const SITE_URL = 'https://tripointdiagnostics.co.uk';

const routesJsonPath = join(ROOT, 'src', 'routes.manifest.json');
const routeManifest = JSON.parse(readFileSync(routesJsonPath, 'utf8'));

// Verify that all blog posts in blogPosts.ts are in routes.ts (C2 Soft 404 check)
try {
    const blogPostsContent = readFileSync(join(ROOT, 'src', 'data', 'blogPosts.ts'), 'utf8');
    const blogSlugs = [...blogPostsContent.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
    let missing = 0;
    for (const slug of blogSlugs) {
        if (!routeManifest.find(r => r.path === `/blog/${slug}`)) {
            console.error(`ERROR: Blog post '${slug}' is missing from routes.ts! It will 404.`);
            missing++;
        }
    }
    if (missing > 0) throw new Error(`Missing ${missing} blog routes in routes.ts`);
} catch (e) {
    if (e.message.includes('Missing')) throw e;
}

function getSourceFileForRoute(routePath) {
    if (routePath === '/') return 'src/pages/HomePage.tsx';
    if (routePath === '/services') return 'src/pages/ServicesPage.tsx';
    if (routePath.startsWith('/services/')) return 'src/routes.ts'; // Could be mapped if they had individual files
    if (routePath === '/areas-covered') return 'src/pages/CoveragePage.tsx';
    if (routePath.startsWith('/areas-covered/')) return 'src/routes.ts';
    if (routePath === '/blog') return 'src/pages/BlogIndexPage.tsx';
    if (routePath.startsWith('/blog/')) return 'src/data/blogPosts.ts';
    if (routePath.startsWith('/legal/')) return 'src/routes.ts';
    const name = routePath.split('/').pop();
    if (name) {
        const componentName = name.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('') + 'Page.tsx';
        return `src/pages/${componentName}`;
    }
    return 'src/routes.ts';
}

function getGitLastMod(routePath) {
    try {
        const filePath = getSourceFileForRoute(routePath);
        const fullPath = join(ROOT, filePath);
        const output = execSync(`git log -1 --format=%cI -- "${fullPath}"`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
        if (output) return output;
    } catch (e) {}
    return new Date().toISOString();
}

async function runPrerender() {
    const template = readFileSync(join(DIST, 'index.html'), 'utf8');

    // Save the pure SPA template for NGINX to use as a fallback for non-prerendered routes (like /admin)
    // This prevents serving the prerendered HomePage HTML to /admin, which causes hydration mismatches.
    writeFileSync(join(DIST, 'app-shell.html'), template, 'utf8');
    console.log('Generated: app-shell.html (SPA fallback)');

    // Load the server render function (use pathToFileURL for Windows compatibility)
    const entryServerPath = pathToFileURL(join(DIST, 'server', 'entry-server.js')).href;
    const { render } = await import(entryServerPath);

    const indexableRoutes = routeManifest.filter((r) => r.indexable);

    for (const route of indexableRoutes) {
        const { appHtml, helmet } = await render(route.path);
        const path = route.canonicalPath || route.path || '/';
        const canonicalUrl = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
        const hreflangTags = `<link rel="alternate" hreflang="en-GB" href="${canonicalUrl}">\n<link rel="alternate" hreflang="x-default" href="${canonicalUrl}">`;
        const lcpPreload = path === '/' ? '<link rel="preload" as="image" href="/images/optimized/gallery/work-48-640.webp" imagesrcset="/images/optimized/gallery/work-48-320.webp 320w, /images/optimized/gallery/work-48-480.webp 480w, /images/optimized/gallery/work-48-640.webp 640w, /images/optimized/gallery/work-48-768.webp 768w, /images/optimized/gallery/work-48-1024.webp 1024w, /images/optimized/gallery/work-48-1536.webp 1536w" imagesizes="100vw" fetchpriority="high" type="image/webp">' : '';
        const headTags = [
            lcpPreload,
            helmet?.title?.toString?.() ?? '',
            helmet?.meta?.toString?.() ?? '',
            helmet?.link?.toString?.() ?? '',
            helmet?.script?.toString?.() ?? '',
            hreflangTags,
        ]
            .filter(Boolean)
            .join('\n');

        let html = template
            .replace('<!--head-tags-->', headTags)
            .replace('<!--app-html-->', appHtml);

        const outPath = route.path === '/' ? join(DIST, 'index.html') : join(DIST, route.path, 'index.html');
        mkdirSync(dirname(outPath), { recursive: true });
        writeFileSync(outPath, html, 'utf8');
        console.log('Prerendered:', route.path);
    }

    // 404 page (no hreflang - noindex)
    const notFound = await render('/404');
    const headTags404 = notFound.helmet
        ? [
            notFound.helmet.title?.toString?.() ?? '',
            notFound.helmet.meta?.toString?.() ?? '',
            notFound.helmet.link?.toString?.() ?? '',
        ]
            .filter(Boolean)
            .join('\n')
        : '';
    let html404 = template
        .replace('<!--head-tags-->', headTags404)
        .replace('<!--app-html-->', notFound.appHtml);
    writeFileSync(join(DIST, '404.html'), html404, 'utf8');
    console.log('Prerendered: 404.html');

    // Sitemap (lastmod = git commit time)
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexableRoutes
            .map((r) => {
                const lastmodFull = getGitLastMod(r.path);
                // Keep only YYYY-MM-DD for sitemap lastmod if it's ISO
                const lastmod = lastmodFull.split('T')[0];
                return `  <url>
    <loc>${SITE_URL}${r.canonicalPath || r.path}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
            })
            .join('\n')}
</urlset>`;
    writeFileSync(join(DIST, 'sitemap.xml'), sitemap, 'utf8');
    console.log('Generated: sitemap.xml');

    // robots.txt
    const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /pay

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: CCBot
Allow: /

User-agent: Bytespider
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
    writeFileSync(join(DIST, 'robots.txt'), robots, 'utf8');
    console.log('Generated: robots.txt');
}

runPrerender().catch((err) => {
    console.error('Prerender failed:', err);
    process.exit(1);
});
