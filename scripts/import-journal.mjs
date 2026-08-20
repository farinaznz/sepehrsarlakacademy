import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeArticle } from "./journal-content.mjs";

const siteUrl = "https://sepehrsarlakacademy.com";
const apiUrl = `${siteUrl}/wp-json/wp/v2`;
const projectRoot = process.cwd();
const mediaRoot = path.join(projectRoot, "public", "media", "journal");
const outputFile = path.join(projectRoot, "app", "journal", "articles.json");
const coverOverrides = new Map([
  [4656, "/media/journal/covers/4656-cover.jpg"],
]);
const coverPositionOverrides = new Map([
  [8311, "right center"],
]);

const namedEntities = {
  amp: "&",
  apos: "'",
  hellip: "…",
  laquo: "«",
  ldquo: "“",
  lsquo: "‘",
  nbsp: " ",
  quot: '"',
  raquo: "»",
  rdquo: "”",
  rsquo: "’",
};

function decodeEntities(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities[name] ?? entity);
}

function plainText(value = "") {
  return decodeEntities(value)
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeHtml(value = "") {
  return decodeEntities(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|form|object|embed|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\s(?:on\w+|style|srcset|sizes)=("[^"]*"|'[^']*')/gi, "")
    .replace(/(href|src)=("|')\s*javascript:[\s\S]*?\2/gi, '$1="#"');
}

function safeSlug(value, id) {
  try {
    return decodeURIComponent(value);
  } catch {
    return `article-${id}`;
  }
}

function fileExtension(url, contentType = "") {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  if (/^\.(avif|gif|jpe?g|mp4|png|webm|webp)$/.test(extension)) return extension;
  if (contentType.includes("video/mp4")) return ".mp4";
  if (contentType.includes("video/webm")) return ".webm";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("avif")) return ".avif";
  return ".jpg";
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "user-agent": "Academy journal migration" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function downloadAsset(url, basename, subdirectory = "") {
  const response = await fetch(url, { headers: { "user-agent": "Academy journal migration" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const extension = fileExtension(url, response.headers.get("content-type") ?? "");
  const relativeDirectory = path.posix.join("media", "journal", subdirectory);
  const outputDirectory = path.join(projectRoot, "public", relativeDirectory);
  const filename = `${basename}${extension}`;
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, filename), Buffer.from(await response.arrayBuffer()));
  return `/${path.posix.join(relativeDirectory, filename)}`;
}

async function mapWithConcurrency(items, limit, mapper) {
  const output = new Array(items.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      output[index] = await mapper(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return output;
}

await mkdir(path.dirname(outputFile), { recursive: true });
await mkdir(mediaRoot, { recursive: true });

const [posts, categories] = await Promise.all([
  fetchJson(`${apiUrl}/posts?per_page=100&_fields=id,date,slug,title,excerpt,content,featured_media,categories`),
  fetchJson(`${apiUrl}/categories?per_page=100&_fields=id,name`),
]);

const categoryNames = new Map(categories.map((category) => [category.id, plainText(category.name)]));
const mediaIds = [...new Set(posts.map((post) => post.featured_media).filter(Boolean))];
const mediaEntries = await mapWithConcurrency(mediaIds, 6, async (id) => {
  const media = await fetchJson(`${apiUrl}/media/${id}?_fields=source_url,alt_text`);
  return [id, media];
});
const mediaById = new Map(mediaEntries);

const articles = await mapWithConcurrency(posts, 4, async (post) => {
  const slug = safeSlug(post.slug, post.id);
  let content = sanitizeHtml(post.content?.rendered ?? "");
  const sourceImages = [...new Set(
    [...content.matchAll(/\b(?:src|data-src)=(?:"([^"]+)"|'([^']+)')/gi)]
      .map((match) => match[1] || match[2])
      .filter((url) => url?.startsWith(`${siteUrl}/wp-content/uploads/`)),
  )];

  const localImages = await mapWithConcurrency(sourceImages, 4, async (url, index) => {
    try {
      const localUrl = await downloadAsset(url, `${post.id}-${index + 1}`, "content");
      return [url, localUrl];
    } catch (error) {
      console.warn(`Could not download inline image ${url}:`, error.message);
      return [url, url];
    }
  });
  for (const [sourceUrl, localUrl] of localImages) content = content.replaceAll(sourceUrl, localUrl);

  const featured = mediaById.get(post.featured_media);
  let image = coverOverrides.get(post.id) ?? "/media/article-chef-skills.jpg";
  if (!coverOverrides.has(post.id) && featured?.source_url) {
    try {
      image = await downloadAsset(featured.source_url, `${post.id}-cover`, "covers");
    } catch (error) {
      console.warn(`Could not download cover for post ${post.id}:`, error.message);
    }
  }

  const article = normalizeArticle({
    id: post.id,
    slug,
    title: plainText(post.title?.rendered),
    category: categoryNames.get(post.categories?.[0]) ?? "مجله آکادمی",
    summary: plainText(post.excerpt?.rendered),
    date: post.date,
    image,
    imageAlt: plainText(featured?.alt_text) || plainText(post.title?.rendered),
    href: `/journal/${encodeURIComponent(slug)}`,
    content,
  });
  const coverPosition = coverPositionOverrides.get(post.id);
  if (coverPosition) article.cover.position = coverPosition;
  return article;
});

await writeFile(outputFile, `${JSON.stringify(articles, null, 2)}\n`);
console.log(`Imported ${articles.length} articles to ${path.relative(projectRoot, outputFile)}.`);
