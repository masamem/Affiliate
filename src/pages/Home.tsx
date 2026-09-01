import { useMemo } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import {
  CategoryCard,
  CouponCard,
  ProductCard,
  ProductGrid,
  StoreCard,
} from "../components/Sections";
import { Icon, Reveal, SectionHead } from "../components/ui";
import * as db from "../lib/db";
import { applySeo, dealLive, discountOf, isExpired, organizationJsonLd, useCountUp } from "../lib/utils";

function Stat({ value, label, icon }: { value: number; label: string; icon: string }) {
  const v = useCountUp(value);
  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-night3 text-accent">
        <Icon name={icon} className="w-5 h-5" />
      </span>
      <span>
        <span className="block font-display text-2xl font-black text-bg leading-none" dir="ltr">
          {v.toLocaleString("en-US")}
        </span>
        <span className="text-[11.5px] font-bold text-bg/55">{label}</span>
      </span>
    </div>
  );
}

export default function Home() {
  const data = useMemo(() => {
    const stores = db.getStores();
    const categories = db.getCategories();
    const products = db.getProducts();
    const settings = db.getSettings();
    const stats = db.getStats();
    const live = products.filter((p) => dealLive(p));
    const today = live
      .filter((p) => p.expiryDate)
      .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime())
      .slice(0, 8);
    const latest = [...live].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
    const mostViewed = [...live].sort((a, b) => b.views - a.views).slice(0, 4);
    const featured = live.filter((p) => p.featured).slice(0, 4);
    const discounts = [...live].sort((a, b) => (discountOf(b) || 0) - (discountOf(a) || 0)).slice(0, 8);
    const heroCoupons = live.filter((p) => p.featured && !isExpired(p)).slice(0, 3);
    const storeCount = (id: number) => live.filter((p) => p.storeId === id).length;
    const catCount = (id: number) => live.filter((p) => p.categoryId === id).length;
    const ticker = [...live].sort((a, b) => (discountOf(b) || 0) - (discountOf(a) || 0)).slice(0, 8);
    return { stores, categories, products, settings, stats, live, today, latest, mostViewed, featured, discounts, heroCoupons, storeCount, catCount, ticker };
  }, []);

  const settings = data.settings;

  applySeo({
    title: settings.defaultMetaTitle,
    description: settings.defaultMetaDescription,
    path: "/",
    jsonLd: [
      organizationJsonLd(settings),
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: settings.siteName,
        url: "https://wafferly.sa",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://wafferly.sa/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      },
    ],
  });

  const storeOf = (id: number) => data.stores.find((s) => s.id === id);

  return (
    <>
      <div className="flex flex-col">
        {/* ============ HERO ============ */}
        <section className="relative overflow-hidden bg-night text-bg order-1">
          <div className="absolute inset-0 dots-pattern opacity-70" aria-hidden="true" />
          <div className="absolute -top-32 -end-32 h-96 w-96 rounded-full bg-primary/50 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-40 -start-24 h-96 w-96 rounded-full bg-accent/12 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 sm:pt-14 lg:pb-20">
            <div className="grid items-center gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-black text-accent">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                  عروض محدثة يوميًا من {data.stores.length} متاجر موثوقة
                </span>
                <h1 className="mt-5 font-display text-3xl font-black leading-[1.25] sm:text-4xl lg:text-[44px] lg:leading-[1.2]">
                  أفضل العروض من متاجرك المفضلة…
                  <span className="relative mt-1 block text-accent">
                    في مكان واحد
                    <svg viewBox="0 0 220 12" className="absolute -bottom-2 start-0 w-48 text-accent/40" aria-hidden="true">
                      <path d="M3 9c40-6 140-8 214-3" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-8 text-bg/65">
                  نرصد لك التخفيضات الحقيقية من أمازون، نون، علي إكسبرس، جرير، إكسترا وغيرها — تقارن السعر، تضغط الزر، وتشتري من المتجر مباشرة دون أي تكلفة إضافية عليك.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to="/deals"
                    className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3.5 font-display text-[15px] font-bold text-ink shadow-lift transition-all hover:bg-accent-dark hover:-translate-y-0.5 active:scale-95"
                  >
                    <Icon name="tag" className="w-5 h-5" />
                    تصفح العروض
                  </Link>
                  <Link
                    to="/best"
                    className="inline-flex items-center gap-2 rounded-xl border-2 border-bg/20 px-6 py-3 font-display text-[15px] font-bold text-bg transition-all hover:border-accent hover:text-accent active:scale-95"
                  >
                    أفضل الاختيارات
                    <Icon name="chevronLeft" className="w-4 h-4" />
                  </Link>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-3">
                  <Stat value={data.live.length} label="عرض نشط الآن" icon="tag" />
                  <Stat value={data.stores.length} label="متجر شريك" icon="bag" />
                  <Stat value={data.categories.length} label="تصنيف" icon="grid" />
                  <Stat value={data.stats.weekClicks} label="نقرة هذا الأسبوع" icon="cursor" />
                </div>
              </div>

              {/* coupon stack */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-md space-y-4">
                  <div className="absolute -inset-6 rounded-3xl border-2 border-dashed border-bg/10" aria-hidden="true" />
                  {data.heroCoupons.map((p, i) => (
                    <Reveal key={p.id} delay={i * 120}>
                      <CouponCard
                        product={p}
                        store={storeOf(p.storeId)}
                        rotation={i === 0 ? -1.5 : i === 1 ? 1.2 : -0.6}
                        delay={i * 700}
                      />
                    </Reveal>
                  ))}
                  <Reveal delay={400}>
                    <div className="flex items-center justify-between rounded-xl border border-bg/10 bg-night2/80 px-4 py-3">
                      <span className="flex items-center gap-2 text-xs font-bold text-bg/70">
                        <Icon name="shield" className="w-4 h-4 text-accent" />
                        تشتري من المتجر مباشرة — نحن فقط نرشّح العرض
                      </span>
                      <Link to="/disclosure" className="text-xs font-black text-accent hover:text-bg transition-colors">
                        الإفصاح
                      </Link>
                    </div>
                  </Reveal>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ TICKER ============ */}
        <div className="order-2 overflow-hidden border-y-2 border-night bg-accent py-2.5" aria-hidden="true">
          <div className="marquee-track gap-8">
            {[...data.ticker, ...data.ticker].map((p, i) => (
              <Link key={`${p.id}-${i}`} to={`/product/${p.slug}`} className="flex shrink-0 items-center gap-2 text-[13px] font-black text-ink">
                <Icon name="tag" className="w-3.5 h-3.5" />
                خصم {discountOf(p) || 0}% على {p.name} — {storeOf(p.storeId)?.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ============ TODAY'S DEALS ============ */}
        <section className="order-3 mx-auto w-full max-w-7xl px-4 pt-12">
          <Reveal>
            <SectionHead
              icon="flame"
              title="أفضل عروض اليوم"
              subtitle="عروض محدودة بوقت — سارع قبل انتهائها"
              to="/deals"
            />
            <ProductGrid products={data.today.length ? data.today : data.discounts.slice(0, 4)} stores={data.stores} pageSize={4} showCountdown />
          </Reveal>
        </section>

        {/* ============ CATEGORIES RAIL ============ */}
        <section className="order-4 md:order-7 mx-auto w-full max-w-7xl px-4 pt-12">
          <Reveal>
            <SectionHead icon="grid" title="تصفح حسب التصنيف" subtitle="كل تصنيف يجمع عروضه في صفحة واحدة" to="/categories" />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.categories.slice(0, 8).map((c) => (
                <CategoryCard key={c.id} category={c} count={data.catCount(c.id)} />
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============ STORES ============ */}
        <section className="order-5 md:order-6 mx-auto w-full max-w-7xl px-4 pt-12">
          <Reveal>
            <SectionHead icon="bag" title="تصفح حسب المتجر" subtitle="أشهر المتاجر التي نغطي عروضها في السعودية" to="/stores" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {data.stores.slice(0, 4).map((s) => (
                <StoreCard key={s.id} store={s} count={data.storeCount(s.id)} />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {data.stores.slice(4).map((s) => (
                <Link
                  key={s.id}
                  to={`/store/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-2 text-xs font-bold text-ink2 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <span className="inline-flex w-5 h-5 items-center justify-center rounded text-[10px] font-black" style={{ backgroundColor: s.logoColor, color: "#fbfbf7" }}>
                    {s.logoLetter}
                  </span>
                  {s.name}
                  <span className="rounded-full bg-bg px-1.5 py-0.5 text-[10px] font-black text-muted">{data.storeCount(s.id)}</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============ FEATURED PICKS ============ */}
        <section className="order-6 md:order-8 mx-auto w-full max-w-7xl px-4 pt-12">
          <Reveal>
            <SectionHead icon="check" title="منتجات مختارة من وفرلي" subtitle="اختيارات راجعناها بأنفسنا من بين مئات العروض" to="/best" toLabel="أفضل الاختيارات" />
            <ProductGrid products={data.featured} stores={data.stores} pageSize={4} />
          </Reveal>
        </section>

        {/* ============ LATEST ============ */}
        <section className="order-7 md:order-4 mx-auto w-full max-w-7xl px-4 pt-12">
          <Reveal>
            <SectionHead icon="clock" title="أحدث العروض" subtitle="أُضيفت خلال الساعات والأيام الماضية" to="/deals" />
            <ProductGrid products={data.latest} stores={data.stores} pageSize={8} />
          </Reveal>
        </section>

        {/* ============ MOST VIEWED ============ */}
        <section className="order-8 md:order-5 mx-auto w-full max-w-7xl px-4 pt-12">
          <Reveal>
            <SectionHead icon="eye" title="أكثر المنتجات مشاهدة" subtitle="ما يشاهده المتسوقون السعوديون الآن" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {data.mostViewed.map((p, i) => (
                <div key={p.id} className="relative">
                  <span className="absolute -top-3 -start-2 z-10 font-display text-4xl font-black text-primary/15 select-none" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ProductCard product={p} store={storeOf(p.storeId)} />
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============ TOP DISCOUNTS ============ */}
        <section className="order-9 mx-auto w-full max-w-7xl px-4 pt-12">
          <Reveal>
            <SectionHead icon="zap" title="أفضل التخفيضات" subtitle="أعلى نسب خصم متاحة الآن عبر كل المتاجر" to="/deals" />
            <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2">
              {data.discounts.map((p) => (
                <div key={p.id} className="w-[240px] sm:w-[270px] shrink-0 snap-start">
                  <ProductCard product={p} store={storeOf(p.storeId)} />
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ============ CLOSING CTA ============ */}
        <section className="order-10 mx-auto w-full max-w-7xl px-4 pt-14">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-bg sm:px-10">
              <div className="absolute inset-0 dots-pattern opacity-50" aria-hidden="true" />
              <div className="absolute -top-16 -end-16 h-48 w-48 rounded-full bg-accent/25 blur-2xl" aria-hidden="true" />
              <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h2 className="font-display text-2xl font-black sm:text-3xl">لا تفوّت عرضًا بعد اليوم</h2>
                  <p className="mt-2 max-w-lg text-sm leading-7 text-bg/75">
                    تصفح صفحة العروض المحدثة يوميًا، واحفظ منتجاتك المفضلة بالضغط على القلب — الأسعار والتوفر قد تتغير، والسعر النهائي هو المعروض في المتجر.
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-3">
                  <Link to="/deals" className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-display font-bold text-ink transition-all hover:bg-accent-dark active:scale-95">
                    كل العروض
                    <Icon name="chevronLeft" className="w-4 h-4" />
                  </Link>
                  <Link to="/favorites" className="inline-flex items-center gap-2 rounded-xl border-2 border-bg/25 px-5 py-3 font-display font-bold text-bg transition-all hover:border-accent hover:text-accent active:scale-95">
                    <Icon name="heart" className="w-4 h-4" />
                    مفضلتي
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </div>
      <Footer />
    </>
  );
}
