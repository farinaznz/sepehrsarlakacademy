import journalArticles from "./articles.json";

export type Article = {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  date: string;
  image: string;
  imageAlt: string;
  href: string;
  content: string;
};

export type ArticlePreview = Omit<Article, "content">;

export const articles = journalArticles as Article[];
