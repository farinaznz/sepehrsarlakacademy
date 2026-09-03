import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SiteFooter } from "./components";
import { SiteHeader } from "./SiteHeader";
import { withBasePath } from "./site-path";

const ekraan = localFont({
  variable: "--font-ekraan",
  display: "swap",
  src: [
    { path: "../public/fonts/Ekraan-Light.woff", weight: "300" },
    { path: "../public/fonts/Ekraan-Regular.woff", weight: "400" },
    { path: "../public/fonts/Ekraan-SemiBold.woff", weight: "600" },
    { path: "../public/fonts/Ekraan-Bold.woff", weight: "700" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://new.sepehrsarlakacademy.com"),
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
    images: [{ url: withBasePath("/og.png"), width: 1792, height: 932, alt: "آکادمی آشپزی سپهر سرلک" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "آکادمی آشپزی سپهر سرلک",
    description: "آشپزی، فقط دستور پخت نیست.",
    images: [withBasePath("/og.png")],
  },
  icons: {
    icon: withBasePath("/favicon.svg"),
    shortcut: withBasePath("/favicon.svg"),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={ekraan.variable}>
        <a className="skip-link" href="#main-content">رفتن به محتوای اصلی</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
