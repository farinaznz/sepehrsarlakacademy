import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { normalizeCourseContent } from "../scripts/course-content.mjs";

const courses = JSON.parse(await readFile(new URL("../app/courses/content.json", import.meta.url), "utf8"));
const allowedBlocks = new Set(["paragraph", "heading", "list", "callout", "facts", "profile"]);

test("course bodies use the normalized content schema", () => {
  assert.equal(courses.length, 8);
  for (const course of courses) {
    assert.ok(Array.isArray(course.body) && course.body.length > 0);
    assert.equal("content" in course, false);
    for (const block of course.body) {
      assert.ok(allowedBlocks.has(block.type), `${course.slug} has unsupported ${block.type} block`);
      if (block.type === "heading") assert.ok(block.level === 2 || block.level === 3);
      if (block.type === "paragraph" || block.type === "heading" || block.type === "callout") {
        assert.ok(block.html.trim());
        assert.doesNotMatch(block.html, /<(script|style|iframe)|\s(?:class|style|on\w+)=/i);
      }
      if (block.type === "list") assert.ok(block.items.length > 0 && block.items.every((item) => item.trim()));
      if (block.type === "facts") assert.ok(block.items.length > 0 && block.items.every((item) => item.label.trim() && item.value.trim()));
      if (block.type === "profile") assert.ok(block.image.src && block.image.alt && block.html.trim());
    }
  }
});

test("course body normalization is idempotent", () => {
  assert.deepEqual(courses.map(normalizeCourseContent), courses);
});

test("course profile images resolve locally", async () => {
  const profiles = courses.flatMap((course) => course.body.filter((block) => block.type === "profile"));
  assert.equal(profiles.length, 2);
  for (const profile of profiles) {
    assert.match(profile.image.src, /^\/media\/courses\/content\//);
    await access(new URL(`../public${profile.image.src}`, import.meta.url));
  }
});
