import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter, SiteHeader } from "./components";

export const metadata: Metadata = {
  title: {
    default: "آکادمی آشپزی سپهر سرلک",
    template: "%s | آکادمی سپهر سرلک",
  },
  description: "آموزش حضوری و آنلاین آشپزی حرفه‌ای با سپهر سرلک؛ از تکنیک‌های پایه تا ساخت امضای شخصی.",
  openGraph: {
    title: "آکادمی آشپزی سپهر سرلک",
    description: "آشپزی، فقط دستور پخت نیست.",
    type: "website",
    locale: "fa_IR",
    images: [{ url: "/og.png", width: 1792, height: 932, alt: "آکادمی آشپزی سپهر سرلک" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "آکادمی آشپزی سپهر سرلک",
    description: "آشپزی، فقط دستور پخت نیست.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body>
        <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
