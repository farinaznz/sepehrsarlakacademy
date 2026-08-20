import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeArticle } from "./journal-content.mjs";

const projectRoot = process.cwd();
const articlesFile = path.join(projectRoot, "app", "journal", "articles.json");
const contentDirectory = path.join(projectRoot, "public", "media", "journal", "content");
const legacyVideoIds = [4258, 4620, 4666, 4694, 4729, 4736, 4781];
const legacyRecipeFacts = new Map([
  [4781, { duration: "60 دقیقه آماده‌سازی+60 دقیقه پخت+3 ساعت استراحت+ سرو 5 دقیقه", servings: "6 نفر", calories: "1450 کالری" }],
  [4736, { duration: "15 دقیقه+60 دقیقه پخت+6 ساعت استراحت+سرو 40 دقیقه", servings: "۸ نفر", calories: "9137 کالری" }],
  [4729, { duration: "۴۰ دقیقه + پخت گردن ۸ ساعت + پخت حلیم ۲ ساعت", servings: "۶-۸ نفر", calories: "۱۸۹۲ کالری" }],
  [4694, { duration: "40 دقیقه+ 10 دقیقه سرو", servings: "8تا 10 نفر", calories: "600 کالری" }],
  [4666, { duration: "۵ دقیقه+۴ ساعت استراحت+سرو 5 دقیقه", servings: "۷۰ عدد کوکی ۱۰ گرمی", calories: "۳۰۸۰ کالری" }],
  [4656, { duration: "15 دقیقه+سرو 10 دقیقه", servings: "15 عدد", calories: "850 کیلوکالری" }],
  [4620, { duration: "10 دقیقه+سرو 10 دقیقه", servings: "3 نفر", calories: "۱۰۵۰ کیلوکالری" }],
  [4258, { duration: "۹۵ دقیقه", servings: "۵ نفر", calories: "۱۰۰ کیلوکالری" }],
]);

for (const id of legacyVideoIds) {
  const source = path.join(contentDirectory, `${id}-1.jpg`);
  const destination = path.join(contentDirectory, `${id}-1.mp4`);
  try {
    await rename(source, destination);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

const current = JSON.parse(await readFile(articlesFile, "utf8"));
const normalized = current.map((article) => normalizeArticle({
  ...article,
  recipe: article.type === "recipe" && !Object.values(article.recipe ?? {}).some(Boolean)
    ? legacyRecipeFacts.get(article.id)
    : article.recipe,
}));
await writeFile(articlesFile, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Normalized ${normalized.length} journal entries.`);
