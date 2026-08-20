import Link from "next/link";
import type { ArticlePreview } from "./data";
import { formatArticleDate } from "./utils";
import { withBasePath } from "../site-path";

export function ArticleCard({ article, priority = false }: { article: ArticlePreview; priority?: boolean }) {
  return (
    <article className="article-card">
      <Link className="article-card-image" href={article.href} aria-label={`خواندن ${article.title}`}>
        <img
          src={withBasePath(article.cover.src)}
          alt={article.cover.alt}
          loading={priority ? "eager" : "lazy"}
          style={{ objectPosition: article.cover.position ?? "center" }}
        />
        <span>{article.category.label}</span>
      </Link>
      <div className="article-card-body">
        <small>{formatArticleDate(article.publishedAt)}</small>
        <h2><Link href={article.href}>{article.title}</Link></h2>
        <p>{article.summary}</p>
        <Link className="arrow-link" href={article.href}>ادامه مطلب <span>←</span></Link>
      </div>
    </article>
  );
}
