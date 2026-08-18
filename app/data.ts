export type Course = {
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  format: "حضوری" | "آنلاین";
  level: string;
  duration: string;
  lessons: string;
  price: string;
  availability: "ثبت‌نام باز" | "ظرفیت تکمیل" | "به‌زودی";
  image: string;
  href: string;
};

export const courses: Course[] = [
  {
    slug: "cooking-foundations-onsite",
    title: "دوره حضوری آشپزی – سطح مبانی",
    subtitle: "از شناخت پروتئین و قصابی تا روش‌های پخت و اجرای ۱۵ بشقاب نهایی",
    category: "آشپزی",
    format: "حضوری",
    level: "سطح مبانی",
    duration: "۶ جلسه ۸ ساعته",
    lessons: "ظرفیت ۱۶ نفر",
    price: "۹۵٬۰۰۰٬۰۰۰ تومان",
    availability: "ثبت‌نام باز",
    image: "/media/real-course-foundations.jpg",
    href: "/courses/foundations",
  },
  {
    slug: "cooking-foundations-online",
    title: "دوره آنلاین آشپزی – سطح پایه",
    subtitle: "هشت مبحث پایه، از ایمنی و تجهیزات تا سس‌ها، استاک‌ها و خمیرهای پایه",
    category: "آشپزی",
    format: "آنلاین",
    level: "بدون پیش‌نیاز",
    duration: "۸ مبحث آموزشی",
    lessons: "گواهی‌نامه آنلاین",
    price: "رایگان",
    availability: "ثبت‌نام باز",
    image: "/media/real-course-online.jpg",
    href: "/courses/cooking-foundations-online",
  },
  {
    slug: "cooking-techniques-intermediate",
    title: "تکنیک‌های آشپزی – سطح متوسط",
    subtitle: "امولسیون، فوم، خمیر، سس‌های تخصصی و اجرای دقیق بشقاب‌های پیچیده‌تر",
    category: "آشپزی",
    format: "حضوری",
    level: "سطح متوسط",
    duration: "۶ جلسه ۷ ساعته",
    lessons: "ظرفیت ۱۶ نفر",
    price: "۹۵٬۰۰۰٬۰۰۰ تومان",
    availability: "ثبت‌نام باز",
    image: "/media/real-course-intermediate.jpg",
    href: "/courses/cooking-techniques-intermediate",
  },
  {
    slug: "advanced-cooking",
    title: "آشپزی پیشرفته – سطح تخصصی",
    subtitle: "پخت طولانی، عصاره‌گیری، سایفون، ژله‌های دقیق و مواد اولیه تخصصی",
    category: "آشپزی",
    format: "حضوری",
    level: "سطح تخصصی",
    duration: "۶ جلسه ۸ ساعته",
    lessons: "پذیرش با مصاحبه",
    price: "قیمت اعلام می‌شود",
    availability: "ظرفیت تکمیل",
    image: "/media/real-course-advanced.jpg",
    href: "/courses/advanced-cooking",
  },
  {
    slug: "breakfast-workshop",
    title: "کارگاه حضوری صبحانه",
    subtitle: "بشقاب‌های کلاسیک صبحانه و ترکیب‌های مدرن برانچ، از آرپژ تا کروک مادام",
    category: "کارگاه کوتاه‌مدت",
    format: "حضوری",
    level: "عملی",
    duration: "۲ جلسه ۸ ساعته",
    lessons: "ظرفیت ۱۶ نفر",
    price: "۳۸٬۰۰۰٬۰۰۰ تومان",
    availability: "ثبت‌نام باز",
    image: "/media/real-workshop-breakfast.jpg",
    href: "/courses/breakfast-workshop",
  },
  {
    slug: "sourdough-workshop",
    title: "کارگاه حضوری نان‌های خمیر ترش",
    subtitle: "از ساخت استارتر و درصد بیکری تا مدیریت زمان، دما، شکل‌دهی و پخت",
    category: "نان",
    format: "حضوری",
    level: "عملی",
    duration: "۲ جلسه ۱۰ ساعته",
    lessons: "ظرفیت ۱۶ نفر",
    price: "۱۲٬۰۰۰٬۰۰۰ تومان",
    availability: "ظرفیت تکمیل",
    image: "/media/real-workshop-sourdough.jpg",
    href: "/courses/sourdough-workshop",
  },
  {
    slug: "meze-workshop",
    title: "کارگاه عملی مزه",
    subtitle: "طعم‌سازی با چاشنی‌های متنوع جهان و اجرای بیش از ده آیتم و سالاد",
    category: "کارگاه کوتاه‌مدت",
    format: "حضوری",
    level: "عملی",
    duration: "۲ جلسه ۸ ساعته",
    lessons: "ظرفیت ۱۶ نفر",
    price: "۳۸٬۰۰۰٬۰۰۰ تومان",
    availability: "ثبت‌نام باز",
    image: "/media/real-workshop-meze.jpg",
    href: "/courses/meze-workshop",
  },
  {
    slug: "iranian-comfort-food-workshop",
    title: "کارگاه حضوری کوبیدنی و صفا کردنی",
    subtitle: "مروری عملی بر خوراک‌های اصیل ایرانی؛ از بریان و دیزی تا کالجوش و یخمه‌ترش",
    category: "آشپزی ایرانی",
    format: "حضوری",
    level: "عملی",
    duration: "۲ جلسه ۸ ساعته",
    lessons: "ظرفیت ۱۶ نفر",
    price: "۱۷٬۰۰۰٬۰۰۰ تومان",
    availability: "ظرفیت تکمیل",
    image: "/media/real-workshop-iranian.jpg",
    href: "/courses/iranian-comfort-food-workshop",
  },
];
