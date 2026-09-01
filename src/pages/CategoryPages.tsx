import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { CategoryCard, FilterPanel, PageHead, ProductGrid, defaultFilters } from "../components/Sections";
import { Breadcrumbs, EmptyState, Icon } from "../components/ui";
import * as db from "../lib/db";
import type { Filters } from "../lib/types";
import { applyFilters, applySeo, breadcrumbJsonLd, useSeo } from "../lib/utils";
import { MobileFilterToggle } from "./StoresPages";

export function CategoriesPage() {
  const data = useMemo(() => {
    const categories = db.getCategories();
    const products = db.getProducts();
    return { categories, products };
  }, []);

  applySeo({
    title: "التصنيفات — جوالات، إلكترونيات، أزياء وعطور | وفرلي",
    description: "تصفح العروض حسب التصنيف: جوالات، إلكترونيات، لابتوبات، أجهزة منزلية، أزياء، عطور، ساعات وغيرها — محدثة يوميًا بالريال السعودي.",
    path: "/categories",
  });

  const countOf = (id: number) => data.products.filter((p) => p.categoryId === id && p.status === "active").length;

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-8">
        <PageHead
          eyebrow={`${data.categories.length} تصنيف`}
          title="تصفح العروض حسب التصنيف"
          desc="من الجوالات والإلكترونيات إلى العطور والأزياء — كل تصنيف يجمع عروضه من كل المتاجر في صفحة واحدة مع فلترة كاملة."
        />
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.categories.map((c) => (
            <CategoryCard key={c.id} category={c} count={countOf(c.id)} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}

export function CategoryDetail({ slug }: { slug: string }) {
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  const data = useMemo(() => {
    const category = db.getCategoryBySlug(slug);
    if (!category) return null;
    const stores = db.getStores();
    const categories = db.getCategories();
    const products = db.getProducts().filter((p) => p.categoryId === category.id);
    return { category, stores, categories, products };
  }, [slug]);

  useSeo(
    {
      title: data ? data.category.metaTitle : "التصنيف غير موجود | وفرلي",
      description: data ? data.category.metaDescription : "",
      path: `/category/${slug}`,
      jsonLd: data
        ? breadcrumbJsonLd([
            { name: "الرئيسية", path: "/" },
            { name: "التصنيفات", path: "/categories" },
            { name: data.category.name, path: `/category/${data.category.slug}` },
          ])
        : undefined,
    },
    [slug]
  );

  if (!data) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState icon="grid" title="التصنيف غير موجود" desc="تحقق من الرابط أو تصفح كل التصنيفات." action={<Link to="/categories" className="rounded-xl bg-primary px-6 py-3 font-bold text-bg hover:bg-primary-dark">كل التصنيفات</Link>} />
      </main>
    );
  }

  const { category } = data;
  const results = applyFilters(data.products, { ...filters, categoryId: null });

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs items={[{ label: "الرئيسية", to: "/" }, { label: "التصنيفات", to: "/categories" }, { label: category.name }]} />

        <div className="mt-5 rounded-2xl border border-line bg-card p-6 shadow-soft sm:p-8">
          <div className="flex items-start gap-4">
            <span className="inline-flex w-14 h-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-bg shadow-soft">
              <Icon name={category.icon} className="w-7 h-7" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-black sm:text-3xl">{category.name}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{category.description}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-black text-primary">
                <Icon name="tag" className="w-3.5 h-3.5" />
                {data.products.length} عرض في هذا التصنيف
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[290px_1fr]">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel filters={filters} onChange={setFilters} stores={data.stores} categories={data.categories} showCategories={false} resultCount={results.length} />
            </div>
          </aside>
          <div>
            <MobileFilterToggle filters={filters} setFilters={setFilters} stores={data.stores} categories={data.categories} count={results.length} />
            <ProductGrid
              products={results}
              stores={data.stores}
              showCountdown
              emptyTitle={`لا توجد عروض في ${category.name} حاليًا`}
              emptyDesc="نضيف عروضًا جديدة يوميًا — جرّب تصنيفًا آخر أو عد لاحقًا."
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
