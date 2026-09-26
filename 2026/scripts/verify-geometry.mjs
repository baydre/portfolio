// Verifies the design system's frame geometry against the Figma-authored values.
//
// This exists because the hero was once rendered 84px too low: the authored
// offset (140px) is measured from the frame top, but the header sits above the
// hero in normal flow, so the offset has to have the header subtracted. The
// arithmetic is now expressed as calc() in theme.css; this script confirms the
// built CSS still resolves to the authored numbers.
//
// Usage: node scripts/verify-geometry.mjs [path/to/index-*.css]

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const dist = new URL("../dist/assets/", import.meta.url).pathname;
const cssPath = process.argv[2]
  ?? join(dist, readdirSync(dist).find((f) => f.endsWith(".css")));
const css = readFileSync(cssPath, "utf8");

// The Figma frame is 1440px wide, so the cascade must be resolved as the browser
// would at 1440px: the base :root values, then every @media (min-width: …) block
// whose query the viewport satisfies, in ascending order.
const VIEWPORT = 1440;

const decls = {};
function apply(block) {
  // The semicolon is optional: single-declaration media overrides such as
  // `@media(min-width:1024px){:root{--gutter:5.25rem}}` have no trailing `;`.
  for (const d of block.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;}]+)/g)) {
    decls[d[1]] = d[2].trim();
  }
}

// Rules whose selector includes :root. Tailwind splits theme and base custom
// properties across `:root`, `:root,:host` and `*,:before,:after,:root`.
for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  if (rule[1].includes(":root") && !rule[1].includes("@media")) apply(rule[2]);
}

// Media queries the 1440px viewport satisfies, applied in ascending width
// order so the cascade resolves as a browser would. Tailwind emits both rem and
// px forms and sometimes omits the space after `@media`, so parse the whole
// query loosely and normalise the unit.
const inPixels = (raw) =>
  raw[2].toLowerCase() === "rem" ? parseFloat(raw[1]) * 16 : parseFloat(raw[1]);

const blocks = [...css.matchAll(/@media\s*\(min-width:[^)]*\)\s*\{/g)]
  .map((m) => ({
    at: m.index,
    open: css.indexOf("{", m.index),
    width: inPixels(m[0].match(/min-width:\s*(\d+(?:\.\d+)?)(px|rem)/i)),
  }))
  .filter((b) => b.width <= VIEWPORT)
  .sort((a, b) => a.width - b.width);

for (const block of blocks) {
  let depth = 0;
  let i = block.open;
  for (; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) break;
    }
  }
  for (const rule of css.slice(block.at, i).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (rule[1].includes(":root")) apply(rule[2]);
  }
}

const rem = (n) => parseFloat(n) * (String(n).includes("rem") ? 16 : 1);

// Resolve var() references, then evaluate the arithmetic with a small shunting
// yard. Substituting variables first and evaluating plain numbers second is far
// more robust than trying to split a calc() body on + and -, which breaks on the
// hyphens inside custom property names such as --space-header-pad.
function substitute(expression, seen) {
  return expression.replace(/var\(\s*(--[a-z0-9-]+)\s*\)/gi, (_, name) =>
    String(resolve(name, seen)),
  );
}

function evaluate(expression) {
  const tokens = expression.match(/\d*\.?\d+|[()+\-*/]/g) ?? [];
  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };
  const output = [];
  const operators = [];
  let previous = null;

  for (const token of tokens) {
    if (/^\d/.test(token)) {
      output.push(Number(token));
    } else if (token === "(") {
      operators.push(token);
    } else if (token === ")") {
      while (operators.at(-1) !== "(") output.push(operators.pop());
      operators.pop();
    } else if (token === "-" && (previous === null || previous === "(" || /[+\-*/(]$/.test(previous))) {
      output.push(0); // unary minus
      operators.push(token);
    } else {
      while (operators.length && precedence[operators.at(-1)] >= precedence[token]) {
        output.push(operators.pop());
      }
      operators.push(token);
    }
    previous = token;
  }
  while (operators.length) output.push(operators.pop());

  const stack = [];
  for (const token of output) {
    if (typeof token === "number") {
      stack.push(token);
    } else {
      const b = stack.pop();
      const a = stack.pop();
      stack.push({ "+": a + b, "-": a - b, "*": a * b, "/": a / b }[token]);
    }
  }
  return stack.pop();
}

function resolve(name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`circular reference: ${name}`);
  seen.add(name);
  const value = decls[name];
  if (value === undefined) throw new Error(`undefined custom property: ${name}`);

  if (value.startsWith("var(") || /^calc\(/.test(value)) {
    return evaluate(substitute(value, seen));
  }
  return rem(value);
}

const px = (n) => Math.round(n * 1000) / 1000;
let failures = 0;

function check(label, actual, expected) {
  const pass = Math.abs(actual - expected) < 0.01;
  if (!pass) failures++;
  console.log(
    `  ${label.padEnd(36)}${String(px(actual)).padStart(8)}px   authored ${String(expected).padStart(5)}px   ${pass ? "MATCH" : "*** MISMATCH ***"}`,
  );
}

function input(label, actual, authored) {
  console.log(
    `  ${label.padEnd(36)}${String(px(actual)).padStart(8)}px   authored ${String(authored).padStart(5)}px   (input)`,
  );
}

const headerPad = resolve("--space-header-pad");
const navPad = resolve("--space-nav-pad");
const navLine = resolve("--size-nav-line");
const header = resolve("--header-height");
const heroTop = resolve("--hero-top-pad");
const offset = resolve("--hero-offset");
const container = resolve("--container-site");
const gutter = resolve("--gutter");
const tagline = resolve("--tagline-col");
const colGap = resolve("--space-hero-col-gap");

console.log(`\nframe geometry — resolved from ${cssPath.split("/").pop()}\n`);
console.log("  authored inputs");
input("header block padding", headerPad, 22);
input("nav item padding x2", navPad * 2, 16);
input("nav line box", navLine, 24);
console.log(`  ${"nav item height".padEnd(36)}${String(px(navPad * 2 + navLine)).padStart(8)}px\n`);

console.log("  derived");
check("header height", header, 84);
check("hero clearance = offset - header", heroTop, 56);
check("wordmark top = header + clearance", header + heroTop, 140);
console.log("");

console.log("  columns");
check("authored frame offset", offset, 140);
check("content = container - gutters x2", container - gutter * 2, 1272);
check("tagline + column gap", tagline + colGap, 584);
check("paragraph column", container - gutter * 2 - tagline - colGap, 688);
console.log("");
console.log("  remaining authored values");
check("hero image height", resolve("--space-hero-image"), 431);
check("space below image", resolve("--space-hero-tail"), 139);
check("wordmark -> copy gap", resolve("--space-wordmark-gap"), 48);
check("copy -> image gap", resolve("--space-copy-image-gap"), 24);
check("nav item gap", resolve("--space-nav-gap"), 12);
check("right cluster gap", resolve("--space-cluster-gap"), 16);

// About page profile section — the AboutPage frame.
//
// The portrait is the one place in the project where the Tailwind export and the
// frame's own SVG disagree, so these assertions are the guard on a real observed
// conflict rather than a transcription. Figma spells the column `w-96` (384px)
// while the SVG inside it is `width="421"`. 421 is authored and 384 is the lossy
// read, so the assertion is on 421 — and if someone "corrects" the token to 384
// to match the class name, this fails.
console.log("");
console.log("  about page — portrait");
const portraitW = resolve("--size-portrait-w");
const portraitH = resolve("--size-portrait-h");
input("portrait width", portraitW, 421);
input("portrait height", portraitH, 475);
console.log(`  ${"aspect ratio".padEnd(36)}${(portraitW / portraitH).toFixed(4).padStart(8)}  (421/475 = 0.8863)`);
console.log(`  ${"lossy w-96 the frame contradicts".padEnd(36)}${px(24 * 16).toFixed(0).padStart(8)}px`);
// The two authored values and the gap must leave a real copy column at 1440.
check("portrait + column gap", portraitW + resolve("--space-profile-col-gap"), 461);
console.log(`  ${"remaining copy column".padEnd(36)}${px(container - gutter * 2 - portraitW - resolve("--space-profile-col-gap")).toFixed(0).padStart(8)}px  (of 1272 content)`);

// Geometry is only safe from drift while every utility points at the custom
// properties above. If someone re-hardcodes `--spacing-hero-top: 3.5rem` — or
// writes a literal into a component class — the numbers below still pass today
// but silently desynchronise the moment a spacing primitive changes. Assert the
// indirection instead of the current values.
console.log("");
console.log("  utilities reference tokens (no duplicated constants)");
const utilities = {
  "container-site": "--container-site",
  "min-h-header": "--header-height",
  "py-header-pad": "--space-header-pad",
  "p-nav-pad": "--space-nav-pad",
  "gap-nav-gap": "--space-nav-gap",
  "gap-cluster-gap": "--space-cluster-gap",
  "pt-hero-top": "--hero-top-pad",
  "pb-hero-tail": "--space-hero-tail",
  "gap-wordmark-gap": "--space-wordmark-gap",
  "gap-copy-image-gap": "--space-copy-image-gap",
  "gap-profile-col-gap": "--space-profile-col-gap",
  "w-portrait-w": "--size-portrait-w",
};

for (const [utility, token] of Object.entries(utilities)) {
  // The class may be variant-prefixed and Tailwind escapes the colon, so
  // `.lg\:w-portrait-w` reaches the class name as `lg\` + `:` + name. The prefix
  // group therefore has to END on a colon, not on the escape — an earlier version
  // ended on the escape and silently failed to match every responsive utility,
  // which is how the two About entries below reported "RULE MISSING" while
  // being present and correct in the built CSS.
  const pattern = new RegExp(`\\.(?:[a-z0-9\\\\:.-]*:)?${utility}\\{([^}]*)\\}`);
  const rule = css.match(pattern);
  const body = rule?.[1] ?? "";
  const pass = body.includes(`var(${token})`);
  if (!pass) failures++;
  console.log(
    `  ${`.${utility}`.padEnd(36)}${pass ? "uses" : "*** DOES NOT USE ***"} var(${token})${pass ? "" : body ? `   got: ${body}` : "   *** RULE MISSING ***"}`,
  );
}

console.log(
  failures === 0
    ? "\nall geometry matches the authored frame\n"
    : `\n${failures} problem(s)\n`,
);
process.exit(failures === 0 ? 0 : 1);
