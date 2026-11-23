/**
 * Headless QA: every page × every locale × 360/768/1280
 * Checks: console errors, broken same-origin links, overflow/clip heuristics
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

const locales = ['sr', 'lat', 'en'];
const widths = [360, 768, 1280];
const routes = [
  '',
  'parish',
  'schedule',
  'slava',
  'events',
  'livestream',
  'pomen',
  'donate',
  'contact',
  '404',
  'events/parish-council',
];

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
};

function startServer() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      try {
        let urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
        if (urlPath.endsWith('/')) urlPath += 'index.html';
        let filePath = path.join(dist, urlPath);
        if (!filePath.startsWith(dist)) {
          res.writeHead(403);
          res.end('Forbidden');
          return;
        }
        if (!existsSync(filePath)) {
          // try without trailing index for files
          const alt = path.join(dist, urlPath.replace(/\/index\.html$/, '') + '.html');
          if (existsSync(alt)) filePath = alt;
          else {
            const notFound = path.join(dist, '404.html');
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            createReadStream(existsSync(notFound) ? notFound : filePath).on('error', () => {
              res.end('Not found');
            }).pipe(res);
            return;
          }
        }
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
        createReadStream(filePath).pipe(res);
      } catch {
        res.writeHead(500);
        res.end('Error');
      }
    });
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

async function checkOverflow(page) {
  return page.evaluate(() => {
    const issues = [];
    const docWidth = document.documentElement.clientWidth;
    const all = Array.from(document.querySelectorAll('body *'));
    for (const el of all) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) continue;
      if (r.right > docWidth + 1 || r.left < -1) {
        const text = (el.textContent || '').trim().slice(0, 60);
        issues.push({
          type: 'overflow-x',
          tag: el.tagName.toLowerCase(),
          class: el.className?.toString?.().slice(0, 80) || '',
          text,
          right: Math.round(r.right),
          docWidth,
        });
      }
      // clipped text heuristic: scrollWidth much larger than clientWidth on text nodes
      if (
        el.childElementCount === 0 &&
        (el.textContent || '').trim().length > 2 &&
        el.scrollWidth > el.clientWidth + 2 &&
        style.overflow !== 'hidden' &&
        style.textOverflow !== 'ellipsis'
      ) {
        // only flag if element itself clips visibly relative to viewport
        if (r.right > docWidth + 1) {
          issues.push({
            type: 'text-clip',
            tag: el.tagName.toLowerCase(),
            text: (el.textContent || '').trim().slice(0, 60),
          });
        }
      }
    }
    // dedupe
    const seen = new Set();
    return issues.filter((i) => {
      const k = `${i.type}:${i.tag}:${i.text}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    }).slice(0, 20);
  });
}

async function checkLinks(page, origin) {
  return page.evaluate((origin) => {
    const broken = [];
    for (const a of document.querySelectorAll('a[href]')) {
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
      if (href.startsWith('http') && !href.startsWith(origin)) continue;
      // skip javascript
      if (href.startsWith('javascript:')) continue;
    }
    return broken;
  }, origin);
}

async function main() {
  if (!existsSync(path.join(dist, 'sr', 'index.html'))) {
    console.error('dist/ missing — run npm run build first');
    process.exit(1);
  }

  const { server, port } = await startServer();
  const origin = `http://127.0.0.1:${port}`;
  const browser = await chromium.launch({ headless: true });
  const results = [];
  let failures = 0;
  let checks = 0;

  try {
    for (const locale of locales) {
      for (const route of routes) {
        const urlPath = route ? `/${locale}/${route}/` : `/${locale}/`;
        for (const width of widths) {
          checks++;
          const page = await browser.newPage({
            viewport: { width, height: 900 },
          });
          const consoleErrors = [];
          page.on('pageerror', (err) => consoleErrors.push(String(err)));
          page.on('console', (msg) => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
          });

          const failedRequests = [];
          page.on('response', (res) => {
            const u = res.url();
            if (!u.startsWith(origin)) return;
            if (res.status() >= 400) failedRequests.push({ url: u, status: res.status() });
          });

          let status = 'ok';
          const notes = [];
          try {
            const res = await page.goto(origin + urlPath, {
              waitUntil: 'networkidle',
              timeout: 30000,
            });
            if (!res || res.status() >= 400) {
              status = 'fail';
              notes.push(`navigation status ${res?.status()}`);
            }

            // broken in-page links (same origin)
            const hrefs = await page.$$eval('a[href]', (as) =>
              as.map((a) => a.getAttribute('href')).filter(Boolean),
            );
            for (const href of hrefs) {
              if (
                href.startsWith('#') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                href.startsWith('javascript:') ||
                href.startsWith('http')
              ) {
                continue;
              }
              const abs = new URL(href, origin + urlPath).pathname;
              // map to file
              let file = path.join(dist, abs);
              if (abs.endsWith('/')) file = path.join(file, 'index.html');
              else if (!path.extname(file)) file = path.join(dist, abs, 'index.html');
              if (!existsSync(file) && !existsSync(path.join(dist, abs + '.html'))) {
                // allow external-looking relative that 404 page handles — still flag
                notes.push(`broken-link:${href}`);
                status = 'fail';
              }
            }

            const overflow = await checkOverflow(page);
            // filter known harmless (sticky header offscreen bits etc.)
            const realOverflow = overflow.filter((o) => {
              if (o.class?.includes('skip-link')) return false;
              return true;
            });
            if (realOverflow.length) {
              status = 'fail';
              notes.push(`overflow:${realOverflow.length}`);
              notes.push(JSON.stringify(realOverflow.slice(0, 3)));
            }

            if (consoleErrors.length) {
              status = 'fail';
              notes.push(`console:${consoleErrors.slice(0, 3).join(' | ')}`);
            }
            if (failedRequests.length) {
              status = 'fail';
              notes.push(
                `req:${failedRequests
                  .slice(0, 5)
                  .map((r) => `${r.status} ${r.url.replace(origin, '')}`)
                  .join(', ')}`,
              );
            }
          } catch (e) {
            status = 'fail';
            notes.push(String(e));
          }

          if (status === 'fail') failures++;
          results.push({ locale, route: route || 'home', width, status, notes });
          await page.close();
          const mark = status === 'ok' ? '✓' : '✗';
          console.log(`${mark} ${locale} ${route || 'home'} @${width}${notes.length ? ' — ' + notes[0] : ''}`);
        }
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  const summary = { checks, failures, passed: checks - failures };
  await import('node:fs/promises').then((fs) =>
    fs.writeFile(path.join(root, 'scripts/qa-report.json'), JSON.stringify({ summary, results }, null, 2)),
  );
  console.log('\nQA summary:', summary);
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
