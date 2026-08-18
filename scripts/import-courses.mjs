import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const siteUrl = "https://sepehrsarlakacademy.com";
const apiUrl = `${siteUrl}/wp-json/wp/v2`;
const projectRoot = process.cwd();
const outputFile = path.join(projectRoot, "app", "courses", "content.json");

const courseSlugs = new Map([
  [5753, "cooking-foundations-onsite"],
  [4152, "cooking-foundations-online"],
  [5759, "cooking-techniques-intermediate"],
  [5761, "advanced-cooking"],
  [9689, "breakfast-workshop"],
  [9843, "sourdough-workshop"],
  [9885, "meze-workshop"],
  [9946, "iranian-comfort-food-workshop"],
]);

const namedEntities = {
  amp: "&", apos: "'", hellip: "…", laquo: "«", ldquo: "“", lsquo: "‘",
  nbsp: " ", quot: '"', raquo: "»", rdquo: "”", rsquo: "’", ndash: "–", mdash: "—",
};

function decodeEntities(value = "") {
  return value
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&([a-z]+);/gi, (entity, name) => namedEntities[name] ?? entity);
}

function plainText(value = "") {
  return decodeEntities(value).replace(/<br\s*\/?\s*>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeHtml(value = "") {
  return decodeEntities(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|form|object|embed|svg)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/\s(?:on\w+|style|srcset|sizes)=("[^"]*"|'[^']*')/gi, "")
    .replace(/(href|src)=("|')\s*javascript:[\s\S]*?\2/gi, '$1="#"')
    .replace(/<(h[1-6]|p)\b[^>]*>(?:\s|<br\s*\/?\s*>)*<\/\1>/gi, "");
}

function extensionFor(url, contentType = "") {
  const extension = path.extname(new URL(url).pathname).toLowerCase();
  if (/^\.(avif|gif|jpe?g|png|webp)$/.test(extension)) return extension;
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("avif")) return ".avif";
  return ".jpg";
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { "user-agent": "Academy course migration" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  return response.json();
}

async function downloadImage(url, basename, folder) {
  const response = await fetch(url, { headers: { "user-agent": "Academy course migration" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`);
  const extension = extensionFor(url, response.headers.get("content-type") ?? "");
  const relativeDirectory = path.posix.join("media", "courses", folder);
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
const fields = "id,date,slug,title,excerpt,content,featured_media";
const [products, onlineCourses] = await Promise.all([
  fetchJson(`${apiUrl}/product?per_page=100&_fields=${fields}`),
  fetchJson(`${apiUrl}/courses?per_page=100&_fields=${fields}`),
]);
const records = [...products, ...onlineCourses].filter((record) => courseSlugs.has(record.id));

const contents = await mapWithConcurrency(records, 4, async (record) => {
  const localSlug = courseSlugs.get(record.id);
  let content = sanitizeHtml(record.content?.rendered ?? "");
  const sourceImages = [...new Set(
    [...content.matchAll(/\b(?:src|data-src)=(?:"([^"]+)"|'([^']+)')/gi)]
      .map((match) => match[1] || match[2])
      .filter((url) => url?.startsWith(`${siteUrl}/wp-content/uploads/`)),
  )];
  const localImages = await mapWithConcurrency(sourceImages, 4, async (url, index) => {
    try {
      return [url, await downloadImage(url, `${localSlug}-${index + 1}`, "content")];
    } catch (error) {
      console.warn(`Could not download ${url}:`, error.message);
      return [url, url];
    }
  });
  for (const [sourceUrl, localUrl] of localImages) content = content.replaceAll(sourceUrl, localUrl);

  let cover = "";
  let coverAlt = plainText(record.title?.rendered);
  if (record.featured_media) {
    const media = await fetchJson(`${apiUrl}/media/${record.featured_media}?_fields=source_url,alt_text`);
    coverAlt = plainText(media.alt_text) || coverAlt;
    try {
      cover = await downloadImage(media.source_url, `${localSlug}-cover`, "covers");
    } catch (error) {
      console.warn(`Could not download cover for ${localSlug}:`, error.message);
    }
  }

  return {
    id: record.id,
    slug: localSlug,
    sourceType: record.id === 4152 ? "course" : "product",
    sourceTitle: plainText(record.title?.rendered),
    summary: plainText(record.excerpt?.rendered),
    cover,
    coverAlt,
    content,
  };
});

contents.sort((a, b) => [...courseSlugs.values()].indexOf(a.slug) - [...courseSlugs.values()].indexOf(b.slug));
await writeFile(outputFile, `${JSON.stringify(contents, null, 2)}\n`);
console.log(`Imported ${contents.length} course records to ${path.relative(projectRoot, outputFile)}.`);
