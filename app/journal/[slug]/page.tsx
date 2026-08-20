import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleContent } from "../ArticleContent";
import { articlePreview, articles } from "../data";
import { formatArticleDate } from "../utils";

type ArticlePageProps = { params: Promise<{ slug: string }> };

function findArticle(slug: string) {
  return articles.find((article) => article.slug === decodeURIComponent(slug));
}

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = findArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.summary,
    openGraph: { images: [{ url: article.cover.src, alt: article.cover.alt }] },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = findArticle((await params).slug);
  if (!article) notFound();
  const related = articles
    .filter((item) => item.id !== article.id && item.category.id === article.category.id)
    .slice(0, 3)
    .map(articlePreview);

  return (
    <article className="article-page">
      <header className="article-hero article-hero-split">
        <div className="article-hero-copy">
          <Link className="article-back" href="/journal">مجله آکادمی <span>←</span></Link>
          <div className="article-meta"><span>{article.category.label}</span><span>{formatArticleDate(article.publishedAt)}</span></div>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
        </div>
        <div className="article-hero-image">
          <img
            src={article.cover.src}
            alt={article.cover.alt}
            style={{ objectPosition: article.cover.position ?? "center" }}
          />
          <span>{article.category.label}</span>
        </div>
      </header>
      <div className="container article-layout">
        <ArticleContent blocks={article.blocks} recipe={article.recipe} />
        <aside className="article-sidebar">
          <div><span>موضوع</span><strong>{article.category.label}</strong></div>
          <div><span>تاریخ انتشار</span><strong>{formatArticleDate(article.publishedAt)}</strong></div>
          <Link className="button" href="/courses">مشاهده دوره‌ها</Link>
        </aside>
      </div>
      {related.length ? (
        <section className="related-articles section">
          <div className="container">
            <div className="heading-row"><div><span className="eyebrow">مطالب مرتبط</span><h2>در همین موضوع بخوانید</h2></div><Link className="arrow-link large" href="/journal">همه مطالب <span>←</span></Link></div>
            <div className="related-article-grid">
              {related.map((item) => (
                <article key={item.id}><Link href={item.href}><img src={item.cover.src} alt={item.cover.alt} style={{ objectPosition: item.cover.position ?? "center" }} /><span>{item.category.label}</span><h3>{item.title}</h3></Link></article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
