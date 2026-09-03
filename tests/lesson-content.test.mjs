import assert from "node:assert/strict";
import test from "node:test";
import { sanitizeLessonContent } from "../lib/lesson-content.ts";

test("lesson content keeps teaching markup and strips executable markup", () => {
  const content = sanitizeLessonContent('<h2 style="color:red">عنوان</h2><p onclick="alert(1)">متن <strong>مهم</strong></p><script>alert(1)</script><img src="javascript:alert(1)" onerror="alert(1)">');
  assert.equal(content, "<h2>عنوان</h2><p>متن <strong>مهم</strong></p>");
  assert.doesNotMatch(content, /script|onclick|onerror|javascript:/);
});

test("lesson content allows academy images and safe links", () => {
  const content = sanitizeLessonContent('<img src="https://sepehrsarlakacademy.com/wp-content/uploads/example.jpg" alt="نمونه"><a href="https://example.com/guide">راهنما</a>');
  assert.match(content, /<img src="https:\/\/sepehrsarlakacademy\.com\/wp-content\/uploads\/example\.jpg" alt="نمونه" loading="lazy">/);
  assert.match(content, /rel="noreferrer noopener"/);
  assert.equal(sanitizeLessonContent(content), content);
  assert.doesNotMatch(sanitizeLessonContent('<img src="//evil.example/image.jpg">'), /evil\.example/);
});
