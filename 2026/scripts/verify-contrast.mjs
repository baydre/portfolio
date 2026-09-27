#!/usr/bin/env node
/**
 * Contrast verification for the BaydreAfrica palette.
 *
 * WHY THIS EXISTS
 * The Figma source specifies six colours that fail WCAG 2.2 AA. They were
 * corrected in `theme.css` by raising HSL lightness only (hue and saturation
 * preserved). Those corrections are documented in a comment, but a comment does
 * not stop a later edit from silently reintroducing a failing value, or from
 * moving a colour onto a background it was never measured against.
 *
 * This script reads the ACTUAL token values out of `theme.css` and asserts each
 * declared usage pairing meets its requirement. A token whose value drifts, or
 * whose pairing is removed, fails here rather than in an audit.
 *
 * Like `verify-geometry.mjs`, it reads the authored source rather than the build
 * output: the palette is declared once in `:root` and the geometry indirection
 * check in `verify-geometry.mjs` already covers the built CSS. This keeps the two
 * scripts independent rather than both parsing the bundle.
 *
 * Requirements:
 *   4.50  body text                        WCAG 2.2 AA  1.4.3 (Contrast Minimum)
 *   3.00  non-text: rules, borders, and
 *         control boundaries               WCAG 2.2 AA  1.4.11 (Non-text Contrast)
 *
 * Run: node scripts/verify-contrast.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const themePath = join(root, "src", "styles", "theme.css");

/* ---------------------------------------------------------------- colour math */

const parseHex = (value) => {
  const hex = value.trim().replace("#", "");
  if (!/^[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(`not a 6-digit hex colour: ${value}`);
  }
  return [0, 2, 4].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
};

const toLinear = (channel) => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** WCAG 2.x relative luminance. */
const luminance = (rgb) =>
  0.2126 * toLinear(rgb[0]) + 0.7152 * toLinear(rgb[1]) + 0.0722 * toLinear(rgb[2]);

/** WCAG 2.x contrast ratio, 1–21. */
export const contrast = (a, b) => {
  const [hi, lo] = [luminance(parseHex(a)), luminance(parseHex(b))].sort(
    (x, y) => y - x,
  );
  return (hi + 0.05) / (lo + 0.05);
};

/* ------------------------------------------------------------- token resolving */

/**
 * Pull the `:root { … }` block out of theme.css and map `--token-name` to its
 * literal value. Deliberately does NOT resolve `var()` chains or the `@media`
 * overrides: every colour pairing below is declared against the base `:root`
 * values, which is the dark theme (`theme.css` header states `:root` IS the dark
 * theme — there is no light theme in the design).
 */
const readRootTokens = (css) => {
  const start = css.indexOf(":root {");
  if (start === -1) throw new Error("no :root block in theme.css");
  // The base :root block ends at the first line that is exactly "}".
  const end = css.indexOf("\n}", start);
  if (end === -1) throw new Error("unterminated :root block in theme.css");
  const block = css.slice(start, end);

  const tokens = new Map();
  for (const line of block.split("\n")) {
    const m = line.match(/^\s*(--[a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/);
    if (m) tokens.set(m[1], m[2]);
  }
  return tokens;
};

/* ----------------------------------------------------------------- the contract */

/**
 * Every pairing the design relies on, with the requirement it must meet.
 * `kind` is "text" (1.4.3) or "graphic" (1.4.11).
 */
const PAIRINGS = [
  // --- existing palette, unchanged ---
  ["--foreground", "--background", "text", "body copy on page"],
  ["--primary-foreground", "--primary", "text", '"Hire me" label'],
  ["--surface-foreground", "--surface", "text", "header social tile glyph"],
  ["--destructive-foreground", "--destructive", "text", "destructive on fill"],

  // --- the four owner-confirmed corrections ---
  ["--rule-work", "--background", "graphic", "Work divider rule"],
  ["--code-foreground", "--panel", "text", "project-code sample"],
  ["--panel-border", "--panel", "graphic", "card border"],
  ["--footer-label", "--background", "text", "Navigate/Connect labels"],

  // --- corrections this implementation requires (real form) ---
  ["--field-border", "--background", "graphic", "form field underline"],
  ["--destructive", "--background", "text", "form error text"],

  // --- new surfaces from the Work/Services/Footer frames ---
  ["--panel-foreground", "--panel", "text", "panel copy"],
  ["--tech-tile-foreground", "--tech-tile", "text", "stack tile label"],
  ["--brand-react", "--tech-tile", "graphic", "React glyph"],
  ["--pill-foreground", "--pill", "text", '"View Github Repo" label'],
  ["--pill-outline-label", "--pill", "text", '"View Live Project" label'],
  ["--rule", "--background", "graphic", "section divider"],
  ["--field-placeholder", "--background", "text", "form placeholder"],
  ["--field-chevron", "--background", "graphic", "select indicator"],
  ["--footer-link", "--background", "text", "footer link"],

  // --- About tool marks, from simple-icons ---
  // Three of the six raw brand hexes are invisible on `--tech-tile`; see the
  // CORRECTED entries in `SUPERSEDED` below. All six are `graphic`, so the
  // requirement is 3:1, not 4.5:1.
  ["--brand-python", "--tech-tile", "graphic", "Python mark"],
  ["--brand-django", "--tech-tile", "graphic", "Django mark"],
  ["--brand-fastapi", "--tech-tile", "graphic", "FastAPI mark"],
  ["--brand-git", "--tech-tile", "graphic", "Git mark"],
  ["--brand-linux", "--tech-tile", "graphic", "Linux mark"],
  ["--brand-kicad", "--tech-tile", "graphic", "KiCad mark"],

  // --- About ROLE marks, on the page rather than on a tile ---
  // These four are the lead technology of each role in `aboutSkillRoles`, drawn
  // at the frame's 120px in the Technical Skills tiles. Those `<li>`s have no
  // background of their own, so the surface is `--background`, NOT `--tech-tile`
  // like the six above — which is why React and Linux pass here with more room
  // than they have on the Tools tiles, and why Raspberry Pi needed its own
  // correction: simple-icons' `#a22846` is 2.57:1 on the page.
  //
  // The Backend entry is `--brand-c`, not `--brand-python`, since 2026-09-27: the
  // role's mark is `stack[0]` and the owner put C first in that stack, so the
  // tile no longer draws Python here. Python is still gated above, on
  // `--tech-tile`, where the Tools row actually renders it — so dropping it from
  // this list loses no coverage, it just stops asserting a pairing that no longer
  // occurs on the page.
  ["--brand-c", "--background", "graphic", "Backend role mark"],
  ["--brand-react", "--background", "graphic", "Full-stack role mark"],
  ["--brand-linux", "--background", "graphic", "DevOps role mark"],
  ["--brand-raspberrypi", "--background", "graphic", "IoT role mark"],

  // --- About frame ---
  // `--muted-foreground` has been marked "DERIVED — untested for contrast" in
  // theme.css since it was introduced. The About frame is the first thing to put
  // it on the page — the `01`–`04` role indices — so it is no longer untested, and
  // this is where that claim is actually checked rather than asserted in prose.
  ["--muted-foreground", "--background", "text", "About role index"],
];

const REQUIREMENT = { text: 4.5, graphic: 3.0 };

/** The original, failing values — kept so the correction stays auditable. */
const SUPERSEDED = {
  // simple-icons' own hexes. Kept so the correction stays auditable: these are
  // third-party brand values, so the record matters more than usual — the
  // shipped colour is a deliberate departure, not the vendor's.
  "--brand-python": "#3776ab",
  "--brand-django": "#092e20",
  "--brand-git": "#f03c2e",
  // simple-icons' own KiCad hex, which is also what the owner's supplied
  // `kicad.svg` baked in. Kept for the same reason as the other three.
  "--brand-kicad": "#314cb0",
  // simple-icons' Raspberry Pi hex. Corrected against `--background`, the
  // surface the About role tiles actually sit on — see the PAIRINGS note.
  "--brand-raspberrypi": "#a22846",
  "--rule-work": "#4c4444",
  "--code-foreground": "#b44247",
  "--panel-border": "#585667",
  "--footer-label": "#6b6560",
  "--field-border": "#585667",
  "--destructive": "#d4183d",
};

/* ------------------------------------------------------------------------ run */

const tokens = readRootTokens(readFileSync(themePath, "utf8"));

const pad = (s, n) => String(s).padEnd(n);
const num = (n) => n.toFixed(2).padStart(5);

console.log("contrast verification — src/styles/theme.css\n");

let failures = 0;
let missing = 0;

for (const [fg, bg, kind, usage] of PAIRINGS) {
  const a = tokens.get(fg);
  const b = tokens.get(bg);
  const need = REQUIREMENT[kind];

  if (!a || !b) {
    console.log(
      `  MISSING  ${pad(fg, 20)} or ${pad(b, 20)} not a literal hex in :root`,
    );
    missing += 1;
    continue;
  }

  const ratio = contrast(a, b);
  const ok = ratio >= need;
  if (!ok) failures += 1;

  const was = SUPERSEDED[fg];
  const origin = was
    ? `  (was ${was} @ ${contrast(was, b).toFixed(2)})`
    : "";

  console.log(
    `  ${ok ? "PASS" : "FAIL"}  ${num(ratio)} >= ${need.toFixed(2)}  ` +
      `${pad(`${a} on ${b}`, 22)} ${pad(usage, 26)} WCAG ${kind === "text" ? "1.4.3 " : "1.4.11"}${origin}`,
  );
}

console.log("");

// The corrected values must be genuinely lighter than what they replaced, and
// must not have drifted in hue. A wholesale hue change would be a redesign.
console.log("correction integrity — lightness raised, hue preserved:\n");
const rgb2hsl = ([r, g, b]) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h =
      max === r
        ? (g - b) / d + (g < b ? 6 : 0)
        : max === g
          ? (b - r) / d + 2
          : (r - g) / d + 4;
    h *= 60;
  }
  return [h, s * 100, l * 100];
};

let integrity = 0;
for (const [token, before] of Object.entries(SUPERSEDED)) {
  const after = tokens.get(token);
  if (!after) continue;
  const [h1, , l1] = rgb2hsl(parseHex(before));
  const [h2, , l2] = rgb2hsl(parseHex(after));
  const lighter = l2 > l1;
  // Allow for quantisation drift from the 8-bit hex round-trip.
  const hueKept = Math.abs(h2 - h1) < 5;
  if (!lighter || !hueKept) integrity += 1;
  console.log(
    `  ${lighter && hueKept ? "OK  " : "DRIFT"}  ${pad(token, 20)} ` +
      `${before} -> ${after}   L ${l1.toFixed(1)} -> ${l2.toFixed(1)}   ` +
      `hue ${h1.toFixed(1)}° -> ${h2.toFixed(1)}° (Δ${Math.abs(h2 - h1).toFixed(1)}°)`,
  );
}

console.log("");

if (missing > 0) {
  console.error(
    `FAIL  ${missing} pairing(s) reference a token that is not a literal hex in :root.`,
  );
  console.error(
    "      Composite values (var(), colour-mix) are not resolved by this script.",
  );
}
if (failures > 0) {
  console.error(`FAIL  ${failures} pairing(s) below their WCAG 2.2 AA requirement.`);
}
if (integrity > 0) {
  console.error(
    `FAIL  ${integrity} correction(s) drifted in hue or got darker. A correction must`,
  );
  console.error("      raise lightness only; changing hue is a redesign.");
}

if (failures + missing + integrity > 0) process.exit(1);

console.log(
  `OK  ${PAIRINGS.length} pairings meet WCAG 2.2 AA; ` +
    `${Object.keys(SUPERSEDED).length} corrections verified as lightness-only.`,
);
