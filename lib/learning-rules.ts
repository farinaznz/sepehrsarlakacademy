const DAY_MS = 24 * 60 * 60 * 1000;

export function lessonReleaseDate(enrolledAt: Date, dripDelayDays: number) {
  return new Date(enrolledAt.getTime() + Math.max(0, dripDelayDays) * DAY_MS);
}

export function isLessonReleased(enrolledAt: Date, dripDelayDays: number, now = new Date()) {
  return lessonReleaseDate(enrolledAt, dripDelayDays).getTime() <= now.getTime();
}

export function courseProgress(lessons: Array<{ percent: number | null }>) {
  if (!lessons.length) return 0;
  const total = lessons.reduce((sum, item) => sum + Math.min(100, Math.max(0, item.percent ?? 0)), 0);
  return Math.round(total / lessons.length);
}
