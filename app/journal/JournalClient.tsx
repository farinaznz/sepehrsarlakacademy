"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "./ArticleCard";
import type { ArticlePreview } from "./data";

export function JournalClient({ articles }: { articles: ArticlePreview[] }) {
  const categories = useMemo(() => ["همه", ...new Set(articles.map((article) => article.category))], [articles]);
  const [active, setActive] = useState("همه");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const normalizedQuery = query.trim();
    return articles.filter((article) => {
      const matchesCategory = active === "همه" || article.category === active;
      const matchesQuery = !normalizedQuery
        || article.title.includes(normalizedQuery)
        || article.summary.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [active, articles, query]);

  return (
    <>
      <div className="catalog-tools journal-tools">
        <div className="filter-list" aria-label="فیلتر موضوع مطالب">
          {categories.map((category) => (
            <button key={category} type="button" className={active === category ? "active" : ""} onClick={() => setActive(category)}>
              {category === "همه" ? "همه مطالب" : category}
            </button>
          ))}
        </div>
        <label className="course-search">
          <span className="sr-only">جست‌وجوی مطالب</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی مطلب..." />
          <span>⌕</span>
        </label>
      </div>
      <div className="catalog-summary"><p><strong>{visible.length}</strong> مطلب برای خواندن</p><span>مرتب‌سازی: تازه‌ترین</span></div>
      {visible.length ? (
        <div className="article-grid">
          {visible.map((article, index) => <ArticleCard key={article.id} article={article} priority={index < 3} />)}
        </div>
      ) : (
        <div className="empty-state"><h2>مطلبی پیدا نشد</h2><p>عبارت دیگری را جست‌وجو کنید یا موضوع را تغییر دهید.</p></div>
      )}
    </>
  );
}
