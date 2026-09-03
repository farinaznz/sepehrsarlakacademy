"use client";

import Link from "next/link";
import { authClient } from "../lib/auth-client";
import { Brand } from "./components";
import { MobileMenu } from "./MobileMenu";

export function SiteHeader() {
  const { data: current, isPending } = authClient.useSession();
  const userName = current?.user.name?.trim();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="راهبری اصلی">
          <Link href="/courses">دوره‌ها</Link>
          <Link href="/journal">مجله</Link>
          <Link href="/about">درباره آکادمی</Link>
        </nav>
        <div className="header-actions">
          {isPending ? <span className="desktop-only header-account-placeholder" aria-hidden="true" /> : userName ? <Link className="text-link desktop-only header-user" href="/dashboard" title={userName}>{userName}</Link> : <>
            <Link className="text-link desktop-only" href="/login">ورود هنرجویان</Link>
            <Link className="button button-small" href="/courses">انتخاب دوره</Link>
          </>}
          <MobileMenu userName={userName} sessionPending={isPending} />
        </div>
      </div>
    </header>
  );
}
