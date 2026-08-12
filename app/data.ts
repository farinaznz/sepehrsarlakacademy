export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  category: "پایه" | "حرفه‌ای" | "شیرینی‌پزی" | "نان";
  format: "حضوری" | "آنلاین";
  level: string;
  duration: string;
  lessons: string;
  price: string;
  image: string;
};

export const courses: Course[] = [
  {
    slug: "foundations",
    title: "مبانی آشپزی حرفه‌ای",
    subtitle: "تکنیک، نظم و نگاه یک آشپز حرفه‌ای از نقطه شروع",
    category: "پایه",
    format: "آنلاین",
    level: "بدون پیش‌نیاز",
    duration: "۱۲ هفته",
    lessons: "۴۸ درس",
    price: "۹٬۸۰۰٬۰۰۰",
    image: "/media/course-foundations.jpg",
  },
  {
    slug: "modern-cuisine",
    title: "آشپزی مدرن و بشقاب‌آرایی",
    subtitle: "ساخت طعم، بافت و ارائه‌ای که امضای شخصی شماست",
    category: "حرفه‌ای",
    format: "حضوری",
    level: "متوسط",
    duration: "۸ هفته",
    lessons: "۲۴ جلسه",
    price: "۱۴٬۵۰۰٬۰۰۰",
    image: "/media/course-modern.jpg",
  },
  {
    slug: "pastry",
    title: "اصول شیرینی‌پزی فرانسوی",
    subtitle: "از خمیرهای پایه تا دسرهای دقیق و معاصر",
    category: "شیرینی‌پزی",
    format: "حضوری",
    level: "مقدماتی",
    duration: "۶ هفته",
    lessons: "۱۸ جلسه",
    price: "۱۲٬۹۰۰٬۰۰۰",
    image: "/media/course-pastry.jpg",
  },
  {
    slug: "bread",
    title: "نان‌های خمیرترش",
    subtitle: "شناخت تخمیر، زمان و ساختار برای یک نان زنده",
    category: "نان",
    format: "آنلاین",
    level: "مقدماتی",
    duration: "۵ هفته",
    lessons: "۲۰ درس",
    price: "۴٬۹۰۰٬۰۰۰",
    image: "/media/course-bread.jpg",
  },
  {
    slug: "persian-cuisine",
    title: "بازخوانی آشپزی ایرانی",
    subtitle: "تکنیک حرفه‌ای در کنار حافظه و طعم‌های ایرانی",
    category: "حرفه‌ای",
    format: "آنلاین",
    level: "متوسط",
    duration: "۱۰ هفته",
    lessons: "۳۶ درس",
    price: "۸٬۶۰۰٬۰۰۰",
    image: "/media/course-persian.jpg",
  },
  {
    slug: "plating",
    title: "زبان بشقاب",
    subtitle: "ترکیب‌بندی، رنگ و ریتم برای ارائه حرفه‌ای غذا",
    category: "حرفه‌ای",
    format: "حضوری",
    level: "پیشرفته",
    duration: "۴ هفته",
    lessons: "۱۲ جلسه",
    price: "۷٬۸۰۰٬۰۰۰",
    image: "/media/course-plating.jpg",
  },
];
