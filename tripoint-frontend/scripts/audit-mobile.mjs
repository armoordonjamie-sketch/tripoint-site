import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = 'http://localhost:5174';
const OUT = path.resolve('audit-mobile');
const VIEWPORT = { width: 390, height: 844 };

const pages = [
    { slug: 'sprinter-servicing', name: 'Sprinter' },
    { slug: 'vito-servicing', name: 'Vito' },
    { slug: 'citan-servicing', name: 'Citan' },
    { slug: 'mercedes-van-servicing', name: 'Mercedes' },
    { slug: '', name: 'Services-index', url: '/services' },
];

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
});

for (const page of pages) {
    const url = page.url ?? `/services/${page.slug}`;
    const p = await context.newPage();
    await p.goto(`${BASE}${url}`, { waitUntil: 'networkidle', timeout: 60000 });
    await p.waitForTimeout(800);

    const id = page.slug || 'services';
    await p.screenshot({ path: path.join(OUT, `${id}-top.png`) });

    const hero = p.locator('section').first();
    if ((await hero.count()) > 0) {
        await hero.screenshot({ path: path.join(OUT, `${id}-hero-only.png`) });
    }

    await p.evaluate(() => window.scrollTo(0, window.innerHeight * 1.2));
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, `${id}-mid.png`) });

    const filters = p.getByText('What we actually replace', { exact: false });
    if ((await filters.count()) > 0) {
        await filters.first().scrollIntoViewIfNeeded();
        await p.waitForTimeout(300);
        await p.screenshot({ path: path.join(OUT, `${id}-filters.png`) });
    }

    await p.close();
}

await browser.close();
console.log('Saved mobile audit shots to', OUT);
