import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const courses = JSON.parse(await readFile(new URL("../app/courses/content.json", import.meta.url), "utf8"));

test("every course has a local cover gallery without duplicate slides", async () => {
  assert.equal(courses.length, 8);
  for (const course of courses) {
    assert.ok(course.gallery.length > 0, `${course.slug} has no gallery`);
    assert.equal(course.gallery[0].src, course.cover);
    assert.equal(new Set(course.gallery.map((image) => image.src)).size, course.gallery.length);
    for (const image of course.gallery) {
      assert.ok(image.alt.trim());
      assert.match(image.src, /^\/media\/courses\/(?:covers|gallery)\//);
      await access(new URL(`../public${image.src}`, import.meta.url));
    }
  }
});

test("the custom foundations route uses the shared cover slideshow", async () => {
  const page = await readFile(new URL("../app/courses/foundations/page.tsx", import.meta.url), "utf8");
  assert.match(page, /CourseCoverSlideshow slides=\{gallery\}/);
});

test("the slideshow exposes previous and next controls", async () => {
  const component = await readFile(new URL("../app/courses/CourseCoverSlideshow.tsx", import.meta.url), "utf8");
  assert.match(component, /aria-label="تصویر قبلی"/);
  assert.match(component, /aria-label="تصویر بعدی"/);
});
