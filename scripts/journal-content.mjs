import { parseDocument } from "htmlparser2";

const categoryMap = new Map([
  ["مسیر ورود به آشپزی حرفه ای", ["career", "مسیر حرفه‌ای"]],
  ["دنیای آشپزی", ["culinary-world", "دنیای آشپزی"]],
  ["آموزش علمی آشپزی", ["culinary-science", "علم و تکنیک"]],
  ["دوره ها و مسیر های مهارتی", ["career", "مسیر حرفه‌ای"]],
  ["معرفی مواد اولیه", ["culinary-science", "علم و تکنیک"]],
  ["رستوران ها", ["culinary-world", "دنیای آشپزی"]],
  ["دسته‌بندی نشده", ["culinary-world", "دنیای آشپزی"]],
  ["راهنما و ابزار و تجهیزات", ["equipment", "ابزار و تجهیزات"]],
  ["دستور پخت", ["recipes", "دستور پخت"]],
]);

const categoryIdMap = new Map([
  ["recipes", ["recipes", "دستور پخت"]],
  ["culinary-world", ["culinary-world", "دنیای آشپزی"]],
  ["restaurants", ["culinary-world", "دنیای آشپزی"]],
  ["uncategorized", ["culinary-world", "دنیای آشپزی"]],
  ["culinary-science", ["culinary-science", "علم و تکنیک"]],
  ["ingredients", ["culinary-science", "علم و تکنیک"]],
  ["career", ["career", "مسیر حرفه‌ای"]],
  ["learning-paths", ["career", "مسیر حرفه‌ای"]],
  ["equipment", ["equipment", "ابزار و تجهیزات"]],
]);

const inlineTags = new Set(["strong", "b", "em", "i", "code", "sup", "sub", "br", "a"]);

function escapeHtml(value = "") {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cleanWhitespace(value = "") {
  return value.replace(/\u00a0/g, " ").replace(/[ \t\r\f\v]+/g, " ").replace(/\s*\n\s*/g, " ").trim();
}

function textContent(node) {
  if (!node) return "";
  if (node.type === "text") return node.data ?? "";
  return (node.children ?? []).map(textContent).join("");
}

function richText(nodes = []) {
  return cleanWhitespace(nodes.map((node) => {
    if (node.type === "text") return escapeHtml(node.data ?? "");
    if (node.type !== "tag") return "";
    if (!inlineTags.has(node.name)) return richText(node.children ?? []);
    if (node.name === "br") return "<br>";
    const tag = node.name === "b" ? "strong" : node.name === "i" ? "em" : node.name;
    const href = tag === "a" && /^(https?:\/\/|mailto:|\/|#)/.test(node.attribs?.href ?? "")
      ? ` href="${escapeHtml(node.attribs.href)}"`
      : "";
    return `<${tag}${href}>${richText(node.children ?? [])}</${tag}>`;
  }).join(""));
}

function mediaSource(node) {
  return node.attribs?.src || node.attribs?.["data-src"] || "";
}

function imageBlock(node, fallbackAlt, caption) {
  const src = mediaSource(node);
  if (!src) return null;
  return {
    type: "image",
    src,
    alt: cleanWhitespace(node.attribs?.alt || fallbackAlt),
    ...(caption ? { caption } : {}),
    aspectRatio: "16:9",
  };
}

function videoBlock(node, fallbackAlt) {
  const src = mediaSource(node).replace(/\.jpg(?=($|[?#]))/i, ".mp4");
  if (!src) return null;
  return {
    type: "video",
    src,
    title: fallbackAlt,
    aspectRatio: "16:9",
  };
}

function tableBlock(node) {
  const rows = [];
  let headerRows = 0;
  const visit = (current, inHead = false) => {
    if (current.type !== "tag") return;
    if (current.name === "tr") {
      const cells = (current.children ?? [])
        .filter((child) => child.type === "tag" && (child.name === "td" || child.name === "th"))
        .map((cell) => richText(cell.children ?? []));
      if (cells.some(Boolean)) {
        rows.push(cells);
        if (inHead || (current.children ?? []).some((child) => child.type === "tag" && child.name === "th")) headerRows += 1;
      }
      return;
    }
    for (const child of current.children ?? []) visit(child, inHead || current.name === "thead");
  };
  visit(node);
  return rows.length ? { type: "table", rows, headerRows } : null;
}

function dedupeBlocks(blocks) {
  const output = [];
  for (const block of blocks) {
    const previous = output.at(-1);
    if (block.type === "paragraph" && previous?.type === "paragraph" && previous.html === block.html) continue;
    output.push(block);
  }
  return output;
}

export function htmlToBlocks(html = "", { fallbackAlt = "تصویر مقاله" } = {}) {
  const document = parseDocument(html, { decodeEntities: true });
  const blocks = [];

  function visit(node, insideSemanticBlock = false) {
    if (node.type !== "tag" && node.type !== "root") return;
    const name = node.name;

    if (/^h[1-6]$/.test(name)) {
      const htmlValue = richText(node.children ?? []);
      if (htmlValue) blocks.push({ type: "heading", level: name === "h3" || name === "h4" ? 3 : 2, html: htmlValue });
      return;
    }
    if (name === "p") {
      const media = (node.children ?? []).find((child) => child.type === "tag" && (child.name === "img" || child.name === "video"));
      if (media?.name === "img") {
        const block = imageBlock(media, fallbackAlt);
        if (block) blocks.push(block);
      } else if (media?.name === "video") {
        const block = videoBlock(media, fallbackAlt);
        if (block) blocks.push(block);
      } else {
        const htmlValue = richText(node.children ?? []);
        if (htmlValue) blocks.push({ type: "paragraph", html: htmlValue });
      }
      return;
    }
    if (name === "ul" || name === "ol") {
      const items = (node.children ?? [])
        .filter((child) => child.type === "tag" && child.name === "li")
        .map((item) => richText(item.children ?? []))
        .filter(Boolean);
      if (items.length) blocks.push({ type: "list", style: name === "ol" ? "ordered" : "unordered", items });
      return;
    }
    if (name === "blockquote") {
      const htmlValue = richText(node.children ?? []);
      if (htmlValue) blocks.push({ type: "quote", html: htmlValue });
      return;
    }
    if (name === "table") {
      const block = tableBlock(node);
      if (block) blocks.push(block);
      return;
    }
    if (name === "figure") {
      const image = (node.children ?? []).find((child) => child.type === "tag" && child.name === "img");
      const captionNode = (node.children ?? []).find((child) => child.type === "tag" && child.name === "figcaption");
      const block = image ? imageBlock(image, fallbackAlt, captionNode ? cleanWhitespace(textContent(captionNode)) : undefined) : null;
      if (block) blocks.push(block);
      return;
    }
    if (name === "img") {
      const block = imageBlock(node, fallbackAlt);
      if (block) blocks.push(block);
      return;
    }
    if (name === "video") {
      const block = videoBlock(node, fallbackAlt);
      if (block) blocks.push(block);
      return;
    }
    for (const child of node.children ?? []) visit(child, insideSemanticBlock);
  }

  visit(document);
  const normalized = dedupeBlocks(blocks);
  if (normalized[0]?.type === "heading" && cleanWhitespace(textContentFromHtml(normalized[0].html)).length > 140) {
    normalized[0] = { type: "paragraph", html: normalized[0].html, lead: true };
  }
  return normalized;
}

function textContentFromHtml(html = "") {
  return html.replace(/<br>/g, " ").replace(/<[^>]+>/g, " ");
}

export function normalizeCategory(category = "") {
  const currentId = typeof category === "object" ? category.id : undefined;
  const currentLabel = typeof category === "object" ? category.label : category;
  const [id, label] = categoryIdMap.get(currentId)
    ?? categoryMap.get(cleanWhitespace(currentLabel))
    ?? ["culinary-world", "دنیای آشپزی"];
  return { id, label };
}

function factValue(paragraphs, pattern) {
  const value = paragraphs.find((paragraph) => pattern.test(paragraph));
  return value ? cleanWhitespace(value.replace(pattern, "")) : undefined;
}

export function inferRecipeDetails(blocks, categoryId) {
  if (categoryId !== "recipes") return undefined;
  const paragraphs = blocks.filter((block) => block.type === "paragraph").slice(0, 6).map((block) => cleanWhitespace(textContentFromHtml(block.html)));
  const details = {
    duration: factValue(paragraphs, /^زمان[^:]*:\s*/),
    servings: factValue(paragraphs, /^سرو برای\s*:\s*/),
    calories: factValue(paragraphs, /^کالری(?: مجموع)?\s*:\s*/),
  };
  return Object.values(details).some(Boolean) ? details : {};
}

export function normalizeArticle(article) {
  let category = normalizeCategory(article.category);
  let blocks = Array.isArray(article.blocks) ? article.blocks : htmlToBlocks(article.content, { fallbackAlt: article.title });
  const headingText = blocks
    .filter((block) => block.type === "heading")
    .map((block) => cleanWhitespace(textContentFromHtml(block.html)));
  const isRecipe = category.id === "recipes"
    || (headingText.includes("دستور") && headingText.includes("دستور پخت"));
  if (isRecipe) category = { id: "recipes", label: "دستور پخت" };
  const storedRecipe = article.recipe && Object.values(article.recipe).some(Boolean) ? article.recipe : undefined;
  const recipe = isRecipe ? storedRecipe ?? inferRecipeDetails(blocks, "recipes") : undefined;
  if (isRecipe) {
    blocks = blocks.filter((block, index) => !(index < 6 && block.type === "paragraph" && /^(زمان[^:]*|سرو برای|کالری(?: مجموع)?)\s*:/.test(cleanWhitespace(textContentFromHtml(block.html)))));
  }
  return {
    id: article.id,
    slug: article.slug,
    title: cleanWhitespace(article.title),
    summary: cleanWhitespace(article.summary),
    category,
    publishedAt: article.publishedAt ?? article.date,
    cover: article.cover ?? {
      src: article.image,
      alt: cleanWhitespace(article.imageAlt || article.title),
      aspectRatio: "16:9",
    },
    type: isRecipe ? "recipe" : "article",
    blocks,
    ...(isRecipe ? { recipe } : {}),
  };
}
