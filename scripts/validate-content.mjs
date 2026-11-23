// Checks every content file against its JSON Schema, then checks links between files.
// Run with: npm run validate
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const schemaDir = join(contentDir, "schemas");
const errors = [];
const fail = (file, msg) => errors.push(`${file}: ${msg}`);
const read = (p) => JSON.parse(readFileSync(p, "utf8"));

const ajv = new Ajv2020({ allErrors: true, strict: false });
for (const f of readdirSync(schemaDir)) ajv.addSchema(read(join(schemaDir, f)));

const files = {};
for (const rel of ["site", "pages", "schedule", "feasts", "clergy", "history", "gallery", "news", "sermons", "products", "service-requests", "ui", "connect/events", "connect/needs"]) {
  const path = join(contentDir, `${rel}.json`);
  const data = read(path);
  files[rel] = data;
  const schemaId = data.$schema?.split("/").pop();
  const validate = schemaId && ajv.getSchema(schemaId);
  if (!validate) {
    fail(rel, `no schema found for ${data.$schema}`);
    continue;
  }
  if (!validate(data)) for (const e of validate.errors) fail(rel, `${e.instancePath || "/"} ${e.message}`);
}

const site = files.site;
const langs = site.languages.map((l) => l.code);
if (!langs.includes(site.defaultLanguage)) fail("site", `defaultLanguage "${site.defaultLanguage}" is not in languages`);

function walk(value, path, visit) {
  visit(value, path);
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, visit));
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, visit);
}

const isLocalized = (v) => v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0 && Object.entries(v).every(([k, x]) => typeof x === "string" && /^[a-z]{2,3}(-[A-Za-z0-9]+)*$/.test(k));
for (const [name, data] of Object.entries(files)) {
  walk(data, "", (v, path) => {
    if (typeof v === "string" && v.includes("\u2014")) fail(name, `${path} contains an em dash`);
    if (name !== "ui" && isLocalized(v) && !(site.defaultLanguage in v)) fail(name, `${path} has no ${site.defaultLanguage} text to fall back to`);
    if (typeof v === "string" && /^\/(images|media)\//.test(v) && !existsSync(join(root, "public", v))) fail(name, `${path} points to a missing file ${v}`);
  });
}

function uniqueIds(name, list, label = "items") {
  const seen = new Set();
  for (const item of list ?? []) {
    if (seen.has(item.id)) fail(name, `duplicate id "${item.id}" in ${label}`);
    seen.add(item.id);
  }
  return seen;
}

const pageIds = uniqueIds("pages", files.pages.pages, "pages");
const sectionIds = new Set();
for (const page of files.pages.pages) {
  if (page.parentId && !pageIds.has(page.parentId)) fail("pages", `page "${page.id}" has unknown parentId "${page.parentId}"`);
  for (const s of page.sections) {
    if (sectionIds.has(s.id)) fail("pages", `duplicate section id "${s.id}"`);
    sectionIds.add(s.id);
  }
  const onPage = new Set(page.sections.map((s) => s.id));
  walk(page, `pages.${page.id}`, (v, path) => {
    if (v && typeof v === "object" && !Array.isArray(v) && typeof v.page === "string" && !pageIds.has(v.page)) fail("pages", `${path} links to unknown page "${v.page}"`);
  });
  for (const s of page.sections) {
    if (s.type === "module-links") for (const id of s.props.pages) if (!pageIds.has(id)) fail("pages", `section "${s.id}" lists unknown page "${id}"`);
    if (s.type === "hero") for (const c of s.props.chapters ?? []) if (!onPage.has(c.target)) fail("pages", `hero chapter target "${c.target}" is not a section on "${page.id}"`);
  }
}

function checkCategories(name, data) {
  const cats = uniqueIds(name, data.categories, "categories");
  uniqueIds(name, data.items);
  for (const item of data.items) if (!cats.has(item.category)) fail(name, `"${item.id}" uses unknown category "${item.category}"`);
}
for (const name of ["gallery", "news", "products", "connect/events", "connect/needs"]) checkCategories(name, files[name]);
for (const name of ["clergy", "history", "sermons", "service-requests"]) uniqueIds(name, files[name].items);
uniqueIds("schedule", [...files.schedule.weekly, ...files.schedule.special]);
uniqueIds("feasts", [...files.feasts.fixed, ...files.feasts.movable]);

const clergyIds = new Set(files.clergy.items.map((c) => c.id));
for (const s of files.sermons.items) if (!clergyIds.has(s.speaker)) fail("sermons", `"${s.id}" has unknown speaker "${s.speaker}"`);
for (const r of files["service-requests"].items) if (r.action.type === "link" && !pageIds.has(r.action.page)) fail("service-requests", `"${r.id}" links to unknown page "${r.action.page}"`);
if (!site.donate.funds.some((f) => f.id === site.donate.defaultFund)) fail("site", `donate.defaultFund "${site.donate.defaultFund}" is not a fund id`);
for (const n of files["connect/needs"].items) for (const slot of n.slots) if (slot.signups > slot.capacity) fail("connect/needs", `slot "${slot.id}" has more sign-ups than capacity`);

const ui = files.ui;
for (const [key, value] of Object.entries(ui)) {
  if (key === "$schema") continue;
  for (const l of langs) if (!value[l]) fail("ui", `"${key}" has no ${l} text`);
}
const srcFiles = [];
const collect = (dir) => {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) collect(p);
    else if (/\.(tsx?|mts)$/.test(e.name)) srcFiles.push(p);
  }
};
collect(join(root, "src"));
for (const p of srcFiles) {
  const code = readFileSync(p, "utf8");
  const where = relative(root, p);
  for (const m of code.matchAll(/\bt\("([^"]+)"/g)) if (!(m[1] in ui)) fail(where, `t("${m[1]}") has no entry in content/ui.json`);
  for (const m of code.matchAll(/\bt\(`([^`$]+)\$\{/g)) if (!Object.keys(ui).some((k) => k.startsWith(m[1]))) fail(where, `no ui.json keys start with "${m[1]}"`);
}

if (errors.length) {
  console.error(`Content check failed with ${errors.length} problem(s):\n` + errors.map((e) => `  - ${e}`).join("\n"));
  process.exit(1);
}
console.log(`Content OK: ${Object.keys(files).length} files, ${files.pages.pages.length} pages, ${langs.length} languages.`);
