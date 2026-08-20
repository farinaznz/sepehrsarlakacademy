import { parseDocument } from "htmlparser2";

const inlineTags = new Set(["strong", "b", "em", "i", "code", "sup", "sub", "br", "a"]);
const sectionHeadings = new Set([
  "درباره مدرس",
  "در این دوره چه خواهید آموخت؟",
  "در این دوره سرفصل‌های زیر را یاد می‌گیرید:",
  "این دوره برای چه کسانی مناسب است؟",
  "ویژگی‌های دوره",
  "ویژگی‌های دوره:",
  "منابع دوره",
  "منابع دوره:",
  "پیش‌نیاز دوره",
  "شرایط ثبت‌نام",
]);
const factLabels = new Set(["شرایط پرداخت", "محل برگزاری", "مدرسان دوره", "ظرفیت", "زمان‌بندی دوره"]);

function escapeHtml(value = "") {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function cleanWhitespace(value = "") {
  return value.replace(/\u00a0/g, " ").replace(/[ \t\r\f\v]+/g, " ").replace(/\s*\n\s*/g, " ").trim();
}

function textFromHtml(html = "") {
  return cleanWhitespace(html.replace(/<br>/g, " ").replace(/<[^>]+>/g, " "));
}

function headingText(html = "") {
  return textFromHtml(html).replace(/\s+([:：؟])/g, "$1");
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

function normalizedTitle(value = "") {
  return textFromHtml(value).replace(/[\s‌–—:،؛؟?!]+/g, "").toLowerCase();
}

function isDuplicateTitle(html, courseTitle) {
  return normalizedTitle(html) === normalizedTitle(courseTitle);
}

function isWholeStrong(html) {
  return /^<strong>[^]*<\/strong>$/.test(html) && !/<\/strong>\s*<strong>/.test(html);
}

function listMarker(html) {
  const text = textFromHtml(html);
  const ordered = text.match(/^[۰-۹\d]+[.)]\s*/);
  if (ordered) return { style: "ordered", html: cleanWhitespace(html.replace(/^[۰-۹\d]+[.)]\s*/, "")) };
  const unordered = text.match(/^[•·▪●–—-]\s*/);
  if (unordered) return { style: "unordered", html: cleanWhitespace(html.replace(/^[•·▪●–—-]\s*/, "")) };
  return null;
}

function factsFromLines(lines) {
  const items = lines.map((html) => {
    const text = textFromHtml(html);
    const match = text.match(/^([^:：]{2,32})[:：]\s*(.+)$/);
    if (!match || !factLabels.has(match[1].trim())) return null;
    return { label: match[1].trim(), value: escapeHtml(match[2].trim()) };
  });
  return items.every(Boolean) ? items : null;
}

function isCallout(html) {
  const text = textFromHtml(html);
  return /(مبلغ|هزینه).*(میلیون|تومان)|پرداخت نقدی.*تخفیف/.test(text);
}

function paragraphBlocks(html, { courseTitle, first = false } = {}) {
  const lines = html.split(/<br>/).map(cleanWhitespace).filter((line) => textFromHtml(line));
  if (!lines.length) return [];
  if (lines.length > 1) {
    const firstText = headingText(lines[0]);
    if (sectionHeadings.has(firstText)) {
      const remaining = lines.slice(1);
      const markers = remaining.map(listMarker);
      const items = markers.map((marker, index) => marker?.html ?? remaining[index]);
      return [
        { type: "heading", level: 2, html: escapeHtml(firstText.replace(/:$/, "")) },
        ...(remaining.length === 1
          ? [{ type: isCallout(remaining[0]) ? "callout" : "paragraph", html: remaining[0] }]
          : [{ type: "list", style: markers.every((marker) => marker?.style === "ordered") ? "ordered" : "unordered", items }]),
      ];
    }
    const facts = factsFromLines(lines);
    if (facts) return [{ type: "facts", items: facts }];
    const markers = lines.map(listMarker);
    if (markers.every(Boolean)) return [{ type: "list", style: markers.every((marker) => marker.style === "ordered") ? "ordered" : "unordered", items: markers.map((marker) => marker.html) }];
    if (lines.length >= 3 && lines.every((line) => textFromHtml(line).length < 110)) {
      return [{ type: "list", style: "unordered", items: lines }];
    }
    return lines.map((line, index) => ({ type: isCallout(line) ? "callout" : "paragraph", html: line, ...(first && index === 0 ? { lead: true } : {}) }));
  }
  const text = headingText(html);
  if (isDuplicateTitle(html, courseTitle)) return [];
  if (sectionHeadings.has(text)) return [{ type: "heading", level: 2, html: escapeHtml(text.replace(/:$/, "")) }];
  if (isCallout(html)) return [{ type: "callout", html }];
  return [{ type: "paragraph", html, ...(first && isWholeStrong(html) ? { lead: true } : {}) }];
}

function mergeBlocks(blocks, courseTitle) {
  const output = [];
  for (const block of blocks) {
    if (block.type === "heading" && isDuplicateTitle(block.html, courseTitle)) continue;
    const previous = output.at(-1);
    if (block.type === "list" && previous?.type === "list" && previous.style === block.style) {
      previous.items.push(...block.items);
      continue;
    }
    if (block.type === "paragraph" && previous?.type === "paragraph" && previous.html === block.html) continue;
    if (block.type === "callout" && previous?.type === "callout") {
      previous.html = `${previous.html}<br>${block.html}`;
      continue;
    }
    output.push(block);
  }
  for (let index = 0; index < output.length - 2; index += 1) {
    if (output[index].type === "heading" && textFromHtml(output[index].html) === "درباره مدرس" && output[index + 1].type === "image" && output[index + 2].type === "paragraph") {
      output.splice(index + 1, 2, { type: "profile", image: output[index + 1].image, html: output[index + 2].html });
    }
  }
  return output;
}

export function htmlToCourseBlocks(html = "", { courseTitle = "دوره", fallbackAlt = "مدرس دوره" } = {}) {
  const document = parseDocument(html, { decodeEntities: true });
  const blocks = [];

  function visit(node) {
    if (node.type !== "tag" && node.type !== "root") return;
    const name = node.name;
    if (/^h[1-6]$/.test(name)) {
      const htmlValue = richText(node.children ?? []);
      if (htmlValue) blocks.push({ type: "heading", level: name === "h3" || name === "h4" ? 3 : 2, html: htmlValue });
      return;
    }
    if (name === "p") {
      const image = (node.children ?? []).find((child) => child.type === "tag" && child.name === "img");
      if (image) {
        const src = image.attribs?.src || image.attribs?.["data-src"];
        if (src) blocks.push({ type: "image", image: { src, alt: cleanWhitespace(image.attribs?.alt || fallbackAlt) } });
        return;
      }
      const htmlValue = richText(node.children ?? []);
      if (htmlValue) blocks.push(...paragraphBlocks(htmlValue, { courseTitle, first: blocks.length === 0 }));
      return;
    }
    if (name === "ul" || name === "ol") {
      const items = (node.children ?? []).filter((child) => child.type === "tag" && child.name === "li").map((item) => richText(item.children ?? [])).filter(Boolean);
      if (items.length) blocks.push({ type: "list", style: name === "ol" ? "ordered" : "unordered", items });
      return;
    }
    if (name === "div") {
      const image = (node.children ?? []).find((child) => child.type === "tag" && child.name === "img");
      if (image) {
        const src = image.attribs?.src || image.attribs?.["data-src"];
        const remaining = richText((node.children ?? []).filter((child) => child !== image));
        const profileHtml = cleanWhitespace(remaining.replace(/^<br>/, ""));
        const instructorName = textFromHtml(profileHtml).match(/^(.{2,40}?)\s+مدرس(?:\s|$)/)?.[1];
        if (src && profileHtml) blocks.push({
          type: "profile",
          image: { src, alt: cleanWhitespace(image.attribs?.alt || (instructorName ? `${instructorName}، مدرس دوره` : fallbackAlt)) },
          html: profileHtml,
        });
        return;
      }
    }
    for (const child of node.children ?? []) visit(child);
  }

  visit(document);
  return mergeBlocks(blocks, courseTitle).map((block) => block.type === "image" ? { type: "profile", image: block.image, html: "" } : block);
}

export function normalizeCourseContent(course) {
  const body = Array.isArray(course.body) ? course.body : htmlToCourseBlocks(course.content, { courseTitle: course.sourceTitle, fallbackAlt: `مدرس ${course.sourceTitle}` });
  return {
    id: course.id,
    slug: course.slug,
    sourceType: course.sourceType,
    sourceTitle: cleanWhitespace(course.sourceTitle),
    summary: cleanWhitespace(course.summary),
    cover: course.cover,
    coverAlt: cleanWhitespace(course.coverAlt || course.sourceTitle),
    gallery: course.gallery ?? [],
    body,
  };
}
