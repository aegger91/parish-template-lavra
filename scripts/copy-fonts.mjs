// Copies the above-the-fold font files to public/fonts so pages can preload them from a stable URL.
// Runs before dev and build. The list must match src/app/critical-fonts.css and src/lib/fonts.ts.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public/fonts");
const faces = [
  ["alegreya", "alegreya", "700"],
  ["alegreya-sc", "alegreya-sc", "500"],
  ["alegreya-sc", "alegreya-sc", "700"],
  ["pt-serif", "pt-serif", "400"],
];
const subsets = ["latin", "latin-ext", "cyrillic"];

mkdirSync(out, { recursive: true });
for (const [pkg, prefix, weight] of faces) {
  for (const subset of subsets) {
    const file = `${prefix}-${subset}-${weight}-normal.woff2`;
    copyFileSync(join(root, "node_modules/@fontsource", pkg, "files", file), join(out, file));
  }
}
