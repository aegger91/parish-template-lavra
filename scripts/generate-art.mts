/*
  Draws the template's placeholder artwork as SVG files in public/images,
  the favicon, and a short sample sermon tone in public/media.
  Every cross comes from src/components/orthodox/cross-geometry.ts.

  Run: npm run art
*/
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { crossSvg } from "../src/components/orthodox/cross-geometry.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = (rel: string, data: string | Buffer) => {
  const p = join(root, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, data);
  console.log("wrote", rel);
};

const C = {
  lapis: "#24497c",
  lapisDeep: "#152f55",
  lapisSky: "#2f5b93",
  ochre: "#c48a2c",
  ochreLight: "#ecd09a",
  ochreDeep: "#8a5a22",
  terracotta: "#b0502b",
  cinnabar: "#a32c1b",
  stone: "#ead6ab",
  brick: "#b5573a",
  ink: "#2a1c12",
  gold: "#d4a43a",
  goldLight: "#f0cf75",
  parchment: "#f2e6cc",
  wood: "#7a4a26",
  woodDark: "#4a2a16",
  cypress: "#2f4a33",
  lead: "#5f7487",
};

function svg(w: number, h: number, defs: string, body: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${body}</svg>\n`;
}

function grain(id: string, freq = 0.85, alpha = 0.1, tint = [0.35, 0.24, 0.12], seed = 3) {
  return `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 ${tint[0]} 0 0 0 0 ${tint[1]} 0 0 0 0 ${tint[2]} 0 0 0 ${alpha} 0"/></filter>`;
}

const wallPattern = `<pattern id="band" width="22" height="16" patternUnits="userSpaceOnUse"><rect width="22" height="16" fill="${C.stone}"/><rect y="12" width="22" height="4" fill="${C.brick}"/><path d="M11 0V12" stroke="#d3b986" stroke-width="1.2"/></pattern>`;

const glowFilter = `<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;

function arcRow(x0: number, x1: number, y: number, r: number, stroke: string, w = 2.5) {
  let d = `M${x0} ${y}`;
  for (let x = x0; x + 2 * r <= x1 + 0.01; x += 2 * r) d += ` a${r} ${r} 0 0 1 ${2 * r} 0`;
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}"/>`;
}

function archedWindow(x: number, y: number, w: number, h: number, fill: string) {
  const r = w / 2;
  return `<path d="M${x} ${y} V${y - h + r} a${r} ${r} 0 0 1 ${w} 0 V${y} Z" fill="${fill}"/>`;
}

/** Morava-school church seen from the west, 400 wide, ground at y=0. */
function church({ snow = false, lit = false, dome = C.lead }: { snow?: boolean; lit?: boolean; dome?: string } = {}) {
  const win = lit ? "#ffcf6e" : "#2b1d14";
  const tile = "#9c4a2a";
  const parts: string[] = [];
  if (lit) parts.push(`<g filter="url(#glow)" opacity=".8" fill="#ffb84a"><circle cx="200" cy="-180" r="30"/><circle cx="85" cy="-95" r="22"/><circle cx="315" cy="-95" r="22"/><circle cx="200" cy="-340" r="26"/></g>`);
  parts.push(`<rect x="40" y="-150" width="320" height="150" fill="url(#band)"/>`);
  parts.push(`<path d="M40 -150 Q40 -200 130 -206 V-150 Z" fill="url(#band)"/><path d="M360 -150 Q360 -200 270 -206 V-150 Z" fill="url(#band)"/>`);
  parts.push(`<path d="M130 0 V-230 A70 70 0 0 1 270 -230 V0 Z" fill="url(#band)"/>`);
  parts.push(`<path d="M34 -148 Q34 -206 132 -212" fill="none" stroke="${tile}" stroke-width="11" stroke-linecap="round"/><path d="M366 -148 Q366 -206 268 -212" fill="none" stroke="${tile}" stroke-width="11" stroke-linecap="round"/>`);
  parts.push(`<path d="M122 -228 A78 78 0 0 1 278 -228" fill="none" stroke="${tile}" stroke-width="12" stroke-linecap="round"/>`);
  parts.push(arcRow(46, 126, -150, 5, C.brick) + arcRow(274, 354, -150, 5, C.brick));
  parts.push(`<rect x="160" y="-392" width="80" height="112" fill="url(#band)"/>`);
  parts.push(arcRow(160, 240, -392, 10, tile, 6));
  parts.push([172, 194, 216].map((x) => archedWindow(x, -308, 12, 54, win)).join(""));
  parts.push(`<path d="M156 -394 A44 40 0 0 1 244 -394 Z" fill="${dome}"/><path d="M168 -398 A34 32 0 0 1 200 -428" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="5" stroke-linecap="round"/>`);
  parts.push(`<path d="M200 -434 V-398 M178 -428 Q190 -414 186 -397 M222 -428 Q210 -414 214 -397" stroke="#2c3a46" stroke-opacity=".35" stroke-width="2" fill="none"/>`);
  if (snow) parts.push(`<path d="M158 -396 A42 38 0 0 1 242 -396" fill="none" stroke="#fbfdff" stroke-width="7" stroke-linecap="round"/><path d="M122 -234 A78 78 0 0 1 278 -234" fill="none" stroke="#fbfdff" stroke-width="7" stroke-linecap="round"/><path d="M34 -154 Q34 -210 132 -218 M366 -154 Q366 -210 268 -218" fill="none" stroke="#fbfdff" stroke-width="7" stroke-linecap="round"/>`);
  parts.push(`<circle cx="200" cy="-438" r="5.5" fill="${C.gold}"/>`);
  parts.push(crossSvg("slavic", 181, -505, 64, C.gold, `stroke="${C.ochreDeep}" stroke-width=".6"`));
  parts.push(`<path d="M170 -58 A30 30 0 0 1 230 -58" fill="none" stroke="#f0dfb8" stroke-width="9"/><path d="M170 -58 A30 30 0 0 1 230 -58" fill="none" stroke="${C.brick}" stroke-width="9" stroke-dasharray="7 5"/>`);
  parts.push(`<path d="M178 0 V-58 A22 22 0 0 1 222 -58 V0 Z" fill="#4a2a18"/><path d="M200 -80 V0" stroke="#2e180c" stroke-width="2"/>`);
  parts.push(`<path d="M182 -96 A18 18 0 0 1 218 -96 Z" fill="${C.gold}"/>` + crossSvg("byzantine", 194, -110, 12, C.cinnabar));
  parts.push(`<circle cx="200" cy="-178" r="23" fill="#f3e2bb" stroke="${C.brick}" stroke-width="5"/>`);
  parts.push(`<g stroke="${C.brick}" stroke-width="2.4">${Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return `<path d="M${(200 + Math.cos(a) * 6).toFixed(1)} ${(-178 + Math.sin(a) * 6).toFixed(1)} L${(200 + Math.cos(a) * 19).toFixed(1)} ${(-178 + Math.sin(a) * 19).toFixed(1)}"/>`;
  }).join("")}</g><circle cx="200" cy="-178" r="5" fill="${lit ? "#ffcf6e" : C.brick}"/>`);
  for (const x of [68, 298]) {
    parts.push(`<path d="M${x - 4} -70 V-106 A19 19 0 0 1 ${x + 38} -106 V-70" fill="none" stroke="#f0dfb8" stroke-width="6"/><path d="M${x - 4} -106 A19 19 0 0 1 ${x + 38} -106" fill="none" stroke="${C.brick}" stroke-width="6" stroke-dasharray="5 4"/>`);
    parts.push(archedWindow(x + 2, -70, 12, 40, win) + archedWindow(x + 20, -70, 12, 40, win));
  }
  parts.push(`<rect x="30" y="-10" width="340" height="10" fill="#cdb48a"/>`);
  return parts.join("");
}

function bellTower({ snow = false } = {}) {
  const bell = (x: number, y: number) => `<path d="M${x} ${y} c0 -14 4 -22 10 -22 s10 8 10 22 h3 v3 h-26 v-3 z" fill="#b8862d" stroke="#6b4a14" stroke-width="1.2"/>`;
  return [
    `<rect x="20" y="-380" width="100" height="380" fill="url(#band)"/>`,
    arcRow(20, 120, -380, 10, "#9c4a2a", 6),
    `<path d="M24 -250 V-310 A19 19 0 0 1 62 -310 V-250 Z M78 -250 V-310 A19 19 0 0 1 116 -310 V-250 Z" fill="#24170f"/>`,
    bell(33, -262),
    bell(87, -262),
    `<path d="M34 -322 h12 M88 -322 h12" stroke="#6b4a14" stroke-width="2"/>`,
    archedWindow(58, -140, 24, 60, "#24170f"),
    `<rect x="40" y="-432" width="60" height="54" fill="url(#band)"/>`,
    `<path d="M36 -432 A34 30 0 0 1 104 -432 Z" fill="${C.lead}"/>`,
    snow ? `<path d="M38 -434 A32 28 0 0 1 102 -434" fill="none" stroke="#fbfdff" stroke-width="6"/>` : "",
    `<circle cx="70" cy="-465" r="4.5" fill="${C.gold}"/>`,
    crossSvg("slavic", 55, -520, 50, C.gold),
    `<path d="M52 0 V-40 A18 18 0 0 1 88 -40 V0 Z" fill="#4a2a18"/>`,
    `<rect x="12" y="-8" width="116" height="8" fill="#cdb48a"/>`,
  ].join("");
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Iconographic fresco rock: irregular ledges with slanted, lit tops and a leaning peak. */
function steppedRock(x: number, baseY: number, width: number, height: number, steps: number, lean: number, palette = { body: "#c9974a", top: C.ochreLight, shade: "#8a5a2b" }) {
  const r = rng(Math.round(x * 7 + width * 3 + height));
  const parts: string[] = [];
  const h = height / (steps + 0.6);
  const f = (n: number) => n.toFixed(1);
  for (let i = 0; i < steps; i++) {
    const w = width * (1 - (i / steps) * 0.72) * (0.86 + r() * 0.24);
    const cx = x + lean * i + (r() - 0.5) * width * 0.07;
    const y1 = baseY - i * h;
    const tilt = (r() - 0.5) * h * 0.9 + (lean > 0 ? -h * 0.15 : h * 0.15);
    const yl = y1 - h - 8 + tilt;
    const yr = y1 - h - 8 - tilt;
    const l = cx - w / 2;
    const rt = cx + w / 2;
    const a = l + w * (0.04 + r() * 0.06);
    const b = rt - w * (0.06 + r() * 0.08);
    parts.push(`<path d="M${f(l)} ${f(y1)} L${f(a)} ${f(yl)} L${f(b)} ${f(yr)} L${f(rt)} ${f(y1)} Z" fill="${palette.body}" stroke="#5b3a1c" stroke-width="2.2" stroke-linejoin="round"/>`);
    parts.push(`<path d="M${f(a)} ${f(yl)} L${f(b)} ${f(yr)} L${f(b - 6)} ${f(yr + 10)} L${f(a + 5)} ${f(yl + 10)} Z" fill="${palette.top}"/>`);
    parts.push(`<path d="M${f(b)} ${f(yr)} L${f(rt)} ${f(y1)} L${f(rt - w * 0.12)} ${f(y1)} L${f(b - w * 0.08)} ${f(yr + 10)} Z" fill="${palette.shade}" opacity=".6"/>`);
    const cracks = 1 + Math.floor(r() * 3);
    for (let k = 0; k < cracks; k++) {
      const cxk = a + (b - a) * (0.2 + r() * 0.6);
      parts.push(`<path d="M${f(cxk)} ${f(Math.min(yl, yr) + 14 + (Math.abs(yl - yr) / 2))} l${f((r() - 0.5) * 14)} ${f(h * (0.35 + r() * 0.3))}" stroke="#6b4422" stroke-width="2" stroke-linecap="round" opacity=".55"/>`);
    }
  }
  const topY = baseY - steps * h;
  const pw = width * 0.2;
  const px = x + lean * steps;
  parts.push(`<path d="M${f(px - pw / 2)} ${f(topY)} L${f(px + lean * 0.8 - pw * 0.1)} ${f(topY - h * 1.3)} L${f(px + lean * 0.8 + pw * 0.12)} ${f(topY - h * 1.2)} L${f(px + pw / 2)} ${f(topY)} Z" fill="${palette.body}" stroke="#5b3a1c" stroke-width="2.2" stroke-linejoin="round"/>`);
  parts.push(`<path d="M${f(px + lean * 0.8 - pw * 0.1)} ${f(topY - h * 1.3)} L${f(px + lean * 0.8 + pw * 0.12)} ${f(topY - h * 1.2)} L${f(px + lean * 0.8 + pw * 0.06)} ${f(topY - h * 1.1)} L${f(px + lean * 0.8 - pw * 0.12)} ${f(topY - h * 1.18)} Z" fill="${palette.top}"/>`);
  return parts.join("");
}

function cypress(x: number, y: number, h: number) {
  const w = h * 0.22;
  return `<path d="M${x} ${y - h} C${x + w * 0.7} ${y - h * 0.7} ${x + w * 0.6} ${y - h * 0.2} ${x + w * 0.35} ${y} H${x - w * 0.35} C${x - w * 0.6} ${y - h * 0.2} ${x - w * 0.7} ${y - h * 0.7} ${x} ${y - h} Z" fill="${C.cypress}"/><path d="M${x} ${y - h * 0.9} C${x + w * 0.3} ${y - h * 0.6} ${x + w * 0.25} ${y - h * 0.3} ${x + w * 0.1} ${y - h * 0.05}" stroke="#4f6e4f" stroke-width="3" fill="none"/>`;
}

function star8(cx: number, cy: number, r: number, fill: string) {
  const pts: string[] = [];
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8 - Math.PI / 2;
    const rr = i % 2 ? r * 0.42 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}"/>`;
}

function plasterOverlay(w: number, h: number) {
  return `<rect width="${w}" height="${h}" filter="url(#grain)"/><rect width="${w}" height="${h}" filter="url(#blotch)"/>`;
}
const plasterDefs = grain("grain", 0.8, 0.12, [0.95, 0.9, 0.75], 5) + grain("blotch", 0.006, 0.18, [0.98, 0.92, 0.8], 11);

/* ------------------------------ hero ------------------------------ */
function hero() {
  const W = 1600;
  const H = 1000;
  const defs = [
    wallPattern,
    glowFilter,
    plasterDefs,
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.lapisDeep}"/><stop offset=".55" stop-color="${C.lapis}"/><stop offset="1" stop-color="${C.lapisSky}"/></linearGradient>`,
    `<radialGradient id="heaven" cx=".5" cy="0" r=".5"><stop offset="0" stop-color="#9fb7d9"/><stop offset=".5" stop-color="#5a7fae"/><stop offset="1" stop-color="#5a7fae" stop-opacity="0"/></radialGradient>`,
    `<linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d7a3a"/><stop offset="1" stop-color="#5b5a2a"/></linearGradient>`,
  ].join("");
  const rays = Array.from({ length: 9 }, (_, i) => {
    const a = Math.PI * (0.25 + (i / 8) * 0.5);
    return `<path d="M800 0 L${(800 + Math.cos(a) * 520).toFixed(0)} ${(Math.sin(a) * 520).toFixed(0)}" stroke="#f0cf75" stroke-opacity=".28" stroke-width="5"/>`;
  }).join("");
  const body = [
    `<rect width="${W}" height="${H}" fill="url(#sky)"/>`,
    `<ellipse cx="800" cy="0" rx="300" ry="170" fill="url(#heaven)"/>`,
    `<path d="M560 0 A240 120 0 0 0 1040 0 Z" fill="#3b6aa6" opacity=".7"/><path d="M640 0 A160 80 0 0 0 960 0 Z" fill="#7d9fcc" opacity=".7"/>`,
    rays,
    [[160, 120], [300, 230], [1310, 160], [1460, 260], [420, 90], [1180, 90], [90, 320], [1520, 380]].map(([x, y], i) => star8(x, y, 7 + (i % 3) * 2, C.goldLight)).join(""),
    steppedRock(260, 900, 640, 560, 7, 26),
    steppedRock(1360, 900, 660, 600, 7, -28),
    steppedRock(520, 905, 360, 260, 4, 18, { body: "#b9874a", top: "#f0d7a1", shade: "#7a4e25" }),
    steppedRock(1090, 905, 380, 280, 4, -18, { body: "#b9874a", top: "#f0d7a1", shade: "#7a4e25" }),
    `<path d="M0 860 C300 830 520 845 800 840 S1300 830 1600 860 V1000 H0 Z" fill="url(#ground)"/>`,
    `<path d="M360 870 H1240 V846 H360 Z" fill="#d9c08f"/>` + arcRow(360, 1240, 846, 10, "#b5573a", 3),
    `<g transform="translate(520 862) scale(1.4)">${church()}</g>`,
    `<g transform="translate(1138 862) scale(0.92)">${bellTower()}</g>`,
    cypress(470, 868, 230),
    cypress(420, 872, 170),
    cypress(1300, 870, 250),
    cypress(1360, 874, 180),
    `<g stroke="#3d4a22" stroke-width="3" fill="none" opacity=".7">${Array.from({ length: 26 }, (_, i) => {
      const x = 40 + i * 61;
      const y = 930 + (i % 3) * 18;
      return `<path d="M${x} ${y} q4 -16 10 -22 M${x + 8} ${y} q2 -12 -4 -20 M${x + 14} ${y} q6 -10 12 -14"/>`;
    }).join("")}</g>`,
    plasterOverlay(W, H),
    `<path d="M0 0 H${W} V${H} H0 Z" fill="none" stroke="#f6ead0" stroke-opacity=".5" stroke-width="6"/>`,
  ].join("");
  return svg(W, H, defs, body);
}

/* ------------------------------ logo ------------------------------ */
function logoIcon() {
  const S = 512;
  const defs = [
    wallPattern,
    grain("grain", 0.9, 0.16, [0.55, 0.38, 0.12], 2),
    `<linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8bf5a"/><stop offset=".5" stop-color="#d4a43a"/><stop offset="1" stop-color="#b9832a"/></linearGradient>`,
  ].join("");
  const body = [
    `<rect width="${S}" height="${S}" fill="#f3e6c8"/>`,
    `<rect x="26" y="26" width="460" height="460" fill="url(#leaf)"/>`,
    `<path d="M166 30 A90 54 0 0 0 346 30 Z" fill="${C.lapis}"/><path d="M204 30 A52 30 0 0 0 308 30 Z" fill="#5a7fae"/>`,
    `<rect x="26" y="26" width="460" height="460" fill="none" stroke="${C.cinnabar}" stroke-width="8"/>`,
    `<rect x="40" y="40" width="432" height="432" fill="none" stroke="#fff4d6" stroke-opacity=".7" stroke-width="2"/>`,
    steppedRock(140, 456, 210, 120, 3, 10, { body: "#7d8a4a", top: "#b8c07a", shade: "#4c5628" }),
    steppedRock(372, 456, 210, 120, 3, -10, { body: "#7d8a4a", top: "#b8c07a", shade: "#4c5628" }),
    `<path d="M40 456 H472 V472 H40 Z" fill="#5f6a34"/>`,
    `<g transform="translate(116 452) scale(0.7)">${church()}</g>`,
    `<rect width="${S}" height="${S}" filter="url(#grain)"/>`,
  ].join("");
  return svg(S, S, defs, body);
}

/* ------------------------------ favicon ------------------------------ */
function favicon() {
  return svg(64, 64, "", `<rect width="64" height="64" rx="12" fill="${C.parchment}"/><rect x="3" y="3" width="58" height="58" rx="9" fill="none" stroke="${C.ochre}" stroke-width="2"/>${crossSvg("slavic", 17.6, 8, 48, C.cinnabar)}`);
}

/* ------------------------------ gallery ------------------------------ */
const GW = 1200;
const GH = 900;
const galleryDefs = (extra = "") => [wallPattern, glowFilter, plasterDefs, extra].join("");

function churchWinter() {
  const defs = galleryDefs(`<linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f2140"/><stop offset="1" stop-color="#2b4a78"/></linearGradient>`);
  const stars = Array.from({ length: 40 }, (_, i) => {
    const x = (i * 337) % GW;
    const y = 30 + ((i * 151) % 360);
    return `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * 0.8}" fill="#fff6dc" opacity="${0.5 + (i % 4) * 0.12}"/>`;
  }).join("");
  const trees = [140, 1050].map((x) => `<path d="M${x} 760 V560 M${x} 640 l-50 -60 M${x} 620 l46 -70 M${x} 600 l-30 -50 M${x} 680 l38 -40" stroke="#2a2420" stroke-width="7" stroke-linecap="round" fill="none"/>`).join("");
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="url(#night)"/>`,
    stars,
    `<circle cx="980" cy="140" r="46" fill="#f6ecd0"/><circle cx="998" cy="128" r="44" fill="#13264a"/>`,
    `<path d="M0 760 C260 730 520 745 760 740 S1050 735 1200 760 V900 H0 Z" fill="#eef3f8"/>`,
    `<g transform="translate(360 770) scale(1.2)">${church({ snow: true, lit: true })}</g>`,
    trees,
    `<path d="M600 900 C590 850 610 810 600 772" stroke="#c9d6e2" stroke-width="22" fill="none" stroke-dasharray="14 18"/>`,
    plasterOverlay(GW, GH),
  ].join(""));
}

function bellTowerScene() {
  const defs = galleryDefs(`<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9c98e"/><stop offset="1" stop-color="#f6e6c4"/></linearGradient>`);
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="url(#dusk)"/>`,
    steppedRock(240, 800, 520, 300, 5, 20, { body: "#c7a46a", top: "#f3e1b7", shade: "#93703d" }),
    steppedRock(980, 800, 560, 320, 5, -20, { body: "#c7a46a", top: "#f3e1b7", shade: "#93703d" }),
    `<path d="M0 790 H1200 V900 H0 Z" fill="#8c8a4a"/>`,
    `<g transform="translate(470 800) scale(1.45)">${bellTower()}</g>`,
    cypress(380, 800, 260),
    cypress(820, 800, 220),
    plasterOverlay(GW, GH),
  ].join(""));
}

function iconPanel(x: number, y: number, w: number, h: number, inner: string) {
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#6b3f1f"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="${C.gold}"/><rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 16}" fill="none" stroke="${C.cinnabar}" stroke-width="3"/>${inner}</g>`;
}

/** Bust in icon colors without facial detail, as seen from across the nave. */
function iconBust(cx: number, top: number, robe: string, mantle: string, opts: { cruciform?: boolean; stars?: boolean; letters: [string, string] }) {
  const halo = `<circle cx="${cx}" cy="${top + 58}" r="46" fill="#f0cf75" stroke="#9c6b1c" stroke-width="2"/>`;
  const cruci = opts.cruciform ? `<path d="M${cx} ${top + 12} V${top + 30} M${cx - 46} ${top + 58} H${cx - 30} M${cx + 30} ${top + 58} H${cx + 46}" stroke="${C.cinnabar}" stroke-width="7"/>` : "";
  const face = `<ellipse cx="${cx}" cy="${top + 60}" rx="22" ry="27" fill="#c99a6a"/>`;
  const veil = opts.stars ? `<path d="M${cx - 34} ${top + 140} C${cx - 40} ${top + 70} ${cx - 30} ${top + 24} ${cx} ${top + 24} S${cx + 40} ${top + 70} ${cx + 34} ${top + 140} Z" fill="${mantle}"/>` + `<ellipse cx="${cx}" cy="${top + 62}" rx="20" ry="25" fill="#c99a6a"/>` : face + `<path d="M${cx - 24} ${top + 50} C${cx - 26} ${top + 26} ${cx + 26} ${top + 26} ${cx + 24} ${top + 50} C${cx + 18} ${top + 40} ${cx - 18} ${top + 40} ${cx - 24} ${top + 50} Z" fill="#5b3a22"/>`;
  const shoulders = `<path d="M${cx - 70} ${top + 210} C${cx - 66} ${top + 130} ${cx - 34} ${top + 104} ${cx} ${top + 104} S${cx + 66} ${top + 130} ${cx + 70} ${top + 210} Z" fill="${robe}"/><path d="M${cx - 70} ${top + 210} C${cx - 64} ${top + 140} ${cx - 40} ${top + 112} ${cx - 10} ${top + 108} L${cx + 20} ${top + 210} Z" fill="${mantle}"/>`;
  const stars = opts.stars ? [star8(cx, top + 34, 6, C.goldLight), star8(cx - 44, top + 140, 6, C.goldLight), star8(cx + 44, top + 140, 6, C.goldLight)].join("") : "";
  const letters = `<g font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700" fill="${C.cinnabar}" text-anchor="middle"><text x="${cx - 74}" y="${top + 40}">${opts.letters[0]}</text><text x="${cx + 74}" y="${top + 40}">${opts.letters[1]}</text></g><path d="M${cx - 88} ${top + 16} h28 M${cx + 60} ${top + 16} h28" stroke="${C.cinnabar}" stroke-width="2.5"/>`;
  return halo + cruci + shoulders + veil + stars + letters;
}

function iconostasis() {
  const defs = galleryDefs(`<radialGradient id="nave" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#5a3a22"/><stop offset="1" stop-color="#1e130c"/></radialGradient>`);
  const doors = `<path d="M520 820 V500 A80 80 0 0 1 680 500 V820 Z" fill="${C.gold}" stroke="#6b3f1f" stroke-width="10"/><path d="M600 420 V820" stroke="#6b3f1f" stroke-width="6"/><circle cx="560" cy="560" r="26" fill="#f0cf75" stroke="${C.cinnabar}" stroke-width="3"/><circle cx="640" cy="560" r="26" fill="#f0cf75" stroke="${C.cinnabar}" stroke-width="3"/>${crossSvg("byzantine", 547, 547, 26, C.cinnabar)}${crossSvg("byzantine", 627, 547, 26, C.cinnabar)}<path d="M536 660 h48 v120 h-48z M616 660 h48 v120 h-48z" fill="none" stroke="#9c6b1c" stroke-width="3"/>`;
  // Facing the iconostasis: the Theotokos is to the LEFT of the Royal Doors, Christ to the RIGHT.
  const theotokos = iconPanel(320, 470, 190, 350, `<g>${iconBust(415, 520, "#2f4f7a", "#7a2a22", { stars: true, letters: ["ΜΡ", "ΘΥ"] })}</g>`);
  const christ = iconPanel(690, 470, 190, 350, `<g>${iconBust(785, 520, "#8a2a1e", "#2f4f7a", { cruciform: true, letters: ["IC", "XC"] })}</g>`);
  const deacon = (x: number) => iconPanel(x, 520, 120, 300, `<circle cx="${x + 60}" cy="600" r="30" fill="#f0cf75" stroke="#9c6b1c" stroke-width="2"/>${crossSvg("byzantine", x + 46, 672, 28, C.cinnabar)}`);
  const festal = Array.from({ length: 8 }, (_, i) => iconPanel(250 + i * 88, 330, 80, 80, `<circle cx="${290 + i * 88}" cy="366" r="16" fill="#f0cf75" stroke="#9c6b1c" stroke-width="1.5"/>`)).join("");
  const lamps = [415, 785].map((x) => `<path d="M${x} 300 V440" stroke="#b8862d" stroke-width="2"/><path d="M${x - 16} 440 h32 c0 16 -8 26 -16 26 s-16 -10 -16 -26z" fill="#b8231a"/><circle cx="${x}" cy="436" r="12" fill="#ffcf6e" filter="url(#glow)"/>`).join("");
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="url(#nave)"/>`,
    `<rect x="170" y="300" width="860" height="540" fill="#8a5a2b"/>`,
    `<path d="M170 300 H1030" stroke="${C.gold}" stroke-width="10"/>`,
    festal,
    `<path d="M220 300 Q600 160 980 300" fill="none" stroke="${C.gold}" stroke-width="12"/>`,
    crossSvg("slavic", 564, 150, 120, C.gold, `stroke="#6b3f1f" stroke-width=".6"`),
    deacon(190),
    theotokos,
    doors,
    christ,
    deacon(890),
    lamps,
    `<path d="M0 840 H1200 V900 H0 Z" fill="#3a2516"/>`,
    `<path d="M0 840 H1200" stroke="#6b4a2a" stroke-width="4"/>`,
    plasterOverlay(GW, GH),
  ].join(""));
}

function starryVault() {
  const defs = galleryDefs(`<radialGradient id="vault" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#2f5b93"/><stop offset=".75" stop-color="${C.lapisDeep}"/><stop offset="1" stop-color="#0d1d38"/></radialGradient>`);
  const cx = 600;
  const cy = 450;
  const stars: string[] = [];
  for (let ring = 1; ring <= 4; ring++) {
    const r = 120 + ring * 70;
    const n = 10 + ring * 6;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ring * 0.3;
      stars.push(star8(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 9 - ring, C.goldLight));
    }
  }
  const windows = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const x = cx + Math.cos(a) * 425;
    const y = cy + Math.sin(a) * 425;
    return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="18" ry="34" transform="rotate(${((a * 180) / Math.PI + 90).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" fill="#fff3d0" opacity=".85"/>`;
  }).join("");
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="#3a2516"/>`,
    `<circle cx="${cx}" cy="${cy}" r="470" fill="#d9c08f"/>`,
    windows,
    `<circle cx="${cx}" cy="${cy}" r="400" fill="url(#vault)" stroke="${C.cinnabar}" stroke-width="10"/>`,
    `<circle cx="${cx}" cy="${cy}" r="388" fill="none" stroke="#f6ead0" stroke-width="3"/>`,
    stars.join(""),
    `<circle cx="${cx}" cy="${cy}" r="110" fill="${C.gold}" stroke="${C.cinnabar}" stroke-width="8"/><circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="#fff4d6" stroke-width="2"/>`,
    crossSvg("byzantine", cx - 60, cy - 60, 120, C.cinnabar),
    plasterOverlay(GW, GH),
  ].join(""));
}

function candleStand() {
  const defs = galleryDefs(`<radialGradient id="warm" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#6b4220"/><stop offset="1" stop-color="#1c110a"/></radialGradient><radialGradient id="flame" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#fff6d0"/><stop offset=".5" stop-color="#ffc861"/><stop offset="1" stop-color="#ff9a2e" stop-opacity="0"/></radialGradient>`);
  const tapers: string[] = [];
  for (let i = 0; i < 17; i++) {
    const x = 380 + i * 27 + (i % 2) * 6;
    const h = 120 + ((i * 53) % 90);
    tapers.push(`<rect x="${x}" y="${470 - h}" width="9" height="${h}" fill="#e6c27a"/><circle cx="${x + 4.5}" cy="${458 - h}" r="26" fill="url(#flame)"/><path d="M${x + 4.5} ${446 - h} c4 6 5 10 5 13 a5 5 0 0 1 -10 0 c0 -3 1 -7 5 -13z" fill="#fff1c0"/>`);
  }
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="url(#warm)"/>`,
    `<ellipse cx="600" cy="300" rx="380" ry="220" fill="#ffb84a" opacity=".18" filter="url(#glow)"/>`,
    tapers.join(""),
    `<ellipse cx="600" cy="480" rx="270" ry="34" fill="#c9973a" stroke="#7a5418" stroke-width="5"/><ellipse cx="600" cy="472" rx="250" ry="24" fill="#e2d2a6"/>`,
    `<path d="M585 512 h30 l10 260 h-50 z" fill="#b8862d" stroke="#7a5418" stroke-width="4"/>`,
    `<ellipse cx="600" cy="790" rx="130" ry="26" fill="#b8862d" stroke="#7a5418" stroke-width="4"/>`,
    plasterOverlay(GW, GH),
  ].join(""));
}

function egg(cx: number, cy: number, rx: number, ry: number, fill: string, extra = "", rot = 0) {
  return `<g transform="rotate(${rot} ${cx} ${cy})"><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}"/><ellipse cx="${cx - rx * 0.35}" cy="${cy - ry * 0.4}" rx="${rx * 0.2}" ry="${ry * 0.28}" fill="#fff" opacity=".25"/>${extra}</g>`;
}

function paschaEggs() {
  const defs = galleryDefs(`<pattern id="stitch" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#f6efe0"/><path d="M20 6 L34 20 L20 34 L6 20 Z" fill="none" stroke="${C.cinnabar}" stroke-width="4"/><path d="M20 15 v10 M15 20 h10" stroke="${C.cinnabar}" stroke-width="3"/></pattern>`);
  const weave = Array.from({ length: 12 }, (_, i) => `<path d="M${260 + i * 58} 560 Q${280 + i * 58} 700 ${290 + i * 52} 800" stroke="#7a5418" stroke-width="5" fill="none"/>`).join("");
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="#5a3a22"/>`,
    `<path d="M0 640 H1200 V900 H0 Z" fill="#f6efe0"/>`,
    `<rect x="0" y="690" width="1200" height="70" fill="url(#stitch)"/>`,
    `<path d="M220 560 H980 L900 820 H300 Z" fill="#c9973a" stroke="#7a5418" stroke-width="6"/>`,
    weave,
    `<path d="M240 590 H960 M260 650 H940 M280 710 H920 M296 770 H904" stroke="#a37628" stroke-width="5"/>`,
    egg(380, 520, 70, 92, "#b8231a", "", -12),
    egg(520, 500, 72, 94, "#a51f17", `<text x="520" y="520" font-family="Georgia, serif" font-size="56" font-weight="700" fill="#f6e1b0" text-anchor="middle">ХВ</text>`, 4),
    egg(670, 510, 70, 92, "#c02a1e", crossSvg("slavic", 648, 470, 72, "#f6e1b0"), -4),
    egg(815, 525, 68, 90, "#9e1d16", "", 10),
    egg(600, 590, 66, 86, "#b8231a", "", 0),
    `<path d="M220 560 H980" stroke="#7a5418" stroke-width="10"/>`,
    plasterOverlay(GW, GH),
  ].join(""));
}

function gospelBook() {
  const defs = galleryDefs();
  const corner = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="38" fill="#f0cf75" stroke="#8a5a22" stroke-width="4"/><circle cx="${x}" cy="${y}" r="28" fill="${C.lapis}"/>${star8(x, y, 14, C.goldLight)}`;
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="#3a2516"/>`,
    `<path d="M0 520 H1200 V900 H0 Z" fill="#8a1f16"/><path d="M0 520 H1200" stroke="${C.gold}" stroke-width="10"/><path d="M0 548 H1200" stroke="${C.gold}" stroke-width="3"/>`,
    `<rect x="400" y="150" width="400" height="560" rx="10" fill="#8a5a22"/>`,
    `<rect x="414" y="160" width="372" height="540" rx="6" fill="${C.gold}" stroke="#8a5a22" stroke-width="6"/>`,
    `<rect x="440" y="186" width="320" height="488" fill="none" stroke="#fff1c4" stroke-width="3"/>`,
    corner(470, 216),
    corner(730, 216),
    corner(470, 644),
    corner(730, 644),
    `<circle cx="600" cy="430" r="110" fill="#f0cf75" stroke="#8a5a22" stroke-width="5"/>`,
    crossSvg("byzantine", 530, 360, 140, C.cinnabar, `stroke="#5b1a10" stroke-width="1"`),
    [[600, 290], [600, 570], [470, 430], [730, 430]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="10" fill="#b8231a" stroke="#f6e1b0" stroke-width="2"/>`).join(""),
    [230, 970].map((x) => `<rect x="${x - 14}" y="230" width="28" height="300" fill="#e6c27a"/><path d="M${x} 196 c10 14 13 22 13 28 a13 13 0 0 1 -26 0 c0 -6 3 -14 13 -28z" fill="#ffd27a"/><circle cx="${x}" cy="214" r="40" fill="#ffb84a" opacity=".35" filter="url(#glow)"/><rect x="${x - 40}" y="530" width="80" height="20" fill="#b8862d"/>`).join(""),
    plasterOverlay(GW, GH),
  ].join(""));
}

function refectory() {
  const defs = galleryDefs();
  const bread = (x: number) => `<ellipse cx="${x}" cy="586" rx="46" ry="22" fill="#c98a3d"/><path d="M${x - 30} 580 q30 -18 60 0" stroke="#8a5a22" stroke-width="3" fill="none"/>`;
  const bowl = (x: number) => `<path d="M${x - 34} 590 h68 c0 22 -16 34 -34 34 s-34 -12 -34 -34z" fill="#b0502b"/><path d="M${x - 34} 590 h68" stroke="#7a3016" stroke-width="3"/>`;
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="#e8d3a8"/>`,
    `<path d="M0 0 H1200 V80 H0 Z" fill="#c9a876"/>` + arcRow(0, 1200, 80, 30, "#b5573a", 5),
    [200, 600, 1000].map((x) => `<path d="M${x - 70} 460 V230 A70 70 0 0 1 ${x + 70} 230 V460 Z" fill="#f6ecd0" stroke="#b5573a" stroke-width="10"/><path d="M${x} 160 V460 M${x - 70} 320 H${x + 70}" stroke="#b5573a" stroke-width="5"/>`).join(""),
    iconPanel(370, 170, 90, 110, `<circle cx="415" cy="210" r="22" fill="#f0cf75" stroke="#9c6b1c" stroke-width="2"/>${crossSvg("byzantine", 403, 236, 24, C.cinnabar)}`),
    `<path d="M415 120 V290" stroke="#b8862d" stroke-width="2"/><path d="M403 290 h24 c0 12 -6 20 -12 20 s-12 -8 -12 -20z" fill="#b8231a"/><circle cx="415" cy="288" r="10" fill="#ffcf6e" filter="url(#glow)"/>`,
    `<path d="M0 520 H1200 V900 H0 Z" fill="#8a6a44"/>`,
    `<rect x="80" y="560" width="1040" height="60" fill="${C.wood}"/><rect x="80" y="550" width="1040" height="14" fill="#9c6436"/>`,
    `<rect x="80" y="550" width="1040" height="8" fill="#f6efe0"/>`,
    [150, 1050].map((x) => `<rect x="${x}" y="620" width="30" height="200" fill="${C.woodDark}"/>`).join(""),
    `<rect x="120" y="700" width="960" height="30" fill="${C.woodDark}"/>`,
    bread(300),
    bread(760),
    bowl(470),
    bowl(600),
    bowl(900),
    `<path d="M1000 600 V520 c0 -20 40 -20 40 0 V600 z" fill="#c9973a"/><path d="M1040 535 c18 0 18 30 0 30" stroke="#c9973a" stroke-width="6" fill="none"/>`,
    plasterOverlay(GW, GH),
  ].join(""));
}

function garden() {
  const defs = galleryDefs(`<linearGradient id="day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb7d9"/><stop offset="1" stop-color="#f3e6c8"/></linearGradient>`);
  const rows = Array.from({ length: 6 }, (_, i) => {
    const y = 650 + i * 40;
    return `<path d="M60 ${y} H1140" stroke="#6b5a2a" stroke-width="10"/>` + Array.from({ length: 22 }, (_, j) => `<circle cx="${80 + j * 50 + (i % 2) * 25}" cy="${y - 8}" r="${10 + (j % 3) * 2}" fill="${i % 2 ? "#6f8a3c" : "#4f6e3a"}"/>`).join("");
  }).join("");
  const hive = (x: number) => `<rect x="${x}" y="560" width="70" height="80" fill="#e2c27a" stroke="#7a5418" stroke-width="4"/><path d="M${x - 8} 560 L${x + 35} 528 L${x + 78} 560 Z" fill="#b0502b"/><path d="M${x} 590 h70 M${x} 615 h70" stroke="#7a5418" stroke-width="3"/><rect x="${x + 26}" y="626" width="18" height="8" fill="#4a2a16"/>`;
  return svg(GW, GH, defs, [
    `<rect width="${GW}" height="${GH}" fill="url(#day)"/>`,
    steppedRock(200, 520, 520, 260, 5, 18, { body: "#a8a070", top: "#d8d2a2", shade: "#6f6a44" }),
    steppedRock(1020, 520, 520, 260, 5, -18, { body: "#a8a070", top: "#d8d2a2", shade: "#6f6a44" }),
    `<g transform="translate(456 540) scale(0.72)">${church()}</g>`,
    `<path d="M0 520 H1200 V900 H0 Z" fill="#9c8a4e"/>`,
    `<path d="M0 540 H1200" stroke="#d9c08f" stroke-width="18"/>` + arcRow(0, 1200, 540, 9, "#b5573a", 3),
    cypress(150, 560, 240),
    cypress(1060, 560, 260),
    hive(260),
    hive(360),
    hive(820),
    rows,
    plasterOverlay(GW, GH),
  ].join(""));
}

/* ------------------------------ store ------------------------------ */
const SW = 800;
const storeDefs = (extra = "") => [grain("grain", 0.9, 0.1, [0.4, 0.3, 0.15], 9), `<radialGradient id="linen" cx=".5" cy=".42" r=".7"><stop offset="0" stop-color="#fbf5e6"/><stop offset="1" stop-color="#e8dcc0"/></radialGradient>`, `<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>`, glowFilter, extra].join("");
function product(body: string, extraDefs = "", shadow = { cx: 400, cy: 690, rx: 230, ry: 26 }) {
  return svg(SW, SW, storeDefs(extraDefs), [`<rect width="${SW}" height="${SW}" fill="url(#linen)"/>`, `<ellipse cx="${shadow.cx}" cy="${shadow.cy}" rx="${shadow.rx}" ry="${shadow.ry}" fill="#5b4634" opacity=".28" filter="url(#soft)"/>`, body, `<rect width="${SW}" height="${SW}" filter="url(#grain)"/>`].join(""));
}

function iconCross() {
  return product([
    `<rect x="200" y="110" width="400" height="560" rx="8" fill="${C.wood}"/>`,
    `<rect x="222" y="132" width="356" height="516" fill="${C.gold}"/>`,
    `<rect x="236" y="146" width="328" height="488" fill="none" stroke="${C.cinnabar}" stroke-width="5"/>`,
    `<path d="M300 610 L340 560 H460 L500 610 Z" fill="#5f4a2a"/><path d="M340 560 L370 530 H430 L460 560 Z" fill="#7a6038"/>`,
    crossSvg("slavic", 280, 170, 400, C.cinnabar, `stroke="#5b1a10" stroke-width=".4"`),
    `<g font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="700" fill="${C.cinnabar}" text-anchor="middle"><text x="300" y="268">IC</text><text x="500" y="268">XC</text><text x="300" y="352">NI</text><text x="500" y="352">KA</text></g>`,
    `<path d="M280 228 h40 M480 228 h40" stroke="${C.cinnabar}" stroke-width="4"/>`,
  ].join(""));
}

function kiot() {
  return product([
    `<path d="M220 680 V250 L400 140 L580 250 V680 Z" fill="#6b3f1f"/>`,
    `<path d="M240 660 V262 L400 166 L560 262 V660 Z" fill="#8a5a2b"/>`,
    `<path d="M262 640 V276 L400 194 L538 276 V640 Z" fill="${C.gold}"/>`,
    `<path d="M262 640 V276 L400 194 L538 276 V640 Z" fill="#ffffff" opacity=".12"/><path d="M290 300 L360 230" stroke="#fff" stroke-opacity=".5" stroke-width="10" stroke-linecap="round"/>`,
    `<circle cx="400" cy="360" r="70" fill="#f0cf75" stroke="#9c6b1c" stroke-width="3"/>`,
    crossSvg("byzantine", 360, 320, 80, C.cinnabar),
    `<path d="M330 600 h140 M350 560 h100" stroke="#9c6b1c" stroke-width="5"/>`,
    `<rect x="200" y="672" width="400" height="22" fill="#4a2a16"/>`,
    crossSvg("slavic", 388, 96, 40, C.gold),
  ].join(""));
}

function tapers() {
  const sticks = Array.from({ length: 9 }, (_, i) => `<rect x="${330 + i * 16}" y="${170 + (i % 3) * 14}" width="12" height="${470 - (i % 3) * 14}" rx="4" fill="${i % 2 ? "#e8c47a" : "#dcb366"}" transform="rotate(${-8 + i * 2} 400 660)"/>`).join("");
  return product([sticks, `<rect x="320" y="470" width="160" height="26" fill="${C.cinnabar}" transform="rotate(-2 400 480)"/><path d="M400 496 l-30 50 M400 496 l30 50" stroke="${C.cinnabar}" stroke-width="8" stroke-linecap="round"/>`].join(""));
}

function vigilLamp() {
  return product([
    `<ellipse cx="400" cy="300" rx="120" ry="120" fill="#ffb84a" opacity=".25" filter="url(#glow)"/>`,
    `<path d="M300 300 h200 c0 120 -46 190 -100 190 s-100 -70 -100 -190z" fill="#b8231a"/>`,
    `<path d="M320 320 c4 70 20 120 46 140" stroke="#fff" stroke-opacity=".35" stroke-width="12" fill="none" stroke-linecap="round"/>`,
    `<ellipse cx="400" cy="300" rx="100" ry="16" fill="#7a1810"/>`,
    `<path d="M400 236 c18 24 24 38 24 48 a24 24 0 0 1 -48 0 c0 -10 6 -24 24 -48z" fill="#ffd27a"/>`,
    `<path d="M360 490 h80 l20 60 h-120 z" fill="#b8862d"/><path d="M380 550 h40 v100 h-40z" fill="#b8862d"/><ellipse cx="400" cy="664" rx="110" ry="22" fill="#b8862d" stroke="#7a5418" stroke-width="4"/>`,
  ].join(""));
}

function book(cover: string, emblem: string, clasps = false) {
  return product([
    `<rect x="250" y="130" width="320" height="520" rx="10" fill="#f3e6c8" transform="translate(16 16)"/>`,
    `<rect x="230" y="120" width="340" height="540" rx="12" fill="${cover}"/>`,
    `<rect x="230" y="120" width="34" height="540" rx="10" fill="#000" opacity=".2"/>`,
    `<rect x="286" y="160" width="250" height="460" fill="none" stroke="${C.gold}" stroke-width="5"/>`,
    `<rect x="300" y="174" width="222" height="432" fill="none" stroke="${C.gold}" stroke-width="2"/>`,
    emblem,
    `<path d="M340 540 h140 M360 566 h100" stroke="${C.gold}" stroke-width="6" stroke-linecap="round"/>`,
    clasps ? `<rect x="556" y="250" width="40" height="30" rx="4" fill="${C.gold}"/><rect x="556" y="500" width="40" height="30" rx="4" fill="${C.gold}"/>` : "",
  ].join(""));
}

function prayerRope() {
  const knots: string[] = [];
  for (let i = 0; i < 33; i++) {
    const a = (i / 33) * Math.PI * 2 - Math.PI / 2;
    const x = 400 + Math.cos(a) * 190;
    const y = 330 + Math.sin(a) * 170;
    if (Math.abs(Math.cos(a) * 190) < 22 && Math.sin(a) > 0) continue;
    knots.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="15" fill="#1e1712"/><path d="M${(x - 8).toFixed(1)} ${(y - 4).toFixed(1)} q8 8 16 0" stroke="#4a3a2e" stroke-width="3" fill="none"/>`);
  }
  return product([
    knots.join(""),
    `<circle cx="400" cy="512" r="16" fill="#7a1810"/>`,
    `<path d="M400 528 V550" stroke="#1e1712" stroke-width="6"/>`,
    crossSvg("slavic", 382, 546, 60, "#1e1712"),
    `<path d="M392 610 l-14 74 M400 610 v78 M408 610 l14 74 M396 610 l-6 76 M404 610 l6 76" stroke="#1e1712" stroke-width="4" stroke-linecap="round"/>`,
  ].join(""), "", { cx: 400, cy: 700, rx: 240, ry: 24 });
}

function incense() {
  const grains = Array.from({ length: 40 }, (_, i) => {
    const x = 270 + ((i * 97) % 260);
    const y = 520 + ((i * 53) % 110);
    const colors = ["#e8c06a", "#c98a3d", "#a6c27a", "#e7b9a8", "#f2e2b0"];
    return `<rect x="${x}" y="${y}" width="${14 + (i % 3) * 4}" height="${10 + (i % 2) * 5}" rx="4" fill="${colors[i % 5]}" transform="rotate(${(i * 37) % 90} ${x} ${y})"/>`;
  }).join("");
  return product([
    `<path d="M260 650 C240 470 280 330 330 280 H470 C520 330 560 470 540 650 Z" fill="#d9c49a" stroke="#8a6a3a" stroke-width="5"/>`,
    `<path d="M320 290 C350 250 450 250 480 290" stroke="${C.cinnabar}" stroke-width="12" fill="none"/>`,
    `<path d="M300 220 C330 260 470 260 500 220 L480 290 H320 Z" fill="#e8d7ae" stroke="#8a6a3a" stroke-width="4"/>`,
    `<circle cx="400" cy="420" r="60" fill="#f6ecd0" stroke="${C.cinnabar}" stroke-width="4"/>`,
    crossSvg("byzantine", 370, 390, 60, C.cinnabar),
    grains,
  ].join(""));
}

function charcoal() {
  return product([
    `<rect x="250" y="360" width="300" height="120" rx="60" fill="#c9ccd1" stroke="#8b9097" stroke-width="5" transform="rotate(-18 400 420)"/>`,
    `<path d="M300 380 l200 -60 M310 430 l210 -66 M320 470 l200 -62" stroke="#e8eaed" stroke-width="4" transform="rotate(0)"/>`,
    `<ellipse cx="530" cy="370" rx="40" ry="60" fill="#3a3a3a" transform="rotate(-18 530 370)"/>`,
    [0, 1, 2].map((i) => `<ellipse cx="${300 + i * 110}" cy="${600 - i * 10}" rx="46" ry="16" fill="#2a2a2a"/><ellipse cx="${300 + i * 110}" cy="${592 - i * 10}" rx="46" ry="14" fill="#444"/><ellipse cx="${300 + i * 110}" cy="${590 - i * 10}" rx="14" ry="5" fill="#222"/>`).join(""),
  ].join(""));
}

function neckCross() {
  return product([
    `<path d="M260 140 C260 380 330 470 386 486 M540 140 C540 380 470 470 414 486" stroke="#3a2a1e" stroke-width="7" fill="none"/>`,
    `<circle cx="400" cy="492" r="14" fill="none" stroke="#b8862d" stroke-width="6"/>`,
    crossSvg("slavic", 352, 500, 160, "#c9973a", `stroke="#7a5418" stroke-width=".5"`),
  ].join(""), "", { cx: 400, cy: 690, rx: 120, ry: 18 });
}

function wallCross() {
  return product([
    crossSvg("slavic", 244, 102, 560, "#4a2a16", `opacity=".3"`),
    crossSvg("slavic", 232, 90, 560, "url(#woodg)", `stroke="#4a2a16" stroke-width=".35"`),
    `<g stroke="#6b3f1f" stroke-width="2" opacity=".45" fill="none"><path d="M398 100 C394 300 402 480 397 640"/><path d="M404 110 C408 300 401 470 405 630"/><path d="M260 262 C330 258 470 266 540 260"/></g>`,
    `<circle cx="400" cy="270" r="12" fill="${C.gold}"/>`,
  ].join(""), `<linearGradient id="woodg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5a2b"/><stop offset=".5" stop-color="#a8703a"/><stop offset="1" stop-color="#7a4a22"/></linearGradient>`, { cx: 400, cy: 720, rx: 160, ry: 20 });
}

function paschaEgg() {
  const zig = (y: number) => `<path d="M260 ${y} ${Array.from({ length: 14 }, (_, i) => `L${270 + i * 20} ${y + (i % 2 ? 16 : 0)}`).join(" ")}" stroke="#f6e1b0" stroke-width="6" fill="none"/>`;
  return product([
    `<clipPath id="eggclip"><ellipse cx="400" cy="400" rx="190" ry="250"/></clipPath>`,
    `<ellipse cx="400" cy="400" rx="190" ry="250" fill="#a51f17"/>`,
    `<g clip-path="url(#eggclip)">${zig(250)}${zig(530)}<path d="M200 300 H600 M200 500 H600" stroke="#1e1712" stroke-width="10"/><path d="M200 318 H600 M200 482 H600" stroke="#e8c06a" stroke-width="4"/></g>`,
    `<circle cx="400" cy="400" r="70" fill="#f6e1b0"/>`,
    crossSvg("byzantine", 360, 360, 80, "#a51f17"),
    `<ellipse cx="330" cy="260" rx="40" ry="70" fill="#fff" opacity=".18"/>`,
  ].join(""), "", { cx: 400, cy: 670, rx: 170, ry: 22 });
}

function homeCenser() {
  return product([
    `<path d="M300 420 h200 c0 120 -46 170 -100 170 s-100 -50 -100 -170z" fill="#b8862d" stroke="#7a5418" stroke-width="5"/>`,
    `<path d="M310 420 c0 -90 40 -130 90 -130 s90 40 90 130z" fill="#c9973a" stroke="#7a5418" stroke-width="5"/>`,
    [-50, 0, 50].map((dx) => `<path d="M${400 + dx} 330 v40" stroke="#7a5418" stroke-width="5"/>`).join(""),
    crossSvg("byzantine", 380, 250, 40, "#b8862d", `stroke="#7a5418" stroke-width="1"`),
    `<path d="M500 450 h120 c20 0 20 30 0 30 h-120" fill="#4a2a16"/>`,
    `<path d="M370 590 h60 l14 60 h-88 z" fill="#b8862d" stroke="#7a5418" stroke-width="4"/>`,
    `<path d="M380 240 c-20 -40 30 -60 10 -110 M420 240 c20 -40 -24 -70 0 -120" stroke="#b9b0a0" stroke-width="7" fill="none" opacity=".55" stroke-linecap="round"/>`,
  ].join(""));
}

/* ------------------------------ audio ------------------------------ */
function sampleTone(seconds = 6, rate = 8000) {
  const n = seconds * rate;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 2, 4);
  buf.write("WAVE", 8);
  buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24);
  buf.writeUInt32LE(rate * 2, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / rate;
    const strike = t % 3;
    const env = Math.exp(-strike * 1.6) * Math.min(1, strike * 60);
    const v = env * (0.5 * Math.sin(2 * Math.PI * 220 * t) + 0.25 * Math.sin(2 * Math.PI * 440 * t) + 0.12 * Math.sin(2 * Math.PI * 663 * t));
    buf.writeInt16LE(Math.round(v * 0.6 * 32767), 44 + i * 2);
  }
  return buf;
}

out("public/images/hero-fresco.svg", hero());
out("public/images/logo-icon.svg", logoIcon());
out("public/icon.svg", favicon());
out("public/images/gallery/church-winter.svg", churchWinter());
out("public/images/gallery/bell-tower.svg", bellTowerScene());
out("public/images/gallery/iconostasis.svg", iconostasis());
out("public/images/gallery/starry-vault.svg", starryVault());
out("public/images/gallery/candle-stand.svg", candleStand());
out("public/images/gallery/pascha-eggs.svg", paschaEggs());
out("public/images/gallery/gospel-book.svg", gospelBook());
out("public/images/gallery/refectory.svg", refectory());
out("public/images/gallery/garden.svg", garden());
out("public/images/store/icon-cross.svg", iconCross());
out("public/images/store/kiot.svg", kiot());
out("public/images/store/tapers.svg", tapers());
out("public/images/store/vigil-lamp.svg", vigilLamp());
out("public/images/store/prayer-book.svg", book("#7a1810", crossSvg("slavic", 340, 230, 200, C.gold)));
out("public/images/store/psalter.svg", book("#5b3a22", crossSvg("byzantine", 320, 250, 160, C.gold), true));
out("public/images/store/prayer-rope.svg", prayerRope());
out("public/images/store/incense.svg", incense());
out("public/images/store/charcoal.svg", charcoal());
out("public/images/store/neck-cross.svg", neckCross());
out("public/images/store/wall-cross.svg", wallCross());
out("public/images/store/pascha-egg.svg", paschaEgg());
out("public/images/store/home-censer.svg", homeCenser());
out("public/media/sample-sermon.wav", sampleTone());
