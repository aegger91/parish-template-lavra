// Layout QA for every language and width: sideways overflow, clipped or overlapping text,
// nav alignment across languages, sticky header opacity and stacking, mobile menu, tap targets.
// Usage: node scripts/qa-layout.mjs --base http://127.0.0.1:4318 --out /tmp/qa-layout [--shots dir] [--pages home,services]
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, all) => (cur.startsWith("--") ? [...acc, [cur.slice(2), all[i + 1]]] : acc), []),
);
const BASE = args.base ?? "http://127.0.0.1:4318";
const OUT = args.out ?? "/tmp/qa-layout";
const SHOTS = args.shots ?? null;
const WIDTHS = (args.widths ?? "360,375,390,414,768,1024,1440").split(",").map(Number);
const TOUCH_MAX = 1023;
const MIN_TAP = 44;

const site = JSON.parse(readFileSync(join(root, "content/site.json"), "utf8"));
const pages = JSON.parse(readFileSync(join(root, "content/pages.json"), "utf8")).pages;
const byId = new Map(pages.map((p) => [p.id, p]));
const visible = (p) => site.features[p.feature] !== false && (!p.parentId || visible(byId.get(p.parentId)));
const pathOf = (p) => {
  const segs = [];
  for (let c = p; c; c = c.parentId ? byId.get(c.parentId) : undefined) if (c.slug) segs.unshift(c.slug);
  return segs.length ? `/${segs.join("/")}/` : "/";
};
const pageFilter = args.pages ? new Set(args.pages.split(",")) : null;
const PAGES = pages.filter(visible).filter((p) => !pageFilter || pageFilter.has(p.id));
const LANGS = site.languages.map((l) => l.code);

mkdirSync(OUT, { recursive: true });
if (SHOTS) mkdirSync(SHOTS, { recursive: true });

/* ---------- in-page probes ---------- */

const initScript = () => {
  window.__cls = 0;
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
    }).observe({ type: "layout-shift", buffered: true });
  } catch {
    /* unsupported */
  }
};

function headerProbe() {
  const header = document.querySelector("header");
  if (!header) return { missing: true };
  const bar = header.querySelector("[data-header-bar]") ?? header.lastElementChild;
  const alpha = (c) => {
    if (c === "transparent") return 0;
    const slash = c.match(/\/\s*([\d.]+)(%?)\s*\)$/);
    if (slash) return parseFloat(slash[1]) / (slash[2] ? 100 : 1);
    const rgba = c.match(/^rgba\(([^)]+)\)/);
    if (rgba) return parseFloat(rgba[1].split(",")[3]);
    return 1;
  };
  const hr = header.getBoundingClientRect();
  const br = bar.getBoundingClientRect();
  const top = Math.max(0, hr.top);
  const bottom = Math.min(innerHeight, hr.bottom);
  const issues = [];
  for (let el = bar; el && el !== document.documentElement; el = el.parentElement) {
    const s = getComputedStyle(el);
    if (parseFloat(s.opacity) < 1) issues.push(`opacity ${s.opacity} on ${el.tagName}`);
    if (el === bar || el === header) {
      if (s.backdropFilter && s.backdropFilter !== "none") issues.push(`backdrop-filter on ${el.tagName}`);
    }
  }
  if (alpha(getComputedStyle(bar).backgroundColor) < 0.999) issues.push(`bar background not opaque: ${getComputedStyle(bar).backgroundColor}`);
  let seeThrough = 0;
  let samples = 0;
  const z = getComputedStyle(header).zIndex;
  if (bottom - top > 2) {
    for (let yi = 0; yi < 6; yi++) {
      const y = top + 1 + ((bottom - top - 2) * yi) / 5;
      for (let xi = 0; xi < 12; xi++) {
        const x = 2 + ((innerWidth - 4) * xi) / 11;
        samples++;
        const hit = document.elementFromPoint(x, y);
        if (!hit) continue;
        if (!header.contains(hit)) {
          if (hit.closest("[role=dialog],[data-slot=sheet-overlay],[data-slot=sheet-content],[role=menu],[data-base-ui-portal]")) continue;
          seeThrough++;
          if (issues.length < 12) issues.push(`content at (${Math.round(x)},${Math.round(y)}) shows through header: ${hit.tagName}.${String(hit.className).slice(0, 40)}`);
          continue;
        }
        let opaque = false;
        for (let el = hit; el; el = el.parentElement) {
          const s = getComputedStyle(el);
          if (alpha(s.backgroundColor) >= 0.999 || s.backgroundImage !== "none" || el.tagName === "svg") {
            opaque = true;
            break;
          }
          if (el === header) break;
        }
        if (!opaque) {
          seeThrough++;
          if (issues.length < 12) issues.push(`transparent header pixel at (${Math.round(x)},${Math.round(y)})`);
        }
      }
    }
  }
  return {
    scrollY: Math.round(scrollY),
    headerTop: Math.round(hr.top * 10) / 10,
    headerHeight: Math.round(hr.height * 10) / 10,
    barTop: Math.round(br.top * 10) / 10,
    barHeight: Math.round(br.height * 10) / 10,
    zIndex: z,
    seeThrough,
    samples,
    issues,
  };
}

function layoutProbe({ touch, minTap }) {
  const vw = document.documentElement.clientWidth;
  const out = { hOverflow: null, clipped: [], overflowX: [], offscreen: [], overlaps: [], taps: [] };
  if (document.documentElement.scrollWidth > vw + 1 || document.body.scrollWidth > vw + 1) {
    out.hOverflow = { scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth, vw };
  }
  const shown = (el) => {
    if (el.closest(".sr-only,[aria-hidden='true'],[hidden],template")) return false;
    for (let a = el; a; a = a.parentElement) {
      const s = getComputedStyle(a);
      if (s.display === "none" || s.visibility === "hidden" || parseFloat(s.opacity) === 0) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width >= 1 && r.height >= 1;
  };
  const label = (el) => `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""} "${(el.innerText || el.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 60)}"`;
  const TEXT = "p,h1,h2,h3,h4,h5,h6,a,button,label,span,li,td,th,dt,dd,figcaption,summary,legend,small,strong,em,time,address";
  const leaves = [];
  for (const el of document.querySelectorAll(TEXT)) {
    if (el.closest("svg")) continue;
    if (el.querySelector(TEXT)) continue;
    const text = (el.innerText || "").trim();
    if (!text) continue;
    if (!shown(el)) continue;
    leaves.push(el);
  }
  for (const el of leaves) {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    if (s.display !== "inline" && el.scrollWidth > el.clientWidth + 2 && !el.classList.contains("drop-cap")) {
      out.overflowX.push({ el: label(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth });
    }
    const inScroller = (() => {
      for (let a = el.parentElement; a; a = a.parentElement) {
        const ps = getComputedStyle(a);
        if (/(auto|scroll)/.test(ps.overflowX)) return true;
      }
      return false;
    })();
    if (!inScroller && (r.right > vw + 1 || r.left < -1)) out.offscreen.push({ el: label(el), left: Math.round(r.left), right: Math.round(r.right) });
    if (s.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) out.clipped.push({ el: label(el), reason: "truncated with ellipsis" });
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const ps = getComputedStyle(a);
      if (/(auto|scroll)/.test(ps.overflowX + ps.overflowY)) break;
      const clipX = /(hidden|clip)/.test(ps.overflowX);
      const clipY = /(hidden|clip)/.test(ps.overflowY);
      if (!clipX && !clipY) continue;
      const ar = a.getBoundingClientRect();
      const cutX = clipX && (r.left < ar.left - 1 || r.right > ar.right + 1);
      const cutY = clipY && (r.top < ar.top - 1 || r.bottom > ar.bottom + 1);
      if (cutX || cutY) {
        out.clipped.push({ el: label(el), reason: `cut by ${a.tagName.toLowerCase()}.${String(a.className).slice(0, 50)}` });
        break;
      }
    }
  }
  const frags = leaves
    .filter((el) => getComputedStyle(el).position !== "absolute")
    .map((el) => ({ el, rs: [...el.getClientRects()].filter((r) => r.width > 1 && r.height > 1) }))
    .filter(({ rs }) => rs.length && rs[0].bottom > -innerHeight && rs[0].top < innerHeight * 8);
  const hit = (a, b) => {
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (ix <= 2 || iy <= 2) return false;
    return (ix * iy) / Math.min(a.width * a.height, b.width * b.height) > 0.2;
  };
  for (let i = 0; i < frags.length; i++) {
    for (let j = i + 1; j < frags.length; j++) {
      const a = frags[i];
      const b = frags[j];
      if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
      if (a.rs.some((ra) => b.rs.some((rb) => hit(ra, rb)))) out.overlaps.push({ a: label(a.el), b: label(b.el) });
    }
  }
  if (touch) {
    const sel = "a[href],button,[role=button],[role=tab],[role=menuitem],[role=radio],[role=checkbox],select,input:not([type=hidden]),textarea,summary";
    for (const el of document.querySelectorAll(sel)) {
      if (!shown(el)) continue;
      if (el.closest("[data-qa-skip-tap]")) continue;
      const s = getComputedStyle(el);
      if ((el.tagName === "INPUT" || el.getAttribute("role") === "radio") && el.closest("label")) continue;
      if (el.tagName === "INPUT" && (el.type === "radio" || el.type === "checkbox") && (s.opacity === "0" || el.offsetWidth < 2)) continue;
      if (s.display === "inline") {
        const parentText = (el.parentElement?.innerText || "").trim().length;
        const ownText = (el.innerText || "").trim().length;
        if (parentText > ownText + 3) continue;
      }
      const r = el.getBoundingClientRect();
      if (r.height < minTap - 0.5 || r.width < minTap - 0.5) {
        out.taps.push({ el: label(el), w: Math.round(r.width), h: Math.round(r.height), cls: String(el.className).slice(0, 60) });
      }
    }
  }
  return out;
}

function anchorsProbe() {
  const q = (s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width) return null;
    return { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 };
  };
  const header = document.querySelector("header");
  const bar = header.querySelector("[data-header-bar]") ?? header.lastElementChild;
  const row = bar.firstElementChild;
  const navItems = [...bar.querySelectorAll("nav > ul > li")].filter((li) => li.getBoundingClientRect().width > 0);
  const navTops = navItems.map((li) => Math.round(li.getBoundingClientRect().top));
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return r.width ? { x: Math.round(r.left * 10) / 10, y: Math.round(r.top * 10) / 10, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10 } : null;
  };
  const parts = [...row.children].map((c) => {
    const r = c.getBoundingClientRect();
    return { x: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), h: Math.round(r.height), display: getComputedStyle(c).display };
  });
  return {
    header: q("header"),
    bar: box(bar),
    logo: box(row.firstElementChild),
    nav: box(bar.querySelector("nav ul")),
    parts,
    navRows: new Set(navTops).size,
    navOverflow: (() => {
      const ul = bar.querySelector("nav ul");
      return ul && ul.getBoundingClientRect().width ? ul.scrollWidth > ul.clientWidth + 1 : false;
    })(),
    h1: q("main h1"),
    heroCta: q("main .btn-primary"),
  };
}

/* ---------- runner ---------- */

const report = { base: BASE, widths: WIDTHS, langs: LANGS, pages: PAGES.map((p) => p.id), results: [], align: [], menu: [], switching: [] };

// Tap or click where the element is on screen. Locator.click() first scrolls sticky elements to their in-flow position.
async function press(page, locator) {
  const b = await locator.boundingBox();
  const x = b.x + b.width / 2;
  const y = b.y + b.height / 2;
  if (page.qaTouch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

async function settle(page) {
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(150);
}

async function scrollThrough(page) {
  const vh = page.viewportSize().height;
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = [];
  for (let y = 0; y <= total; y += Math.round(vh * 0.6)) steps.push(y);
  for (let y = 0; y <= 160; y += 8) steps.push(y);
  const samples = [];
  for (const y of steps) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(60);
    samples.push(await page.evaluate(headerProbe));
  }
  const scrolled = samples.filter((s) => s.scrollY > 200);
  const barHeights = new Set(samples.map((s) => s.barHeight));
  const headerHeights = new Set(samples.map((s) => s.headerHeight));
  const stuckTops = new Set(scrolled.map((s) => s.barTop));
  const issues = [...new Set(samples.flatMap((s) => s.issues))];
  return {
    seeThrough: samples.reduce((a, s) => a + s.seeThrough, 0),
    samples: samples.reduce((a, s) => a + s.samples, 0),
    barHeights: [...barHeights],
    headerHeights: [...headerHeights],
    stuckBarTops: [...stuckTops],
    zIndex: samples[0]?.zIndex,
    issues: issues.slice(0, 10),
    ok:
      samples.every((s) => s.seeThrough === 0) &&
      barHeights.size === 1 &&
      scrolled.every((s) => s.barTop === 0) &&
      issues.length === 0,
  };
}

async function runWidth(browser, width) {
  const height = width < 768 ? 800 : width < 1200 ? 1000 : 900;
  const ctx = await browser.newContext({ viewport: { width, height }, hasTouch: width <= TOUCH_MAX, isMobile: width < 768, deviceScaleFactor: 1 });
  await ctx.addInitScript(initScript);
  const page = await ctx.newPage();
  page.qaTouch = width <= TOUCH_MAX;
  for (const p of PAGES) {
    const anchorsByLang = {};
    for (const lang of LANGS) {
      const url = `${BASE}/${lang}${pathOf(p)}`;
      await page.goto(url, { waitUntil: "networkidle" });
      await settle(page);
      anchorsByLang[lang] = await page.evaluate(anchorsProbe);
      const header = await scrollThrough(page);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(900);
      const layout = await page.evaluate(layoutProbe, { touch: width <= TOUCH_MAX, minTap: MIN_TAP });
      const cls = await page.evaluate(() => Math.round(window.__cls * 1000) / 1000);
      report.results.push({ page: p.id, lang, width, url, header, layout, cls });
    }
    const langs = Object.keys(anchorsByLang);
    const ref = anchorsByLang[langs[0]];
    const diffs = [];
    for (const lang of langs.slice(1)) {
      const a = anchorsByLang[lang];
      if (a.bar?.h !== ref.bar?.h) diffs.push(`${lang}: header bar height ${a.bar?.h} vs ${ref.bar?.h}`);
      if (a.header?.h !== ref.header?.h) diffs.push(`${lang}: header height ${a.header?.h} vs ${ref.header?.h}`);
      if (a.logo && ref.logo && (Math.abs(a.logo.x - ref.logo.x) > 1 || Math.abs(a.logo.h - ref.logo.h) > 1 || (width >= 1280 && Math.abs(a.logo.w - ref.logo.w) > 1)))
        diffs.push(`${lang}: logo box ${JSON.stringify(a.logo)} vs ${JSON.stringify(ref.logo)}`);
      a.parts.forEach((pt, i) => {
        const rp = ref.parts[i];
        if (!rp || pt.display === "none") return;
        if (i === 0 && Math.abs(pt.x - rp.x) > 1) diffs.push(`${lang}: header column ${i} starts at ${pt.x} vs ${rp.x}`);
        if (i === 1 && Math.abs(pt.x + pt.w / 2 - (rp.x + rp.w / 2)) > 1) diffs.push(`${lang}: nav column centre ${pt.x + pt.w / 2} vs ${rp.x + rp.w / 2}`);
        if (i === a.parts.length - 1 && Math.abs(pt.right - rp.right) > 1) diffs.push(`${lang}: actions end at ${pt.right} vs ${rp.right}`);
      });
      if (a.navRows > 1) diffs.push(`${lang}: nav wraps to ${a.navRows} rows`);
      if (a.navOverflow) diffs.push(`${lang}: nav overflows its box`);
      if (a.h1 && ref.h1 && Math.abs(a.h1.x - ref.h1.x) > 1) diffs.push(`${lang}: h1 starts at ${a.h1.x} vs ${ref.h1.x}`);
    }
    if (ref.navRows > 1) diffs.push(`${langs[0]}: nav wraps to ${ref.navRows} rows`);
    if (ref.navOverflow) diffs.push(`${langs[0]}: nav overflows its box`);
    report.align.push({ page: p.id, width, ok: diffs.length === 0, diffs, anchors: anchorsByLang });
  }

  // Screenshots, mobile menu and language switching on the home page.
  for (const lang of LANGS) {
    await page.goto(`${BASE}/${lang}/`, { waitUntil: "networkidle" });
    await settle(page);
    if (SHOTS) await page.screenshot({ path: join(SHOTS, `${lang}-${width}-1-top.png`) });
    const imgY = await page.evaluate(() => {
      const img = document.querySelector("#home-hero figure img");
      return img ? img.getBoundingClientRect().top + scrollY - 40 : 600;
    });
    await page.evaluate((y) => window.scrollTo(0, y), imgY);
    await page.waitForTimeout(500);
    if (SHOTS) await page.screenshot({ path: join(SHOTS, `${lang}-${width}-2-over-image.png`) });
    const cardsY = await page.evaluate(() => {
      const s = document.querySelector("main section:nth-of-type(2) ol, main section:nth-of-type(2)");
      return s ? s.getBoundingClientRect().top + scrollY - 60 : 1400;
    });
    await page.evaluate((y) => window.scrollTo(0, y), cardsY);
    await page.waitForTimeout(250);
    if (SHOTS) await page.screenshot({ path: join(SHOTS, `${lang}-${width}-3-over-animated-cards.png`) });

    if (width < 1280) {
      const before = await page.evaluate(() => {
        const r = document.querySelector("header").getBoundingClientRect();
        return { top: r.top, h: r.height, w: r.width, sy: scrollY };
      });
      await press(page, page.locator("header [data-slot=sheet-trigger]"));
      await page.waitForSelector("[data-slot=sheet-content]", { state: "visible" });
      await page.waitForTimeout(450);
      const menu = await page.evaluate((MIN) => {
        const sheet = document.querySelector("[data-slot=sheet-content]");
        const sr = sheet.getBoundingClientRect();
        const h = document.querySelector("header").getBoundingClientRect();
        const small = [];
        for (const el of sheet.querySelectorAll("a[href],button")) {
          const r = el.getBoundingClientRect();
          if (!r.width) continue;
          if (r.height < MIN - 0.5 || r.width < MIN - 0.5) small.push(`${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40)} ${Math.round(r.width)}x${Math.round(r.height)}`);
        }
        const overflowing = [...sheet.querySelectorAll("*")].filter((el) => {
          const r = el.getBoundingClientRect();
          return r.width && (r.right > sr.right + 1 || r.left < sr.left - 1);
        }).length;
        return {
          sheet: { left: Math.round(sr.left), right: Math.round(sr.right), w: Math.round(sr.width) },
          vw: document.documentElement.clientWidth,
          header: { top: h.top, h: h.height, w: h.width },
          sy: scrollY,
          small,
          overflowing,
          docOverflow: document.documentElement.scrollWidth > innerWidth + 1,
        };
      }, MIN_TAP);
      if (SHOTS) await page.screenshot({ path: join(SHOTS, `${lang}-${width}-4-menu-open.png`) });
      const shift = Math.abs(menu.header.top - before.top) > 0.5 || Math.abs(menu.header.w - before.w) > 0.5 || menu.sy !== before.sy;
      report.menu.push({
        lang,
        width,
        ...menu,
        headerShift: shift,
        ok: !shift && menu.small.length === 0 && menu.overflowing === 0 && !menu.docOverflow && menu.sheet.right <= menu.vw + 1 && menu.sheet.left >= -1,
      });
      await page.keyboard.press("Escape");
      await page.waitForTimeout(350);
    }
  }

  // Click the language switcher and confirm the page and layout stay put.
  await page.goto(`${BASE}/${LANGS[0]}/services/`, { waitUntil: "networkidle" });
  await settle(page);
  for (const lang of [...LANGS.slice(1), LANGS[0]]) {
    const beforeAnchors = await page.evaluate(anchorsProbe);
    if (width >= 768) {
      await press(page, page.locator(`header a[hreflang="${lang}"]`).first());
    } else {
      await press(page, page.locator("header [data-slot=sheet-trigger]"));
      await page.waitForSelector("[data-slot=sheet-content]", { state: "visible" });
      await page.waitForTimeout(300);
      await press(page, page.locator(`[data-slot=sheet-content] a[hreflang="${lang}"]`));
    }
    await page.waitForURL(`**/${lang}/services/`);
    await page.waitForLoadState("networkidle");
    await settle(page);
    const after = await page.evaluate(anchorsProbe);
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    const sheetOpen = await page.locator("[data-slot=sheet-content]").isVisible().catch(() => false);
    const diffs = [];
    if (after.bar?.h !== beforeAnchors.bar?.h) diffs.push(`bar height ${beforeAnchors.bar?.h} -> ${after.bar?.h}`);
    if (after.logo && beforeAnchors.logo && Math.abs(after.logo.h - beforeAnchors.logo.h) > 1) diffs.push(`logo height ${beforeAnchors.logo.h} -> ${after.logo.h}`);
    if (width >= 1280 && after.logo && beforeAnchors.logo && Math.abs(after.logo.w - beforeAnchors.logo.w) > 1) diffs.push(`logo width ${beforeAnchors.logo.w} -> ${after.logo.w}`);
    if (after.parts[1] && beforeAnchors.parts[1] && after.parts[1].display !== "none" && Math.abs(after.parts[1].x + after.parts[1].w / 2 - (beforeAnchors.parts[1].x + beforeAnchors.parts[1].w / 2)) > 1) diffs.push("nav column moved");
    if (after.navRows > 1) diffs.push("nav wraps");
    if (sheetOpen) diffs.push("menu stayed open after switching");
    report.switching.push({ width, to: lang, htmlLang, url: page.url(), diffs, ok: diffs.length === 0 });
  }
  await ctx.close();
}

const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || undefined });
try {
  await Promise.all(WIDTHS.map((w) => runWidth(browser, w)));
} finally {
  await browser.close();
}

const count = (f) => report.results.filter(f).length;
const summary = {
  combinations: report.results.length,
  horizontalOverflow: count((r) => r.layout.hOverflow),
  textOverflowX: report.results.reduce((a, r) => a + r.layout.overflowX.length, 0),
  textOffscreen: report.results.reduce((a, r) => a + r.layout.offscreen.length, 0),
  textClipped: report.results.reduce((a, r) => a + r.layout.clipped.length, 0),
  textOverlaps: report.results.reduce((a, r) => a + r.layout.overlaps.length, 0),
  smallTapTargets: report.results.reduce((a, r) => a + r.layout.taps.length, 0),
  headerFailures: count((r) => !r.header.ok),
  headerSeeThroughSamples: report.results.reduce((a, r) => a + r.header.seeThrough, 0),
  maxCLS: Math.max(...report.results.map((r) => r.cls)),
  alignmentFailures: report.align.filter((a) => !a.ok).length,
  mobileMenuFailures: report.menu.filter((m) => !m.ok).length,
  languageSwitchFailures: report.switching.filter((s) => !s.ok).length,
};
report.summary = summary;
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(summary, null, 2));
const failing = Object.entries(summary).filter(([k, v]) => k !== "combinations" && k !== "maxCLS" && v > 0);
process.exit(failing.length || summary.maxCLS > 0.05 ? 1 : 0);
