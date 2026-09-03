import assert from "node:assert/strict";
import test from "node:test";
import { courseProgress, isLessonReleased, lessonReleaseDate } from "../lib/learning-rules.ts";

test("content drip is based on each student's enrollment date", () => {
  const enrolledAt = new Date("2026-01-01T12:00:00.000Z");
  assert.equal(lessonReleaseDate(enrolledAt, 3).toISOString(), "2026-01-04T12:00:00.000Z");
  assert.equal(isLessonReleased(enrolledAt, 3, new Date("2026-01-04T11:59:59.999Z")), false);
  assert.equal(isLessonReleased(enrolledAt, 3, new Date("2026-01-04T12:00:00.000Z")), true);
});

test("negative drip delays cannot release content before enrollment", () => {
  const enrolledAt = new Date("2026-01-01T12:00:00.000Z");
  assert.equal(lessonReleaseDate(enrolledAt, -3).toISOString(), enrolledAt.toISOString());
});

test("course progress averages bounded lesson percentages", () => {
  assert.equal(courseProgress([]), 0);
  assert.equal(courseProgress([{ percent: 100 }, { percent: 0 }, { percent: 50 }]), 50);
  assert.equal(courseProgress([{ percent: 130 }, { percent: -20 }, { percent: null }]), 33);
});
