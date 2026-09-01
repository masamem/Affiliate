import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import { PageHead, ProductCard } from "../components/Sections";
import { BadgePill, EmptyState, Icon, SmartImage, Stars, StoreLogo } from "../components/ui";
import * as db from "../lib/db";
import type { Product, SortKey, Store } from "../lib/types";
import { SORT_LABELS, applySeo, discountOf, fmt, isExpired } from "../lib/utils";

/* ================= ranked row ================= */

function RankRow({ product, store, rank }: { product: Product; store?: Store; rank: number }) {
  const discount = discountOf(product);
  const expired = isExpired(product);
  return (
    <div className="group flex items-center gap-4 rounded-xl border border-line bg-card p-3.5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:gap-5 sm:p-4">
      <span className="w-10 shrink-0 text-center font-display text-3xl font-black text-primary/20 transition-colors group-hover:text-primary/40" aria-hidden="true">
        {String(rank).padStart(2, "0")}
      </span>
      <Link to={`/product/${product.slug}`} className="shrink-0">
        <SmartImage src={product.image} alt={product.name} className="w-20 h-20 rounded-xl sm:w-24 sm:h-24" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <BadgePill badge={product.badge} />
          {discount && discount > 0 && !expired && (
            <span className="rounded-md bg-flash-soft px-2 py-0.5 text-[11px] font-black text-flash">خصم {discount}%</span>
          )}
        </div>
        <Link to={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="clamp-2 text-sm font-bold text-ink transition-colors group-hover:text-primary sm:text-[15px]">{product.name}</h3>
        </Link>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
          {store && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-muted">
              <StoreLogo store={store} size="sm" />
              {store.name}
            </span>
          )}
          <Stars rating={product.rating} />
        </div>
      </div>
      <div className="shrink-0 text-end">
        <p className="font-display text-lg font-black text-primary sm:text-xl">{fmt(product.price)} <span className="text-[10px] text-muted">ر.س</span></p>
        {product.oldPrice && <p className="text-xs text-muted"><s>{fmt(product.oldPrice)}</s></p>}
        <Link
          to={expired ? `/product/${product.slug}` : `/go/${product.slug}`}
          className={`mt-2 hidden sm:inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-black transition-all active:scale-95 ${expired ? "bg-line text-muted" : "bg-primary text-bg hover:bg-primary-dark"}`}
        >
          {expired ? "التفاصيل" : "شاهد العرض"}
          {!expired && <Icon name="external" className="w-3.5 h-3.5" />}
        </Link>
      </div>
    </div>
  );
}

/* ================= /best ================= */

export function BestPicks() {
  const data = useMemo(() => {
    const stores = db.getStores();
    const products = db.getProducts().filter((p) => p.status === "active" && !isExpired(p));
    const byViews = (list: Product[]) => [...list].sort((a, b) => b.views - a.views);

    const lists: { key: string; index: string; title: string; desc: string; to: string; toLabel: string; items: Product[] }[] = [
      { key: "mobiles", index: "01", title: "أفضل الجوالات", desc: "الأكثر مشاهدة وتقييمًا في قسم الجوالات", to: "/category/mobiles", toLabel: "كل الجوالات", items: byViews(products.filter((p) => p.categoryId === 1)).slice(0, 4) },
      { key: "laptops", index: "02", title: "أفضل اللابتوبات", desc: "اختياراتنا للعمل والدراسة", to: "/category/laptops", toLabel: "كل اللابتوبات", items: byViews(products.filter((p) => p.categoryId === 3)).slice(0, 4) },
      { key: "audio", index: "03", title: "أفضل السماعات", desc: "من السماعات الرائدة إلى الاقتصادية", to: "/category/electronics", toLabel: "كل الإلكترونيات", items: byViews(products.filter((p) => p.categoryId === 2)).slice(0, 4) },
      { key: "home", index: "04", title: "أفضل الأجهزة المنزلية والمطبخ", desc: "قلايات، مكانس روبوت وأجهزة قهوة", to: "/category/home-kitchen", toLabel: "المنزل والمطبخ", items: byViews(products.filter((p) => [4, 5].includes(p.categoryId))).slice(0, 4) },
      { key: "amazon", index: "05", title: "أفضل عروض أمازون", desc: "الأعلى خصمًا من أمازون السعودية", to: "/store/amazon", toLabel: "كل عروض أمازون", items: byViews(products.filter((p) => p.storeId === 1)).slice(0, 4) },
      { key: "noon", index: "06", title: "أفضل عروض نون", desc: "الأعلى خصمًا من متجر نون", to: "/store/noon", toLabel: "كل عروض نون", items: byViews(products.filter((p) => p.storeId === 2)).slice(0, 4) },
    ];
    return { stores, lists };
  }, []);

  applySeo({
    title: "أفضل الاختيارات — قوائم وفرلي المراجعة | وفرلي",
    description: "قوائم محدثة لأفضل الجوالات واللابتوبات والسماعات والأجهزة المنزلية، وأفضل عروض أمازون ونون في السعودية — مرتبة حسب المشاهدات والتقييم.",
    path: "/best",
  });

  const storeOf = (id: number) => data.stores.find((s) => s.id === id);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-8">
        <PageHead
          eyebrow="قوائم محدثة أسبوعيًا"
          title="أفضل الاختيارات من وفرلي"
          desc="لا ندّعي أننا الأرخص — نرتب لك المنتجات حسب المشاهدات والتقييمات الفعلية لتصل للخيار الأنسب أسرع. الأسعار نهائية في متجر البائع."
        />

        <div className="mt-10 space-y-12">
          {data.lists.filter((l) => l.items.length > 0).map((list) => (
            <section key={list.key} aria-label={list.title}>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-4xl font-black text-primary/15" aria-hidden="true">{list.index}</span>
                  <div>
                    <h2 className="font-display text-xl font-black sm:text-2xl">{list.title}</h2>
                    <p className="text-[13px] text-muted">{list.desc}</p>
                  </div>
                </div>
                <Link to={list.to} className="inline-flex items-center gap-1.5 text-sm font-black text-primary hover:underline">
                  {list.toLabel}
                  <Icon name="chevronLeft" className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {list.items.map((p, i) => (
                  <RankRow key={`${list.key}-${p.id}`} product={p} store={storeOf(p.storeId)} rank={i + 1} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ================= /search ================= */

const POPULAR = ["ايفون", "سماعة", "قلاية", "ساعة", "لابتوب", "عطر", "مكنسة", "قهوة"];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const [sort, setSort] = useState<SortKey>("views");

  const results = useMemo(() => {
    if (q.length < 2) return null;
    const needle = q.toLowerCase();
    const products = db
      .getProducts()
      .filter((p) =>
        p.name.toLowerCase().includes(needle) ||
        p.keywords.toLowerCase().includes(needle) ||
        p.shortDescription.includes(q) ||
        p.description.includes(q)
      );
    const sorted = [...products];
    const cmp: Record<SortKey, (a: Product, b: Product) => number> = {
      latest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      discount: (a, b) => (discountOf(b) || 0) - (discountOf(a) || 0),
      views: (a, b) => b.views - a.views,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
    };
    sorted.sort(cmp[sort]);
    const stores = db.getStores().filter((s) => s.name.includes(q) || s.name.toLowerCase().includes(needle) || s.slug.includes(needle));
    const categories = db.getCategories().filter((c) => c.name.includes(q) || c.slug.includes(needle));
    return { products: sorted, stores, categories };
  }, [q, sort]);

  applySeo({
    title: q ? `نتائج البحث عن «${q}» | وفرلي` : "البحث | وفرلي",
    description: `ابحث عن العروض والمنتجات والمتاجر في وفرلي${q ? ` — نتائج «${q}»` : ""}.`,
    path: `/search?q=${encodeURIComponent(q)}`,
  });

  const stores = db.getStores();

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-8">
        <PageHead
          eyebrow={results ? `${results.products.length} نتيجة` : "بحث"}
          title={q ? `نتائج البحث عن «${q}»` : "ابحث في وفرلي"}
          desc="ابحث في أسماء المنتجات والمتاجر والتصنيفات، ورتّب النتائج بالطريقة التي تناسبك."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const v = String(fd.get("q") || "").trim();
              if (v) setParams({ q: v });
            }}
            className="flex max-w-xl items-center gap-2 rounded-xl border border-bg/15 bg-night2 p-1.5"
          >
            <Icon name="search" className="ms-2.5 w-5 h-5 text-bg/40" />
            <input
              name="q"
              defaultValue={q}
              placeholder="اكتب اسم منتج، متجر أو تصنيف…"
              className="w-full bg-transparent py-2.5 text-sm font-bold text-bg outline-none placeholder:text-bg/35"
              aria-label="كلمة البحث"
            />
            <button type="submit" className="shrink-0 rounded-lg bg-accent px-5 py-2.5 text-sm font-black text-ink transition-all hover:bg-accent-dark active:scale-95">
              بحث
            </button>
          </form>
        </PageHead>

        {!results ? (
          <div className="mt-10">
            <p className="mb-3 text-sm font-black text-muted">عمليات بحث شائعة:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((p) => (
                <Link key={p} to={`/search?q=${encodeURIComponent(p)}`} className="rounded-full border border-line bg-card px-4 py-2 text-sm font-bold text-ink2 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary">
                  {p}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {results.stores.length > 0 && (
              <section aria-label="متاجر مطابقة">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-black">
                  <Icon name="bag" className="w-5 h-5 text-primary" />
                  متاجر ({results.stores.length})
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {results.stores.map((s) => (
                    <Link key={s.id} to={`/store/${s.slug}`} className="flex items-center gap-2.5 rounded-xl border border-line bg-card px-4 py-2.5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40">
                      <StoreLogo store={s} size="md" />
                      <span>
                        <span className="block text-sm font-black text-ink">{s.name}</span>
                        <span className="text-[11px] text-muted">{s.slug}.com</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {results.categories.length > 0 && (
              <section aria-label="تصنيفات مطابقة">
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-black">
                  <Icon name="grid" className="w-5 h-5 text-primary" />
                  تصنيفات ({results.categories.length})
                </h2>
                <div className="flex flex-wrap gap-2.5">
                  {results.categories.map((c) => (
                    <Link key={c.id} to={`/category/${c.slug}`} className="flex items-center gap-2 rounded-xl border border-line bg-card px-4 py-2.5 text-sm font-black text-ink2 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary">
                      <Icon name={c.icon} className="w-4.5 h-4.5 text-primary" />
                      {c.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <section aria-label="منتجات مطابقة">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-black">
                  <Icon name="tag" className="w-5 h-5 text-primary" />
                  منتجات ({results.products.length})
                </h2>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="rounded-lg border border-line bg-card px-3 py-2 text-xs font-black text-ink2 outline-none focus:border-primary"
                  aria-label="ترتيب النتائج"
                >
                  {Object.entries(SORT_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              {results.products.length ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                  {results.products.map((p) => (
                    <ProductCard key={p.id} product={p} store={stores.find((s) => s.id === p.storeId)} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="search"
                  title={`لا منتجات تطابق «${q}»`}
                  desc="جرّب كلمة أقصر أو تصفح التصنيفات — نضيف منتجات جديدة يوميًا."
                  action={
                    <div className="flex flex-wrap justify-center gap-2">
                      {POPULAR.slice(0, 4).map((p) => (
                        <Link key={p} to={`/search?q=${encodeURIComponent(p)}`} className="rounded-full bg-primary-soft px-4 py-2 text-xs font-black text-primary hover:bg-primary hover:text-bg transition-colors">
                          {p}
                        </Link>
                      ))}
                    </div>
                  }
                />
              )}
            </section>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
