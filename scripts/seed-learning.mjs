import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const content = JSON.parse(await readFile(new URL("../app/courses/content.json", import.meta.url), "utf8"));
const foundationsOnline = JSON.parse(await readFile(new URL("../app/courses/foundations-online-content.json", import.meta.url), "utf8"));
const sql = postgres(databaseUrl, { max: 1 });

try {
  for (const item of content) {
    const requestedCourseId = `course_${item.id}`;
    const [savedCourse] = await sql`
      insert into course (id, slug, title, description, status, enrollment_mode)
      values (${requestedCourseId}, ${item.slug}, ${item.sourceTitle}, ${item.summary.slice(0, 500)}, 'published', ${item.slug === foundationsOnline.slug ? "self_service" : "manual"})
      on conflict (slug) do update set title = excluded.title, description = excluded.description, enrollment_mode = excluded.enrollment_mode, updated_at = now()
      returning id
    `;
    const courseId = savedCourse.id;

    if (item.slug === foundationsOnline.slug) {
      await sql`update lesson set published = false, updated_at = now() where course_id = ${courseId} and slug = 'welcome'`;
      let position = 1;
      for (const section of foundationsOnline.sections) {
        for (const importedLesson of section.lessons) {
          await sql`
            insert into lesson (id, course_id, slug, title, summary, content, position, section_title, published)
            values (${`legacy_lesson_${importedLesson.sourceId}`}, ${courseId}, ${importedLesson.slug}, ${importedLesson.title}, ${importedLesson.summary}, ${importedLesson.content}, ${position++}, ${section.title}, true)
            on conflict (course_id, slug) do update set title = excluded.title, summary = excluded.summary, content = excluded.content, position = excluded.position, section_title = excluded.section_title, published = true, updated_at = now()
          `;
        }
      }
    } else {
      await sql`
        insert into lesson (id, course_id, slug, title, summary, content, position, section_title, published)
        values (
          ${randomUUID()}, ${courseId}, 'welcome', 'شروع مسیر یادگیری',
          'آشنایی با ساختار دوره و شیوه استفاده از فضای هنرجویی.',
          ${`به دوره «${item.sourceTitle}» خوش آمدید. این درس نخست برای اطمینان از دسترسی شما و آشنایی با مسیر یادگیری آماده شده است. محتوای کامل دوره در مرحله‌های بعدی به همین فضای محافظت‌شده افزوده خواهد شد.`},
          1, 'شروع دوره', true
        )
        on conflict (course_id, slug) do update set title = excluded.title, summary = excluded.summary, content = excluded.content, position = excluded.position, section_title = excluded.section_title, published = true, updated_at = now()
      `;
    }
  }
  const importedLessonCount = foundationsOnline.sections.reduce((total, section) => total + section.lessons.length, 0);
  console.log(`Seeded ${content.length} courses, placeholder welcome lessons, and ${importedLessonCount} foundations lessons.`);
} finally {
  await sql.end();
}
