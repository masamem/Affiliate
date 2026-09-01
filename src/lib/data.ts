import type {
  AffiliateClick,
  Category,
  DBShape,
  DeviceType,
  Product,
  ProductBadge,
  Settings,
  Store,
} from "./types";
import { daysAgoIso, daysFromNowIso, hashStr } from "./utils";

const IMG = {
  phone: "https://image.qwenlm.ai/generated-images/f4e07878-e27f-44ec-8904-c88b02efdca8/_result.png",
  headphones: "https://image.qwenlm.ai/generated-images/525cbd35-faf8-41ac-869e-5cb599ee7839/_result.png",
  earbuds: "https://image.qwenlm.ai/generated-images/978d881e-013c-44a3-9b93-e1f1da28b647/_result.png",
  watch: "https://image.qwenlm.ai/generated-images/0bc33b47-9762-401d-8cc9-a7c224edc60f/_result.png",
  laptop: "https://image.qwenlm.ai/generated-images/c8af4ab2-33e1-4564-9591-3a27ef9f8dc9/_result.png",
  vacuum: "https://image.qwenlm.ai/generated-images/9454ffe8-b4ed-45ec-a4e5-1a3728361c4b/_result.png",
  airfryer: "https://image.qwenlm.ai/generated-images/f325064e-4cba-409f-9d9d-2cbe4bc29572/_result.png",
  perfume: "https://image.qwenlm.ai/generated-images/ed526a40-919d-4946-a195-179f03df94a2/_result.png",
  sneakers: "https://image.qwenlm.ai/generated-images/2b80a065-0e2c-449e-b50b-763266104920/_result.png",
  espresso: "https://image.qwenlm.ai/generated-images/0c33eadd-1ece-40f8-82b5-aa3a4d261393/_result.png",
};

/* ================= stores ================= */

function S(
  id: number,
  name: string,
  slug: string,
  logoColor: string,
  logoLetter: string,
  description: string,
  websiteUrl: string
): Store {
  return {
    id, name, slug, logoColor, logoLetter, description, websiteUrl,
    status: "active",
    createdAt: daysAgoIso(200 + id),
    updatedAt: daysAgoIso(id),
  };
}

export const seedStores: Store[] = [
  S(1, "أمازون السعودية", "amazon", "#f19a37", "a", "أكبر متاجر التجزئة الإلكترونية عالميًا، بتشكيلة ضخمة وتوصيل سريع داخل السعودية وخيارات إرجاع مرنة.", "https://www.amazon.sa"),
  S(2, "نون", "noon", "#f2d620", "n", "المتجر السعودي الأول للموضة والإلكترونيات والبقالة، بعروض يومية قوية وبرنامج نون VIP.", "https://www.noon.com"),
  S(3, "علي إكسبرس", "aliexpress", "#e62e04", "A", "وجهتك للمنتجات بأسعار تنافسية وتشكيلة عالمية واسعة مع شحن مباشر إلى السعودية.", "https://ar.aliexpress.com"),
  S(4, "شي إن", "shein", "#13221b", "S", "أحدث صيحات الموضة والأزياء والإكسسوارات بأسعار في متناول الجميع.", "https://www.shein.com"),
  S(5, "تيمو", "temu", "#fb7701", "T", "متجر عالمي صاعد يقدم منتجات منزلية وأزياء وإكسسوارات بخصومات كبيرة.", "https://www.temu.com"),
  S(6, "مكتبة جرير", "jarir", "#0066b3", "J", "الوجهة الأولى للأجهزة الذكية واللابتوبات والكتب والقرطاسية في السعودية.", "https://www.jarir.com"),
  S(7, "إكسترا", "extra", "#003da5", "X", "سلسلة معارض إلكترونيات وأجهزة منزلية رائدة بعروض موسميه قوية وخدمات تقسيط.", "https://www.extra.com"),
];

/* ================= categories ================= */

function C(
  id: number,
  name: string,
  slug: string,
  icon: string,
  description: string
): Category {
  return {
    id, name, slug, icon, description,
    metaTitle: `عروض ${name} في السعودية | وفرلي`,
    metaDescription: `اكتشف أفضل عروض وخصومات ${name} من أمازون ونون وجرير وغيرها من المتاجر الموثوقة، بأسعار محدثة بالريال السعودي.`,
    createdAt: daysAgoIso(180 + id),
    updatedAt: daysAgoIso(2),
  };
}

export const seedCategories: Category[] = [
  C(1, "جوالات", "mobiles", "phone", "أحدث الهواتف الذكية من آبل وسامسونج وغيرها بعروض محدثة."),
  C(2, "إلكترونيات", "electronics", "chip", "سماعات وشواحن وأجهزة صوتية من أشهر العلامات."),
  C(3, "لابتوبات", "laptops", "laptop", "لابتوبات للعمل والدراسة والألعاب بخصومات محدثة."),
  C(4, "أجهزة منزلية", "appliances", "washer", "مكانس robot وأجهزة تنظيف وتكييف لمنزل أذكى."),
  C(5, "المنزل والمطبخ", "home-kitchen", "pot", "قلايات هوائية وأجهزة قهوة وأدوات مطبخ عملية."),
  C(6, "أزياء", "fashion", "shirt", "ملابس وأحذية وإكسسوارات لموسمك الحالي."),
  C(7, "عطور", "perfumes", "perfume", "عطور شرقية وغربية فاخرة بخصومات حقيقية."),
  C(8, "مستحضرات تجميل", "beauty", "sparkle", "عناية بالبشرة ومكياج من علامات موثوقة."),
  C(9, "ألعاب", "gaming", "gamepad", "أجهزة وإكسسوارات ألعاب لكل المنصات."),
  C(10, "أطفال", "kids", "toy", "ألعاب ومنتجات أطفال آمنة ومختارة بعناية."),
  C(11, "سيارات", "cars", "car", "إكسسوارات ومنتجات العناية بالسيارة."),
  C(12, "رياضة ولياقة", "sports", "dumbbell", "معدات رياضية وأجهزة لياقة لمنزل نشيط."),
  C(13, "ساعات", "watches", "watch", "ساعات ذكية وكلاسيكية من أشهر الماركات."),
  C(14, "إكسسوارات", "accessories", "gem", "إكسسوارات جوالات ولابتوبات وحقائب."),
];

/* ================= products ================= */

interface PInit {
  id: number;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  storeId: number;
  categoryId: number;
  image: string;
  badge?: ProductBadge;
  featured?: boolean;
  rating: number;
  views: number;
  createdDaysAgo: number;
  expiryDays?: number | null;
  short: string;
  desc: string;
  features: string[];
  keywords?: string;
  affiliateUrl?: string;
}

function P(p: PInit): Product {
  const discount =
    p.oldPrice && p.oldPrice > p.price
      ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
      : null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.desc,
    shortDescription: p.short,
    image: p.image,
    images: [],
    features: p.features,
    price: p.price,
    oldPrice: p.oldPrice,
    discountPercentage: discount,
    affiliateUrl:
      p.affiliateUrl ||
      `https://example.com/affiliate?tag=wafferly-21&asins=${p.slug}`,
    storeId: p.storeId,
    categoryId: p.categoryId,
    badge: p.badge || "",
    featured: p.featured || false,
    status: "active",
    expiryDate: p.expiryDays ? daysFromNowIso(p.expiryDays) : null,
    metaTitle: `${p.name} بأفضل سعر في السعودية | وفرلي`,
    metaDescription: `${p.short} قارن السعر واشترِ من المتجر مباشرة عبر وفرلي.`,
    keywords: p.keywords || "",
    rating: p.rating,
    views: p.views,
    createdAt: daysAgoIso(p.createdDaysAgo),
    updatedAt: daysAgoIso(Math.max(0, p.createdDaysAgo - 1)),
  };
}

export const seedProducts: Product[] = [
  P({
  id: 21,
  name: "آيفون 17 256GB أسود 5G (eSIM) - نسخة الشرق الأوسط",
  slug: "apple-iphone-17-256gb-black",
  price: 3999,
  oldPrice: null,
  storeId: 2,
  categoryId: 1,
  image: IMG.phone,
  rating: 4.8,
  views: 0,
  createdDaysAgo: 0,

  affiliateUrl: "https://www.noon.com/saudi-en/iphone-17-256gb-esim-only-black-5g-with-facetime-middle-east-version/N70211519V/p/?o=d945d3a1b78f2b5e&utm_campaign=CMP2ce0b63a6a1anoon&utm_medium=AFFe84995744006&adjust_deeplink_js=1&utm_source=C1000264L",

  short: "آيفون 17 سعة 256GB باللون الأسود، 5G وeSIM، نسخة الشرق الأوسط مع FaceTime.",
desc: "آيفون 17 سعة 256GB باللون الأسود مع دعم 5G وeSIM وFaceTime، نسخة الشرق الأوسط.",
features: [
  "سعة تخزين 256GB",
  "دعم 5G",
  "eSIM",
  "نسخة الشرق الأوسط",
],
keywords: "ايفون 17, نون, iphone 17",
}),
  
P({
  id: 22,
  name: "اسم منتج أمازون",
  slug: "amazon-product",
  price: 999,
  oldPrice: null,
  storeId: 1,
  categoryId: 1,
  image: IMG.phone,
  rating: 4.5,
  views: 0,
  createdDaysAgo: 0,

  affiliateUrl: "https://link.amazon/B06JU7Tmc",

  short: "وصف مختصر للمنتج",
  desc: "وصف المنتج",
  features: [
    "الميزة الأولى",
    "الميزة الثانية",
  ],
  keywords: "أمازون, عروض",
}),
  P({
    id: 3, name: "سماعة سوني WH-1000XM5 اللاسلكية", slug: "sony-wh1000xm5",
    price: 1249, oldPrice: 1599, storeId: 1, categoryId: 2, image: IMG.headphones,
    badge: "best", featured: true, rating: 4.9, views: 4152, createdDaysAgo: 3, expiryDays: 2,
    short: "الأفضل في عزل الضوضاء مع 30 ساعة تشغيل متواصل.",
    desc: "تقدم سوني WH-1000XM5 تجربة استماع استثنائية مع أفضل عزل ضوضاء في فئتها، وصوت عالي الدقة LDAC، ومكالمات نقية بفضل 8 ميكروفونات. تصميم خفيف قابل للطي يناسب التنقل اليومي.",
    features: ["عزل ضوضاء رائد في الصناعة", "بطارية 30 ساعة مع شحن سريع", "صوت عالي الدقة LDAC", "اتصال بجهازين في الوقت نفسه"],
    keywords: "سوني, سماعات, عزل ضوضاء",
  }),
  P({
    id: 4, name: "سماعة أنكر ساوندكور Q45", slug: "anker-soundcore-q45",
    price: 389, oldPrice: 549, storeId: 3, categoryId: 2, image: IMG.headphones,
    rating: 4.5, views: 1543, createdDaysAgo: 6,
    short: "عزل ضوضاء تكيفي وبطارية 50 ساعة بسعر منافس.",
    desc: "خيار ذكي لمن يريد عزل ضوضاء فعال دون دفع الكثير. بطارية ضخمة 50 ساعة، شحن سريع يعطيك 4 ساعات في 5 دقائق، وتطبيق للتحكم الكامل في الصوت.",
    features: ["بطارية 50 ساعة تشغيل", "عزل ضوضاء تكيفي حتى 98%", "شحن USB-C سريع", "تطبيق مخصص للمعادل الصوتي"],
  }),
  P({
    id: 5, name: "آبل إيربودز برو 2 – USB-C", slug: "apple-airpods-pro-2",
    price: 879, oldPrice: 999, storeId: 6, categoryId: 2, image: IMG.earbuds,
    featured: true, rating: 4.8, views: 2977, createdDaysAgo: 4,
    short: "عزل ضوضاء مضاعف وصوت مكاني مخصص لأجهزة آبل.",
    desc: "إيربودز برو 2 مع منفذ USB-C تقدم عزل ضوضاء أقوى بمرتين من الجيل السابق، وصوتًا مكانيًا مخصصًا يتتبع حركة الرأس، مع علبة شحن تدعم البحث عبر شبكة تحديد الموقع.",
    features: ["عزل ضوضاء محسّن بمرتين", "صوت مكاني مخصص", "علبة شحن USB-C مع مكبر صوت", "مقاومة للعرق والماء IP54"],
  }),
  P({
    id: 6, name: "سماعة سامسونج جالكسي بودز 3 برو", slug: "samsung-galaxy-buds3",
    price: 499, oldPrice: 699, storeId: 2, categoryId: 2, image: IMG.earbuds,
    badge: "hot", rating: 4.4, views: 1208, createdDaysAgo: 1, expiryDays: 3,
    short: "صوت 360 وتصميم جديد كليًا مع ترجمة فورية.",
    desc: "جالكسي بودز 3 برو بتصميمها الجديد تقدم صوتًا غنيًا بمكبرات ثنائية، وترجمة فورية مع أجهزة جالكسي، وعزل ضوضاء ذكي يتكيف مع محيطك.",
    features: ["مكبرات صوت ثنائية الاتجاه", "ترجمة فورية مع Galaxy AI", "عزل ضوضاء تكيفي", "شحن لاسلكي سريع"],
  }),
  P({
    id: 7, name: "ساعة آبل الجيل 10 – 46mm GPS", slug: "apple-watch-series-10",
    price: 1699, oldPrice: 1999, storeId: 1, categoryId: 13, image: IMG.watch,
    badge: "special", featured: true, rating: 4.7, views: 2264, createdDaysAgo: 5, expiryDays: 2,
    short: "أنحف ساعة آبل بشاشة أكبر ومزايا صحية متقدمة.",
    desc: "ساعة آبل الجيل 10 تأتي بهيكل أنحف وشاشة أوسع بنسبة 30%، مع مستشعرات لقياس الأكسجين ونظم القلب ودرجة الحرارة، ومقاومة للماء حتى 50 مترًا.",
    features: ["شاشة Retina أكبر وأكثر سطوعًا", "قياس الأكسجين ونظم القلب", "شحن سريع: 80% في 30 دقيقة", "مقاومة للماء 50 مترًا"],
  }),
  P({
    id: 8, name: "ساعة هواوي GT 5 – 46mm", slug: "huawei-watch-gt5",
    price: 729, oldPrice: 999, storeId: 7, categoryId: 13, image: IMG.watch,
    badge: "hot", rating: 4.6, views: 1755, createdDaysAgo: 7,
    short: "بطارية 14 يومًا وتتبع صحي شامل بتصميم كلاسيكي.",
    desc: "ساعة هواوي GT 5 تجمع بين التصميم الكلاسيكي الأنيق والبطارية التي تدوم حتى 14 يومًا، مع أكثر من 100 وضع رياضي وتتبع دقيق للنوم والصحة.",
    features: ["بطارية حتى 14 يومًا", "شاشة AMOLED ساطعة", "أكثر من 100 وضع تمرين", "مقاومة للماء 5ATM"],
  }),
  P({
    id: 9, name: "ماك بوك اير M3 – 13 إنش 256GB", slug: "macbook-air-m3",
    price: 4349, oldPrice: 4899, storeId: 6, categoryId: 3, image: IMG.laptop,
    badge: "pick", featured: true, rating: 4.9, views: 3618, createdDaysAgo: 8,
    short: "أداء شريحة M3 في هيكل بلا مروحة بوزن 1.24 كجم.",
    desc: "ماك بوك اير بشريحة M3 يقدم أداءً استثنائيًا للدراسة والعمل الإبداعي مع هدوء كامل بلا مراوح، وبطارية تدوم حتى 18 ساعة، وشاشة Liquid Retina مذهلة.",
    features: ["شريحة Apple M3 ثماني النواة", "بطارية حتى 18 ساعة", "شاشة Liquid Retina 13.6 إنش", "وزن 1.24 كجم فقط"],
  }),
  P({
    id: 10, name: "لابتوب أسوس فيفوبوك 15 – Core i5", slug: "asus-vivobook-15",
    price: 2149, oldPrice: 2749, storeId: 7, categoryId: 3, image: IMG.laptop,
    rating: 4.4, views: 1329, createdDaysAgo: 9,
    short: "خيار عملي للدراسة والعمل اليومي بشاشة OLED.",
    desc: "أسوس فيفوبوك 15 بمعالج إنتل Core i5 من الجيل 13 وذاكرة 16GB، مع شاشة OLED بألوان دقيقة تجعله مثاليًا للطلاب والموظفين بميزانية متوسطة.",
    features: ["معالج Intel Core i5 الجيل 13", "ذاكرة 16GB وتخزين 512GB SSD", "شاشة OLED بدقة FHD", "شحن سريع 60% في 49 دقيقة"],
  }),
  P({
    id: 11, name: "مكنسة روبوروك S8 الروبوتية", slug: "roborock-s8",
    price: 1849, oldPrice: 2599, storeId: 3, categoryId: 4, image: IMG.vacuum,
    featured: true, rating: 4.7, views: 2541, createdDaysAgo: 3, expiryDays: 3,
    short: "شفط 6000Pa مع مسح اهتزازي وخريطة ذكية لمنزلك.",
    desc: "روبوروك S8 تنظف وتمسح في آن واحد بقوة شفط 6000 باسكال، مع نظام مسح اهتزازي VibraRise يرفع الممسحة تلقائيًا فوق السجاد، ورسم خرائط دقيق بالليزر.",
    features: ["قوة شفط 6000Pa", "مسح اهتزازي VibraRise", "خرائط ليزر متعددة الطوابق", "تحكم كامل عبر التطبيق"],
  }),
  P({
    id: 12, name: "مكنسة فيليبس الروبوتية الذكية", slug: "philips-robot-vacuum",
    price: 949, oldPrice: 1449, storeId: 2, categoryId: 4, image: IMG.vacuum,
    rating: 4.3, views: 987, createdDaysAgo: 11,
    short: "تنظيف ذكي بثلاثة أوضاع وساعة ونصف تشغيل.",
    desc: "مكنسة فيليبس الروبوتية بثلاثة أوضاع تنظيف ومستشعرات تصادم ذكية، مع العودة التلقائية لقاعدة الشحن وبطارية تدوم 90 دقيقة.",
    features: ["3 أوضاع تنظيف مختلفة", "مستشعرات تصادم وسقوط", "عودة تلقائية للشحن", "تشغيل 90 دقيقة متواصلة"],
  }),
  P({
    id: 13, name: "قلاية نينجا الهوائية 5.5 لتر", slug: "ninja-air-fryer",
    price: 479, oldPrice: 679, storeId: 1, categoryId: 5, image: IMG.airfryer,
    badge: "best", featured: true, rating: 4.8, views: 3924, createdDaysAgo: 4,
    short: "6 وظائف في جهاز واحد: قلي وشوي وتجفيف وإعادة تسخين.",
    desc: "قلاية نينجا الهوائية بسعة 5.5 لتر تطبخ أسرع من الفرن التقليدي وتوفر حتى 75% من الدهون، مع 6 برامج جاهزة تناسب العائلة السعودية.",
    features: ["سعة عائلية 5.5 لتر", "6 برامج طهي جاهزة", "تقلل الدهون حتى 75%", "سهلة التنظيف وغسالة صحون"],
  }),
  P({
    id: 14, name: "قلاية تيفال XL الهوائية 6.5 لتر", slug: "tefal-air-fryer-xl",
    price: 319, oldPrice: 459, storeId: 5, categoryId: 5, image: IMG.airfryer,
    rating: 4.2, views: 1110, createdDaysAgo: 10,
    short: "سعة كبيرة وسلة قابلة للفصل تكفي 6 أشخاص.",
    desc: "قلاية تيفال بسعة 6.5 لتر مثالية للعزائم، مع مؤقت رقمي وتحكم دقيق بدرجة الحرارة حتى 200 درجة، وسلة غير لاصقة سهلة التنظيف.",
    features: ["سعة 6.5 لتر تكفي 6 أشخاص", "مؤقت رقمي 60 دقيقة", "حرارة قابلة للضبط حتى 200°", "سلة غير لاصقة"],
  }),
  P({
    id: 15, name: "عطر العود الملكي – 100ml", slug: "oriental-oud-perfume",
    price: 179, oldPrice: 289, storeId: 2, categoryId: 7, image: IMG.perfume,
    badge: "special", featured: true, rating: 4.6, views: 2233, createdDaysAgo: 2, expiryDays: 4,
    short: "تركيبة شرقية فاخرة من العود الكمبودي والعنبر.",
    desc: "عطر شرقي فاخر يفتتح بلمسات الزعفران والورد الطائفي، ثم يستقر على قاعدة غنية من العود الكمبودي والعنبر والمسك. ثبات طويل يدوم طوال اليوم.",
    features: ["عود كمبودي طبيعي", "ثبات يتجاوز 12 ساعة", "عبوة 100ml فاخرة", "مناسب للمناسبات"],
  }),
  P({
    id: 16, name: "عطر مسك الليل – 50ml", slug: "musk-al-layl-perfume",
    price: 89, oldPrice: 159, storeId: 5, categoryId: 7, image: IMG.perfume,
    rating: 4.1, views: 754, createdDaysAgo: 12,
    short: "مسك أبيض ناعم بلمسة فانيليا للاستخدام اليومي.",
    desc: "عطر يومي هادئ يجمع بين المسك الأبيض والفانيليا مع لمسة خشبية دافئة. خيار اقتصادي أنيق للاستخدام المكتبي واليومي.",
    features: ["مسك أبيض ناعم", "لمسة فانيليا دافئة", "حجم عملي 50ml", "سعر اقتصادي"],
  }),
  P({
    id: 17, name: "حذاء نايكي اير الخفيف للجري", slug: "nike-air-sneakers",
    price: 139, oldPrice: 239, storeId: 4, categoryId: 6, image: IMG.sneakers,
    badge: "best", rating: 4.5, views: 1876, createdDaysAgo: 5,
    short: "وسادة هوائية مريحة وخامات شبكية تسمح بالتهوية.",
    desc: "حذاء جري خفيف بوسادة هوائية تمتص الصدمات، وخامة شبكية تحافظ على برودة القدم، ونعل مطاطي يمنح ثباتًا ممتازًا على مختلف الأسطح.",
    features: ["وسادة هوائية مريحة", "خامة شبكية جيدة التهوية", "نعل مطاطي مقاوم للانزلاق", "وزن خفيف 280 جرام"],
  }),
  P({
    id: 18, name: "حذاء كاجوال مريح – أبيض رملي", slug: "casual-comfy-sneakers",
    price: 79, oldPrice: 139, storeId: 5, categoryId: 6, image: IMG.sneakers,
    rating: 4.0, views: 640, createdDaysAgo: 20, expiryDays: -2,
    short: "حذاء يومي بتصميم بسيط يناسب كل الإطلالات.",
    desc: "حذاء كاجوال بتصميم كلاسيكي بسيط وخامة جلدية صناعية سهلة التنظيف، مع نعل داخلي طبي مريح للاستخدام اليومي الطويل.",
    features: ["تصميم كلاسيكي بسيط", "نعل داخلي مريح", "سهل التنظيف", "متوفر بمقاسات متعددة"],
  }),
  P({
    id: 19, name: "ماكينة إسبريسو ديلونجي ديديكا", slug: "delonghi-espresso-machine",
    price: 1049, oldPrice: 1449, storeId: 7, categoryId: 5, image: IMG.espresso,
    badge: "special", rating: 4.7, views: 2148, createdDaysAgo: 6, expiryDays: 1,
    short: "إسبريسو إيطالي أصيل بضغط 15 بار في مطبخك.",
    desc: "ماكينة ديلونجي ديديكا بتصميمها المعدني النحيف تحضر إسبريسو وكابتشينو بجودة المقاهي، بضغط 15 بار وعصا بخار احترافية لرغوة الحليب.",
    features: ["ضغط 15 بار احترافي", "عصا بخار للكابتشينو", "تصميم معدني نحيف 15 سم", "تسخين سريع في 40 ثانية"],
  }),
  P({
    id: 20, name: "ماكينة قهوة الكبسولات الذكية", slug: "capsule-coffee-machine",
    price: 549, oldPrice: 749, storeId: 1, categoryId: 5, image: IMG.espresso,
    featured: true, rating: 4.6, views: 1662, createdDaysAgo: 1,
    short: "قهوتك المفضلة بلمسة واحدة متوافقة مع أشهر الكبسولات.",
    desc: "ماكينة كبسولات مدمجة متوافقة مع أشهر أنظمة الكبسولات، بخزان ماء 1 لتر وضغط 19 بار، وإيقاف تلقائي لتوفير الطاقة.",
    features: ["ضغط 19 بار", "متوافقة مع أنظمة كبسولات شهيرة", "خزان ماء 1 لتر قابل للفصل", "إيقاف تلقائي موفر للطاقة"],
  }),
];

/* ================= seeded clicks (last 14 days) ================= */

const UA_POOL: { ua: string; device: DeviceType }[] = [
  { ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", device: "mobile" },
  { ua: "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36", device: "mobile" },
  { ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36", device: "desktop" },
  { ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15", device: "desktop" },
  { ua: "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1", device: "tablet" },
  { ua: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Mobile Safari/537.36", device: "mobile" },
];

const REFERRERS = [
  "https://www.google.com/",
  "https://twitter.com/",
  "https://web.whatsapp.com/",
  "direct",
  "https://t.me/",
  "https://www.snapchat.com/",
  "direct",
  "https://www.google.com/",
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildSeedClicks(products: Product[]): AffiliateClick[] {
  const rand = mulberry32(20240817);
  const clicks: AffiliateClick[] = [];
  let id = 1;
  const weighted: Product[] = [];
  products.forEach((p) => {
    const w = Math.max(1, Math.round(p.views / 600));
    for (let i = 0; i < w; i++) weighted.push(p);
  });
  for (let day = 13; day >= 0; day--) {
    const count = day === 0 ? 9 : 6 + Math.floor(rand() * 9);
    for (let i = 0; i < count; i++) {
      const product = weighted[Math.floor(rand() * weighted.length)];
      const client = UA_POOL[Math.floor(rand() * UA_POOL.length)];
      const d = new Date();
      d.setDate(d.getDate() - day);
      d.setHours(Math.floor(rand() * 22), Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
      if (day === 0 && d.getTime() > Date.now()) d.setHours(new Date().getHours() - 1, Math.floor(rand() * 60), 0, 0);
      clicks.push({
        id: id++,
        productId: product.id,
        storeId: product.storeId,
        ipHash: hashStr(`${Math.floor(rand() * 999999)}-${id}`),
        userAgent: client.ua,
        referrer: REFERRERS[Math.floor(rand() * REFERRERS.length)],
        device: client.device,
        createdAt: d.toISOString(),
      });
    }
  }
  return clicks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/* ================= settings ================= */

export const seedSettings: Settings = {
  siteName: "وفرلي",
  tagline: "أفضل العروض والمنتجات من متاجرك المفضلة في مكان واحد — محدثة يوميًا بالريال السعودي.",
  email: "support@wafferly.sa",
  twitter: "https://twitter.com/wafferly",
  instagram: "https://instagram.com/wafferly",
  whatsapp: "https://wa.me/966500000000",
  disclosure:
    "قد يحتوي موقعنا على روابط تسويق بالعمولة، وقد نحصل على عمولة عند إتمام عملية شراء من خلال هذه الروابط دون أي تكلفة إضافية عليك.",
  defaultMetaTitle: "وفرلي | أفضل العروض والخصومات من متاجرك المفضلة في السعودية",
  defaultMetaDescription:
    "وفرلي – منصة سعودية تجمع أفضل العروض والمنتجات من أمازون ونون وعلي إكسبرس وجرير وإكسترا وغيرها، بتخفيضات محدثة يوميًا بالريال السعودي.",
  gaId: "",
  gscVerification: "",
  fbPixel: "",
  adminUser: "admin",
  adminHash: hashStr("wafferly2024::wfr-salt"),
};

export function buildSeedDB(): DBShape {
  return {
    version: 1,
    stores: seedStores,
    categories: seedCategories,
    products: seedProducts,
    clicks: buildSeedClicks(seedProducts),
    settings: seedSettings,
  };
}
