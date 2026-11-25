// Scans the built static site for text overflow and overlap across languages and viewports.
// Run after: npm run build && npm run check:language-fit
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "out");
const reportPath = "/tmp/language-fit-report.json";
const VIEWPORTS = [360, 768, 1280];
const TEXT_SELECTOR = "p,h1,h2,h3,h4,h5,h6,a,button,label,span,li,td,th,dt,dd";

const site = JSON.parse(readFileSync(join(root, "content/site.json"), "utf8"));
const pagesJson = JSON.parse(readFileSync(join(root, "content/pages.json"), "utf8"));

function isFeatureOn(feature) {
  if (!feature) return true;
  return site.features[feature] !== false;
}

function visiblePages() {
  const pages = pagesJson.pages ?? [];
  const byId = new Map(pages.map((p) => [p.id, p]));
  const isVisible = (p) => {
    if (!isFeatureOn(p.feature)) return false;
    if (p.parentId) {
      const parent = byId.get(p.parentId);
      return parent ? isVisible(parent) : false;
    }
    return true;
  };
  return pages.filter(isVisible);
}

function pageSegments(page, all) {
  const segs = [];
  let cur = page;
  while (cur) {
    if (cur.slug) segs.unshift(cur.slug);
    cur = cur.parentId ? all.get(cur.parentId) : undefined;
  }
  return segs;
}

function pageUrl(lang, page, all) {
  const segs = pageSegments(page, all);
  return segs.length ? `/${lang}/${segs.join("/")}/` : `/${lang}/`;
}

async function waitForServer(url, attempts = 40) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server not ready at ${url}`);
}

function spawnServe(port) {
  return new Promise((resolvePromise, reject) => {
    if (!existsSync(outDir)) {
      reject(new Error(`Missing ${outDir}. Run npm run build first.`));
      return;
    }
    const child = spawn("npx", ["--yes", "serve", "out", "-l", String(port)], {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      reject(new Error(`serve exited early with code ${code}`));
    });
    waitForServer(`http://127.0.0.1:${port}/`)
      .then(() => resolvePromise(child))
      .catch(reject);
  });
}

async function scanPage(page, baseUrl, lang, path, viewport) {
  const url = `${baseUrl}${path}`;
  await page.setViewportSize({ width: viewport, height: Math.round(Math.max(800, viewport * 1.6)) });
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.evaluate(() => (document.fonts ? document.fonts.ready : null));

  const raw = await page.evaluate((sel) => {
    const nodes = Array.from(document.querySelectorAll(sel));
    const out = [];
    for (const el of nodes) {
      if (el.closest(".sr-only, [aria-hidden='true']")) continue;
      if (el.tagName === "svg" || el.closest("svg")) continue;
      // Prefer leaf-ish text nodes to avoid double-counting wrappers.
      if (el.querySelector(sel)) continue;
      const style = window.getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") continue;
      if (style.overflow === "hidden" && (style.textOverflow === "ellipsis" || el.classList.contains("truncate"))) continue;
      if ([...el.classList].some((c) => c.startsWith("line-clamp"))) continue;
      // Drop caps use a floated ::first-letter that inflates scrollHeight without clipping.
      if (el.classList.contains("drop-cap")) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) continue;
      if (rect.bottom < 0 || rect.top > window.innerHeight * 3) continue;
      const text = (el.innerText || el.textContent || "").trim();
      if (!text) continue;
      // 2px epsilon absorbs subpixel rounding from letter-spacing and font metrics.
      const overflowX = el.scrollWidth > el.clientWidth + 2;
      const overflowY = el.scrollHeight > el.clientHeight + 2;
      if (overflowX || overflowY) {
        out.push({
          overflow: true,
          overflowX,
          overflowY,
          tag: el.tagName.toLowerCase(),
          text: text.slice(0, 120),
          className: String(el.className || "").slice(0, 80),
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
          scrollH: el.scrollHeight,
          clientH: el.clientHeight,
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height,
        });
      }
    }
    return out;
  }, TEXT_SELECTOR);

  const issues = [];
  for (const item of raw) {
    issues.push({
      kind: "overflow",
      lang,
      path,
      viewport,
      tag: item.tag,
      text: item.text,
      overflowX: item.overflowX,
      overflowY: item.overflowY,
      className: item.className,
      scrollW: item.scrollW,
      clientW: item.clientW,
      scrollH: item.scrollH,
      clientH: item.clientH,
    });
  }

  const flagged = raw.filter((r) => r.overflow);
  for (let i = 0; i < flagged.length; i++) {
    for (let j = i + 1; j < flagged.length; j++) {
      const a = flagged[i];
      const b = flagged[j];
      const ix = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
      const iy = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
      const inter = ix * iy;
      const minArea = Math.min(a.width * a.height, b.width * b.height);
      if (minArea > 0 && inter / minArea > 0.25) {
        issues.push({
          kind: "overlap",
          lang,
          path,
          viewport,
          textA: a.text,
          textB: b.text,
        });
      }
    }
  }

  return issues;
}

async function main() {
  const port = 4320;
  const baseUrl = `http://127.0.0.1:${port}`;
  const langs = site.languages.map((l) => l.code);
  const all = new Map((pagesJson.pages ?? []).map((p) => [p.id, p]));
  const pageList = visiblePages();
  const urls = [];
  for (const lang of langs) {
    for (const page of pageList) {
      urls.push({ lang, path: pageUrl(lang, page, all), pageId: page.id });
    }
  }

  let server;
  try {
    server = await spawnServe(port);
  } catch (e) {
    console.error(e.message || e);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
  const context = await browser.newContext();
  const tab = await context.newPage();
  const allIssues = [];

  try {
    for (const { lang, path } of urls) {
      for (const viewport of VIEWPORTS) {
        const found = await scanPage(tab, baseUrl, lang, path, viewport);
        allIssues.push(...found);
      }
    }
  } finally {
    await browser.close();
    if (server) server.kill("SIGTERM");
  }

  const report = {
    pagesChecked: pageList.length,
    languages: langs.length,
    viewports: VIEWPORTS.length,
    combinations: urls.length * VIEWPORTS.length,
    issuesFound: allIssues.length,
    issues: allIssues,
    checkedAt: new Date().toISOString(),
  };

  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("Language fit check");
  console.log(`  pagesChecked: ${report.pagesChecked}`);
  console.log(`  languages: ${report.languages}`);
  console.log(`  viewports: ${report.viewports}`);
  console.log(`  issuesFound: ${report.issuesFound}`);
  console.log(`  report: ${reportPath}`);

  if (allIssues.length) {
    for (const issue of allIssues.slice(0, 20)) {
      console.log(`  - [${issue.kind}] ${issue.lang} ${issue.path} @${issue.viewport}: ${issue.text ?? `${issue.textA} | ${issue.textB}`}`);
    }
    if (allIssues.length > 20) console.log(`  ... and ${allIssues.length - 20} more (see report)`);
    process.exit(1);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});