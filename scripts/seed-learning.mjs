import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const content = JSON.parse(await readFile(new URL("../app/courses/content.json", import.meta.url), "utf8"));
const sql = postgres(databaseUrl, { max: 1 });

try {
  for (const item of content) {
    const courseId = `course_${item.id}`;
    await sql`
      insert into course (id, slug, title, description, status)
      values (${courseId}, ${item.slug}, ${item.sourceTitle}, ${item.summary.slice(0, 500)}, 'published')
      on conflict (slug) do update set title = excluded.title, description = excluded.description, updated_at = now()
    `;
    await sql`
      insert into lesson (id, course_id, slug, title, summary, content, position, published)
      values (
        ${randomUUID()}, ${courseId}, 'welcome', 'شروع مسیر یادگیری',
        'آشنایی با ساختار دوره و شیوه استفاده از فضای هنرجویی.',
        ${`به دوره «${item.sourceTitle}» خوش آمدید. این درس نخست برای اطمینان از دسترسی شما و آشنایی با مسیر یادگیری آماده شده است. محتوای کامل دوره در مرحله‌های بعدی به همین فضای محافظت‌شده افزوده خواهد شد.`},
        1, true
      )
      on conflict (course_id, slug) do update set title = excluded.title, summary = excluded.summary, content = excluded.content, published = true, updated_at = now()
    `;
  }
  console.log(`Seeded ${content.length} courses and protected welcome lessons.`);
} finally {
  await sql.end();
}
