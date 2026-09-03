import { Parser } from "htmlparser2";

const containerTags = new Set(["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "blockquote", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "a"]);

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function safeUrl(value: string, image = false) {
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (image && url.hostname !== "sepehrsarlakacademy.com" && url.hostname !== "www.sepehrsarlakacademy.com") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeLessonContent(value: string) {
  const source = value.trim();
  if (!source) return "";
  if (!/<[a-z][\s\S]*>/i.test(source)) {
    return source.split(/\n{2,}/).map((paragraph) => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`).join("");
  }

  let output = "";
  const openTags: string[] = [];
  let blockedDepth = 0;
  const parser = new Parser({
    onopentag(name, attributes) {
      const tag = name.toLowerCase();
      if (tag === "script" || tag === "style") { blockedDepth += 1; return; }
      if (blockedDepth) return;
      if (containerTags.has(tag)) {
        if (tag === "a") {
          const href = attributes.href ? safeUrl(attributes.href) : null;
          output += href ? `<a href="${escapeHtml(href)}" rel="noreferrer noopener">` : "<a>";
        } else output += `<${tag}>`;
        openTags.push(tag);
      } else if (tag === "br") output += "<br>";
      else if (tag === "img") {
        const src = attributes.src ? safeUrl(attributes.src, true) : null;
        if (src) output += `<img src="${escapeHtml(src)}" alt="${escapeHtml(attributes.alt ?? "")}" loading="lazy">`;
      }
    },
    ontext(text) { if (!blockedDepth) output += escapeHtml(text); },
    onclosetag(name) {
      const tag = name.toLowerCase();
      if (tag === "script" || tag === "style") { blockedDepth = Math.max(0, blockedDepth - 1); return; }
      if (blockedDepth) return;
      if (!containerTags.has(tag)) return;
      const lastIndex = openTags.lastIndexOf(tag);
      if (lastIndex < 0) return;
      for (let index = openTags.length - 1; index >= lastIndex; index -= 1) output += `</${openTags.pop()}>`;
    },
  }, { decodeEntities: true });
  parser.write(source);
  parser.end();
  while (openTags.length) output += `</${openTags.pop()}>`;
  return output;
}
