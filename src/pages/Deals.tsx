import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import { FilterPanel, PageHead, ProductGrid, defaultFilters } from "../components/Sections";
import { Icon } from "../components/ui";
import * as db from "../lib/db";
import type { Filters } from "../lib/types";
import { applyFilters, applySeo } from "../lib/utils";

export default function Deals() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [mobileFilters, setMobileFilters] = useState(false);

  const data = useMemo(() => {
    const stores = db.getStores();
    const categories = db.getCategories();
    const products = db.getProducts();
    return { stores, categories, products };
  }, []);

  const results = useMemo(() => applyFilters(data.products, filters), [data.products, filters]);

  applySeo({
    title: "جميع العروض والخصومات في السعودية | وفرلي",
    description: "تصفح كل العروض النشطة من أمازون ونون وعلي إكسبرس وجرير وإكسترا، مع فلترة حسب المتجر والتصنيف والسعر ونسبة الخصم.",
    path: "/deals",
  });

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-8">
        <PageHead
          eyebrow={`${results.length} عرض نشط`}
          title="كل العروض في مكان واحد"
          desc="عروض محدثة يوميًا من كل المتاجر. صفّي حسب المتجر أو التصنيف أو السعر أو نسبة الخصم للوصول للعرض المناسب. الأسعار والتوفر قد تتغير في أي وقت."
        >
          <button
            onClick={() => setMobileFilters((v) => !v)}
            className="lg:hidden inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-black text-ink active:scale-95"
          >
            <Icon name="filter" className="w-4 h-4" />
            {mobileFilters ? "إخفاء التصفية" : "تصفية النتائج"}
          </button>
        </PageHead>

        <div className="mt-8 grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className={`${mobileFilters ? "block" : "hidden"} lg:block`}>
            <div className="lg:sticky lg:top-24">
              <FilterPanel
                filters={filters}
                onChange={setFilters}
                stores={data.stores}
                categories={data.categories}
                resultCount={results.length}
              />
            </div>
          </aside>

          <section aria-label="نتائج العروض">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-muted">
                <span className="font-display text-lg text-ink">{results.length}</span> عرض متاح
              </p>
              <p className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-muted">
                <Icon name="shield" className="w-3.5 h-3.5 text-primary" />
                الشراء يتم من المتجر مباشرة عبر رابط الأفلييت
              </p>
            </div>
            <ProductGrid products={results} stores={data.stores} showCountdown />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
