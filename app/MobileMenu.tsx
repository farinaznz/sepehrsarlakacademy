"use client";

import Link from "next/link";
import { useRef } from "react";

const publicLinks = [
  { href: "/courses", label: "دوره‌ها" },
  { href: "/journal", label: "مجله" },
  { href: "/about", label: "درباره آکادمی" },
];

export function MobileMenu({ userName, sessionPending = false }: { userName?: string; sessionPending?: boolean }) {
  const menuRef = useRef<HTMLDetailsElement>(null);
  const links = sessionPending
    ? publicLinks
    : userName
    ? [...publicLinks, { href: "/dashboard", label: userName }]
    : [...publicLinks, { href: "/login", label: "ورود هنرجویان" }, { href: "/courses", label: "انتخاب دوره" }];

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
