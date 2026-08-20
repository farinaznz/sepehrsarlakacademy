"use client";

import { useEffect, useState } from "react";

type HeroSlide = {
  src: string;
  alt: string;
  position?: string;
};

export function HomeHeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [active, slides.length]);

  return slides.map((slide, index) => (
    <img
      key={slide.src}
      className={index === active ? "is-active" : ""}
      src={slide.src}
      alt={slide.alt}
      style={{ objectPosition: slide.position }}
      loading={index === 0 ? "eager" : "lazy"}
      aria-hidden={index !== active}
    />
  ));
}
