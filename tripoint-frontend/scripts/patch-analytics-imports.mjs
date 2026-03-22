/**
 * One-off: expand analytics imports for trackBookNowClick / trackWhatsAppLead.
 * Run from tripoint-frontend: node scripts/patch-analytics-imports.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function walk(dir, out = []) {
    for (const name of readdirSync(dir)) {
        const p = join(dir, name);
        if (statSync(p).isDirectory()) {
            if (name === 'node_modules' || name === 'dist') continue;
            walk(p, out);
        } else if (/\.(tsx|ts)$/.test(name)) out.push(p);
    }
    return out;
}

function patchImport(content, needs) {
    const m = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@\/lib\/analytics['"]/);
    if (!m) return content;
    const parts = m[1].split(',').map((s) => s.trim()).filter(Boolean);
    const set = new Set(parts);
    for (const n of needs) if (n) set.add(n);
    const merged = [...set].sort();
    return content.replace(
        /import\s*\{[^}]+\}\s*from\s*['"]@\/lib\/analytics['"]/,
        `import { ${merged.join(', ')} } from '@/lib/analytics'`,
    );
}

const root = join(import.meta.dirname, '..', 'src');
const files = walk(root);

for (const p of files) {
    let s = readFileSync(p, 'utf8');
    const orig = s;
    s = s.replace(/trackEvent\('click_book_now', \{ location: ('[^']+') \}\)/g, 'trackBookNowClick($1)');
    s = s.replace(/trackEvent\('click_book_now', \{ location: `([^`]+)` \}\)/g, 'trackBookNowClick(`$1`)');
    s = s.replace(/trackEvent\('click_whatsapp', \{ location: ('[^']+') \}\)/g, 'trackWhatsAppLead($1)');
    s = s.replace(/trackEvent\('click_whatsapp', \{ location: `([^`]+)` \}\)/g, 'trackWhatsAppLead(`$1`)');
    if (s === orig) continue;
    const needs = [];
    if (s.includes('trackBookNowClick')) needs.push('trackBookNowClick');
    if (s.includes('trackWhatsAppLead')) needs.push('trackWhatsAppLead');
    if (needs.length) s = patchImport(s, needs);
    writeFileSync(p, s);
    console.log('patched', p);
}
