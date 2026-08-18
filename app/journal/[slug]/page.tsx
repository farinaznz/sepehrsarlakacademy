import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles } from "../data";
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
    openGraph: { images: [{ url: article.image, alt: article.imageAlt }] },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = findArticle((await params).slug);
  if (!article) notFound();
  const related = articles.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 3);

  return (
    <article className="article-page">
      <header className="article-hero">
        <div className="container article-hero-inner">
          <Link className="article-back" href="/journal">مجله آکادمی <span>←</span></Link>
          <div className="article-meta"><span>{article.category}</span><span>{formatArticleDate(article.date)}</span></div>
          <h1>{article.title}</h1>
          <p>{article.summary}</p>
        </div>
      </header>
      <div className="container article-cover"><img src={article.image} alt={article.imageAlt} /></div>
      <div className="container article-layout">
        <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />
        <aside className="article-sidebar">
          <div><span>موضوع</span><strong>{article.category}</strong></div>
          <div><span>تاریخ انتشار</span><strong>{formatArticleDate(article.date)}</strong></div>
          <Link className="button" href="/courses">مشاهده دوره‌ها</Link>
        </aside>
      </div>
      {related.length ? (
        <section className="related-articles section">
          <div className="container">
            <div className="heading-row"><div><span className="eyebrow">مطالب مرتبط</span><h2>در همین موضوع بخوانید</h2></div><Link className="arrow-link large" href="/journal">همه مطالب <span>←</span></Link></div>
            <div className="related-article-grid">
              {related.map((item) => (
                <article key={item.id}><Link href={item.href}><img src={item.image} alt={item.imageAlt} /><span>{item.category}</span><h3>{item.title}</h3></Link></article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
