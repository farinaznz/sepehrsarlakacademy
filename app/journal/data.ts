import journalArticles from "./articles.json";
import type { Article, ArticlePreview } from "./content-model";

export type { Article, ArticlePreview } from "./content-model";

export const articles = journalArticles as Article[];

export function articlePreview(article: Article): ArticlePreview {
  return {
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    category: article.category,
    publishedAt: article.publishedAt,
    cover: article.cover,
    type: article.type,
    href: `/journal/${encodeURIComponent(article.slug)}`,
  };
}
