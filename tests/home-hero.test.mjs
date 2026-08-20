import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = process.cwd();

test("the homepage hero includes the existing image and five local slideshow images", async () => {
  const source = await readFile(path.join(root, "app", "page.tsx"), "utf8");
  const paths = [...source.matchAll(/src: "(\/media\/(?:hero-classroom|home-hero-\d+)\.jpg)"/g)].map((match) => match[1]);

  assert.equal(paths.length, 6);
  await Promise.all(paths.map((src) => access(path.join(root, "public", src))));
  assert.match(source, /<HomeHeroSlideshow slides=\{heroSlides\} \/>/);
});

test("the homepage slideshow respects reduced-motion preferences", async () => {
  const source = await readFile(path.join(root, "app", "HomeHeroSlideshow.tsx"), "utf8");
  assert.match(source, /prefers-reduced-motion: reduce/);
});
