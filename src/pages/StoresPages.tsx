import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FilterPanel, PageHead, ProductGrid, StoreCard, defaultFilters } from "../components/Sections";
import { Breadcrumbs, EmptyState, Icon, StoreLogo } from "../components/ui";
import * as db from "../lib/db";
import type { Filters } from "../lib/types";
import { applyFilters, applySeo, timeAgo, useSeo, breadcrumbJsonLd } from "../lib/utils";

export function StoresPage() {
  const data = useMemo(() => {
    const stores = db.getStores();
    const products = db.getProducts();
    return { stores, products };
  }, []);

  applySeo({
    title: "المتاجر — عروض أمازون ونون وعلي إكسبرس وجرير وإكسترا | وفرلي",
    description: "تصفح العروض حسب المتجر: أمازون السعودية، نون، علي إكسبرس، شي إن، تيمو، جرير وإكسترا. كل متجر وصفحته الخاصة بعروضه المحدثة.",
    path: "/stores",
  });

  const countOf = (id: number) => data.products.filter((p) => p.storeId === id && p.status === "active").length;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-8">
        <PageHead
          eyebrow={`${data.stores.length} متاجر`}
          title="تصفح العروض حسب المتجر"
          desc="نغطي عروض أشهر المتاجر التي تشحن إلى السعودية. اختر متجرك المفضل لعرض كل تخفيضاته الحالية في صفحة واحدة."
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {data.stores.map((s) => (
            <StoreCard key={s.id} store={s} count={countOf(s.id)} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

export function StoreDetail({ slug }: { slug: string }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const data = useMemo(() => {
    const store = db.getStoreBySlug(slug);
    if (!store) return null;
    const categories = db.getCategories();
    const stores = db.getStores();
    const products = db.getProducts().filter((p) => p.storeId === store.id);
    return { store, categories, stores, products };
  }, [slug]);

  useSeo(
    {
      title: data ? `عروض ${data.store.name} اليوم — خصومات محدثة | وفرلي` : "المتجر غير موجود | وفرلي",
      description: data ? `${data.store.description} اكتشف ${data.products.length} عرض نشط من ${data.store.name} بالريال السعودي.` : "",
      path: `/store/${slug}`,
      jsonLd: data
        ? breadcrumbJsonLd([
            { name: "الرئيسية", path: "/" },
            { name: "المتاجر", path: "/stores" },
            { name: data.store.name, path: `/store/${data.store.slug}` },
          ])
        : undefined,
    },
    [slug]
  );

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon="bag" title="المتجر غير موجود" desc="تحقق من الرابط أو تصفح كل المتاجر." action={<Link to="/stores" className="rounded-xl bg-primary px-6 py-3 font-bold text-bg hover:bg-primary-dark">كل المتاجر</Link>} />
      </main>
    );
  }

  const { store } = data;
  const results = applyFilters(data.products, { ...filters, storeIds: [] });

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs items={[{ label: "الرئيسية", to: "/" }, { label: "المتاجر", to: "/stores" }, { label: store.name }]} />

        <div className="mt-5 flex flex-col gap-6 rounded-2xl border border-line bg-card p-6 shadow-soft sm:flex-row sm:items-center sm:p-8">
          <StoreLogo store={store} size="xl" />
          <div className="flex-1">
            <h1 className="font-display text-2xl font-black sm:text-3xl">{store.name}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{store.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-primary">
                <Icon name="tag" className="w-3.5 h-3.5" />
                {data.products.length} عرض نشط
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-muted">
                <Icon name="clock" className="w-3.5 h-3.5" />
                انضم {timeAgo(store.createdAt)}
              </span>
              <a href={store.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-muted transition-colors hover:text-primary">
                الموقع الرسمي
                <Icon name="external" className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onChange={setFilters} stores={data.stores} categories={data.categories} showStores={false} resultCount={results.length} />
            </div>
          </aside>
          <div>
            <button
              onClick={() => setFilters({ ...defaultFilters })}
              className="mb-4 hidden"
              aria-hidden="true"
            />
            <MobileFilterToggle filters={filters} setFilters={setFilters} stores={data.stores} categories={data.categories} count={results.length} />
            <ProductGrid products={results} stores={data.stores} showCountdown emptyTitle={`لا توجد عروض من ${store.name} مطابقة`} emptyDesc="جرّب مسح الفلاتر أو العودة لاحقًا — العروض تُحدَّث يوميًا." />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Category, Store } from "../lib/types";

export function MobileFilterToggle({
  filters,
  setFilters,
  stores,
  categories,
  count,
}: {
  filters: Filters;
  setFilters: (f: Filters) => void;
  stores: Store[];
  categories: Category[];
  count: number;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mb-4 lg:hidden">
      <button onClick={() => setOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-xl bg-night px-5 py-2.5 text-sm font-black text-bg active:scale-95">
        <Icon name="filter" className="w-4 h-4" />
        {open ? "إخفاء التصفية" : `تصفية (${count})`}
      </button>
      {open && (
        <div className="mt-3">
          <FilterPanel filters={filters} onChange={setFilters} stores={stores} categories={categories} showStores={false} resultCount={count} />
        </div>
      )}
    </div>
  );
}
