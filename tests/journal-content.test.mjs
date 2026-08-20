import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const articlesUrl = new URL("../app/journal/articles.json", import.meta.url);
const articles = JSON.parse(await readFile(articlesUrl, "utf8"));
const allowedBlocks = new Set(["paragraph", "heading", "list", "image", "video", "quote", "table"]);
const allowedCategories = new Map([
  ["recipes", "دستور پخت"],
  ["culinary-world", "دنیای آشپزی"],
  ["culinary-science", "علم و تکنیک"],
  ["career", "مسیر حرفه‌ای"],
  ["equipment", "ابزار و تجهیزات"],
]);

test("journal entries use the normalized editorial schema", () => {
  assert.equal(articles.length, 36);
  for (const article of articles) {
    assert.equal(typeof article.id, "number");
    assert.ok(article.slug && article.title && article.summary);
    assert.match(article.publishedAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.equal(article.category.label, allowedCategories.get(article.category.id));
    assert.equal(article.cover.aspectRatio, "16:9");
    assert.ok(article.cover.src && article.cover.alt);
    if (article.cover.position) assert.match(article.cover.position, /^(left|center|right|\d+%)( (top|center|bottom|\d+%))?$/);
    assert.ok(article.type === "article" || article.type === "recipe");
    assert.ok(Array.isArray(article.blocks) && article.blocks.length > 0);
    assert.equal("content" in article, false);

    for (const block of article.blocks) {
      assert.ok(allowedBlocks.has(block.type), `${article.id} has unsupported ${block.type} block`);
      if (block.type === "heading") assert.ok(block.level === 2 || block.level === 3);
      if (block.type === "paragraph" || block.type === "heading" || block.type === "quote") {
        assert.ok(block.html.trim());
        assert.doesNotMatch(block.html, /<(script|style|iframe)|\s(?:class|style|on\w+)=/i);
      }
      if (block.type === "list") assert.ok(block.items.length > 0 && block.items.every((item) => item.trim()));
      if (block.type === "image") {
        assert.equal(block.aspectRatio, "16:9");
        assert.ok(block.alt.trim());
      }
      if (block.type === "video") {
        assert.equal(block.aspectRatio, "16:9");
        assert.match(block.src, /\.(mp4|webm)$/i);
      }
      if (block.type === "table") assert.ok(block.rows.length > 0 && block.rows.every((row) => row.length > 0));
    }
  }
});

test("journal recipes expose reusable facts", () => {
  const recipes = articles.filter((article) => article.type === "recipe");
  assert.equal(recipes.length, 8);
  for (const recipe of recipes) {
    assert.equal(recipe.category.id, "recipes");
    assert.ok(recipe.recipe.duration);
    assert.ok(recipe.recipe.servings);
    assert.ok(recipe.recipe.calories);
  }
});

test("journal media paths resolve to correctly named local assets", async () => {
  const media = articles.flatMap((article) => [
    article.cover,
    ...article.blocks.filter((block) => block.type === "image" || block.type === "video"),
  ]);
  for (const asset of media) {
    assert.match(asset.src, /^\/media\//);
    await access(new URL(`../public${asset.src}`, import.meta.url));
  }
});

test("the homepage reads journal previews through the normalized schema", async () => {
  const homepage = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(homepage, /map\(articlePreview\)/);
  assert.doesNotMatch(homepage, /article(?:s\[0\])?\.(?:date|image|imageAlt)\b/);
});
