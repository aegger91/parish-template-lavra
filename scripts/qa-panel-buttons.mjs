import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";

const base = "http://127.0.0.1:4318";
const viewports = [360, 768, 1280];
mkdirSync("/opt/cursor/artifacts", { recursive: true });
mkdirSync("/tmp/lavra-qa", { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = [];

for (const width of viewports) {
  const context = await browser.newContext({
    viewport: { width, height: Math.round(Math.max(720, width * 1.5)) },
  });
  const page = await context.newPage();
  await page.goto(`${base}/en/services/`, { waitUntil: "networkidle" });
  await page.locator('[aria-label^="Open details"]').first().click();
  await page.waitForSelector('[data-testid="schedule-detail-panel"]');

  const info = await page.evaluate(() => {
    const panel = document.querySelector('[data-testid="schedule-detail-panel"]');
    const btns = [...panel.querySelectorAll(".schedule-panel-btn")];
    return btns.map((b) => {
      const s = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      return {
        text: (b.innerText || "").replace(/\s+/g, " ").trim(),
        fontFamily: s.fontFamily,
        textTransform: s.textTransform,
        height: Math.round(r.height * 10) / 10,
        width: Math.round(r.width * 10) / 10,
        borderTop: s.borderTopWidth,
        borderRight: s.borderRightWidth,
        borderBottom: s.borderBottomWidth,
        borderLeft: s.borderLeftWidth,
        borderRadius: s.borderRadius,
        boxShadow: s.boxShadow,
      };
    });
  });

  const shot = `/opt/cursor/artifacts/lavra-schedule-panel-${width}.png`;
  await page.locator('[data-testid="schedule-detail-panel"]').screenshot({ path: shot });
  if (width === 1280) {
    await page.locator('[data-testid="schedule-detail-panel"]').screenshot({
      path: "/opt/cursor/artifacts/lavra-schedule-panel.png",
    });
  }

  report.push({ width, buttons: info, shot });
  await context.close();
}

await browser.close();
writeFileSync("/tmp/lavra-qa/panel-buttons.json", JSON.stringify(report, null, 2));

let ok = true;
for (const row of report) {
  const texts = row.buttons.map((b) => b.text);
  if (!texts[0]?.startsWith("Add to calendar")) {
    console.error(`@${row.width}: first button text is "${texts[0]}"`);
    ok = false;
  }
  if (texts[0]?.toLowerCase().includes("app to")) {
    console.error(`@${row.width}: still reads App`);
    ok = false;
  }
  for (const b of row.buttons) {
    if (b.fontFamily.toLowerCase().includes("alegreya sc")) {
      console.error(`@${row.width}: still using Alegreya SC: ${b.fontFamily}`);
      ok = false;
    }
    const borders = [b.borderTop, b.borderRight, b.borderBottom, b.borderLeft];
    if (borders.some((x) => x !== borders[0])) {
      console.error(`@${row.width}: uneven border widths`, borders);
      ok = false;
    }
  }
  const heights = row.buttons.map((b) => b.height);
  if (Math.max(...heights) - Math.min(...heights) > 1) {
    console.error(`@${row.width}: uneven heights`, heights);
    ok = false;
  }
}

console.log(JSON.stringify(report, null, 2));
if (!ok) process.exit(1);
console.log("Panel button QA OK");
