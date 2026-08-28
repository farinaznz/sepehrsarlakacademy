"use client";

import Link from "next/link";
import { useRef } from "react";

const links = [
  { href: "/courses", label: "دوره‌ها" },
  { href: "/journal", label: "مجله" },
  { href: "/about", label: "درباره آکادمی" },
  { href: "/login", label: "ورود هنرجویان" },
  { href: "/courses", label: "انتخاب دوره" },
];

export function MobileMenu() {
  const menuRef = useRef<HTMLDetailsElement>(null);

  const closeMenu = () => {
    menuRef.current?.removeAttribute("open");
  };

  return (
    <details className="mobile-menu" ref={menuRef}>
      <summary aria-label="باز کردن منو"><span></span><span></span></summary>
      <nav aria-label="راهبری موبایل">
        {links.map((link, index) => (
          <Link key={`${link.href}-${index}`} href={link.href} onClick={closeMenu}>
            {link.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
