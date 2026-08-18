import Link from "next/link";
import type { ArticlePreview } from "./data";
import { formatArticleDate } from "./utils";

export function ArticleCard({ article, priority = false }: { article: ArticlePreview; priority?: boolean }) {
  return (
    <article className="article-card">
      <Link className="article-card-image" href={article.href} aria-label={`خواندن ${article.title}`}>
        <img src={article.image} alt={article.imageAlt} loading={priority ? "eager" : "lazy"} />
        <span>{article.category}</span>
      </Link>
      <div className="article-card-body">
        <small>{formatArticleDate(article.date)}</small>
        <h2><Link href={article.href}>{article.title}</Link></h2>
        <p>{article.summary}</p>
        <Link className="arrow-link" href={article.href}>ادامه مطلب <span>←</span></Link>
      </div>
    </article>
  );
}
