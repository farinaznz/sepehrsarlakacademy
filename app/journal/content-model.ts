export type JournalCategory = {
  id: string;
  label: string;
};

export type JournalMedia = {
  src: string;
  alt: string;
  aspectRatio: "16:9";
  caption?: string;
  position?: string;
};

export type JournalBlock =
  | { type: "paragraph"; html: string; lead?: boolean }
  | { type: "heading"; level: 2 | 3; html: string }
  | { type: "list"; style: "ordered" | "unordered"; items: string[] }
  | { type: "image"; src: string; alt: string; caption?: string; aspectRatio: "16:9" }
  | { type: "video"; src: string; title: string; aspectRatio: "16:9" }
  | { type: "quote"; html: string; cite?: string }
  | { type: "table"; rows: string[][]; headerRows: number };

export type RecipeDetails = {
  duration?: string;
  servings?: string;
  calories?: string;
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  category: JournalCategory;
  publishedAt: string;
  cover: JournalMedia;
  type: "article" | "recipe";
  blocks: JournalBlock[];
  recipe?: RecipeDetails;
};

export type ArticlePreview = Omit<Article, "blocks" | "recipe"> & { href: string };
