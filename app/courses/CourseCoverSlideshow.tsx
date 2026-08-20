"use client";

import { useEffect, useState } from "react";
import { withBasePath } from "../site-path";

type CourseSlide = { src: string; alt: string };

export function CourseCoverSlideshow({ slides }: { slides: CourseSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [active, slides.length]);

  function move(direction: -1 | 1) {
    setActive((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <div className="course-cover-slideshow" aria-label="تصاویر دوره">
      {slides.map((slide, index) => (
        <img
          key={slide.src}
          className={index === active ? "is-active" : ""}
          src={withBasePath(slide.src)}
          alt={index === 0 ? slide.alt : ""}
          loading={index === 0 ? "eager" : "lazy"}
          aria-hidden={index !== active}
        />
      ))}
      {slides.length > 1 ? (
        <>
          <div className="course-cover-controls">
            <button type="button" onClick={() => move(-1)} aria-label="تصویر قبلی">
              <span className="course-cover-arrow is-left" aria-hidden="true" />
            </button>
            <button type="button" onClick={() => move(1)} aria-label="تصویر بعدی">
              <span className="course-cover-arrow is-right" aria-hidden="true" />
            </button>
          </div>
          <div className="course-cover-progress" aria-hidden="true">
            <span>{(active + 1).toLocaleString("fa-IR")} / {slides.length.toLocaleString("fa-IR")}</span>
            <i key={active} />
          </div>
        </>
      ) : null}
    </div>
  );
}
