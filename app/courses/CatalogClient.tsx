"use client";

import { useMemo, useState } from "react";
import { CourseCard } from "../components";
import { courses } from "../data";

const filters = ["همه", "حضوری", "آنلاین"] as const;
type CourseFilter = (typeof filters)[number];

export function CatalogClient({ initialFilter = "همه" }: { initialFilter?: CourseFilter }) {
  const [active, setActive] = useState<CourseFilter>(initialFilter);
  const [query, setQuery] = useState("");

  const visible = useMemo(() => courses.filter((course) => {
    const matchesCategory = active === "همه" || course.format === active;
    const matchesQuery = course.title.includes(query.trim()) || course.subtitle.includes(query.trim());
    return matchesCategory && matchesQuery;
  }), [active, query]);

  return (
    <>
      <div className="catalog-tools">
        <div className="filter-list" aria-label="فیلتر شیوه برگزاری دوره">
          {filters.map((filter) => (
            <button key={filter} type="button" className={active === filter ? "active" : ""} onClick={() => setActive(filter)}>
              {filter === "همه" ? "همه دوره‌ها" : filter}
            </button>
          ))}
        </div>
        <label className="course-search">
          <span className="sr-only">جست‌وجوی دوره</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="جست‌وجوی دوره..." />
          <span>⌕</span>
        </label>
      </div>
      <div className="catalog-summary"><p><strong>{visible.length}</strong> دوره برای یادگیری</p><span>مرتب‌سازی: پیشنهادی</span></div>
      {visible.length ? (
        <div className="course-grid catalog-grid">
          {visible.map((course, index) => <CourseCard key={course.slug} course={course} priority={index < 2} />)}
        </div>
      ) : (
        <div className="empty-state"><h2>دوره‌ای پیدا نشد</h2><p>عبارت دیگری را جست‌وجو کنید یا فیلترها را تغییر دهید.</p></div>
      )}
    </>
  );
}
