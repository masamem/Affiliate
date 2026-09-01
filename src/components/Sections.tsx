import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Category, Filters, Product, SortKey, Store } from "../lib/types";
import {
  SORT_LABELS,
  discountOf,
  fmt,
  fmtCompact,
  isExpired,
  toast,
  toggleFav,
  useFavorites,
} from "../lib/utils";
import { Icon, SmartImage, StoreLogo, BadgePill, Stars, EmptyState } from "./ui";

/* ================= countdown chip ================= */

export function CountdownChip({ expiry, className = "" }: { expiry: string; className?: string }) {
  const [left, setLeft] = useState(() => new Date(expiry).getTime() - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(new Date(expiry).getTime() - Date.now()), 1000);
    return () => clearInterval(t);
  }, [expiry]);
  if (left <= 0) return null;
  const h = Math.floor(left / 3600000);
  const m = Math.floor((left % 3600000) / 60000);
  const s = Math.floor((left % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black ${className}`} dir="ltr">
      <Icon name="clock" className="w-3.5 h-3.5" />
      {h > 48 ? `${Math.floor(h / 24)} يوم و ${pad(h % 24)} س` : `${pad(h)}:${pad(m)}:${pad(s)}`}
    </span>
  );
}

/* ================= product card ================= */

export function ProductCard({
  product,
  store,
  showCountdown = false,
  compact = false,
}: {
  product: Product;
  store?: Store;
  showCountdown?: boolean;
  compact?: boolean;
}) {
  const [favs] = useFavorites();
  const saved = favs.includes(product.slug);
  const discount = discountOf(product);
  const expired = isExpired(product);

  const onSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const added = toggleFav(product.slug);
    toast(added ? "تم حفظ المنتج في مفضلتك" : "تمت الإزالة من مفضلتك", added ? "success" : "info");
  };

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-xl border border-line bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-line2 ${expired ? "opacity-80" : ""}`}
    >
      {/* image */}
      <Link to={`/product/${product.slug}`} className="relative block">
        <SmartImage
          src={product.image}
          alt={product.name}
          className="aspect-square bg-bg"
          imgClass={`transition-transform duration-500 group-hover:scale-[1.06] ${expired ? "grayscale" : ""}`}
        />
        <div className="absolute top-2.5 start-2.5 flex flex-col items-start gap-1.5">
          {discount && discount > 0 && !expired && (
            <span className="rounded-md bg-flash px-2 py-1 text-[11px] font-black text-bg shadow-soft">
              خصم {discount}%
            </span>
          )}
          <BadgePill badge={product.badge} />
        </div>
        {expired && (
          <span className="absolute inset-x-0 bottom-0 bg-night/85 py-2 text-center text-xs font-black text-bg">
            العرض منتهي
          </span>
        )}
      </Link>

      <button
        onClick={onSave}
        aria-label={saved ? "إزالة من المفضلة" : "حفظ في المفضلة"}
        className={`absolute top-2.5 end-2.5 inline-flex w-8 h-8 items-center justify-center rounded-full border shadow-soft transition-all active:scale-90 ${
          saved ? "border-flash/30 bg-flash text-bg" : "border-line bg-card/95 text-muted hover:text-flash"
        }`}
      >
        <Icon name="heart" className="w-4 h-4" filled={saved} />
      </button>

      {/* body */}
      <div className={`flex flex-1 flex-col gap-2 p-3.5 ${compact ? "sm:p-3" : ""}`}>
        {store && (
          <Link to={`/store/${store.slug}`} className="flex w-fit items-center gap-1.5 rounded-md px-1 py-0.5 -mx-1 transition-colors hover:bg-bg">
            <StoreLogo store={store} size="sm" />
            <span className="text-xs font-bold text-muted hover:text-ink transition-colors">{store.name}</span>
          </Link>
        )}
        <Link to={`/product/${product.slug}`} className="min-h-[2.6em]">
          <h3 className={`clamp-2 font-bold leading-[1.35] text-ink transition-colors group-hover:text-primary ${compact ? "text-[13px]" : "text-sm"}`}>
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <Stars rating={product.rating} />
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
            <Icon name="eye" className="w-3.5 h-3.5" />
            {fmtCompact(product.views)}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="leading-none">
            <span className="font-display font-black text-lg text-ink">
              {fmt(product.price)}
              <span className="ms-1 text-[11px] font-bold text-muted">ر.س</span>
            </span>
            {product.oldPrice && (
              <span className="mt-1 block text-xs text-muted">
                بدلاً من <s className="font-bold">{fmt(product.oldPrice)} ر.س</s>
              </span>
            )}
          </div>
          {showCountdown && product.expiryDate && !expired && (
            <CountdownChip expiry={product.expiryDate} className="text-flash" />
          )}
        </div>

        {expired ? (
          <span className="mt-1 inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-line px-4 py-2.5 text-sm font-bold text-muted">
            انتهى العرض
          </span>
        ) : (
          <Link
            to={`/go/${product.slug}`}
            className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-bg transition-all hover:bg-primary-dark active:scale-[0.98]"
          >
            شاهد العرض
            <Icon name="external" className="w-4 h-4" />
          </Link>
        )}
      </div>
    </article>
  );
}

/* ================= coupon card (hero) ================= */

export function CouponCard({
  product,
  store,
  rotation = 0,
  delay = 0,
}: {
  product: Product;
  store?: Store;
  rotation?: number;
  delay?: number;
}) {
  const discount = discountOf(product) || 0;
  return (
    <Link
      to={`/product/${product.slug}`}
      className="floaty group flex items-stretch overflow-hidden rounded-xl border border-line bg-card shadow-lift transition-all duration-300 hover:shadow-lift hover:brightness-[1.02]"
      style={{ transform: `rotate(${rotation}deg)`, animationDelay: `${delay}ms`, ["--rot" as string]: `${rotation}deg` }}
    >
      <div className="relative w-24 sm:w-28 shrink-0">
        <SmartImage src={product.image} alt={product.name} className="h-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-3.5 py-3">
        {store && (
          <span className="flex items-center gap-1.5">
            <StoreLogo store={store} size="sm" />
            <span className="text-[11px] font-bold text-muted">{store.name}</span>
          </span>
        )}
        <span className="clamp-2 text-[13px] font-bold leading-snug text-ink">{product.name}</span>
        <span className="font-display text-sm font-black text-primary">
          {fmt(product.price)} <span className="text-[10px] font-bold text-muted">ر.س</span>
          {product.oldPrice && <s className="ms-2 text-[11px] font-bold text-muted">{fmt(product.oldPrice)}</s>}
        </span>
      </div>
      <div className="relative flex w-20 sm:w-24 shrink-0 flex-col items-center justify-center gap-1 border-s-2 border-dashed border-line2 bg-bg/60 px-2">
        <span className="font-display text-xl font-black text-flash">{discount}%</span>
        <span className="text-[10px] font-black text-muted">خصم</span>
        <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-accent px-2 py-1 text-[10px] font-black text-ink transition-transform group-hover:scale-105">
          احصل عليه
          <Icon name="chevronLeft" className="w-3 h-3" />
        </span>
      </div>
      {/* ticket notches */}
      <span className="absolute -top-2 end-[4.5rem] sm:end-[5.5rem] h-4 w-4 rounded-full bg-night" aria-hidden="true" />
      <span className="absolute -bottom-2 end-[4.5rem] sm:end-[5.5rem] h-4 w-4 rounded-full bg-night" aria-hidden="true" />
    </Link>
  );
}

/* ================= store card ================= */

export function StoreCard({ store, count }: { store: Store; count: number }) {
  return (
    <Link
      to={`/store/${store.slug}`}
      className="group flex flex-col items-center rounded-xl border border-line bg-card p-5 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift hover:border-primary/30"
    >
      <StoreLogo store={store} size="xl" />
      <h3 className="mt-3 font-display font-bold text-[15px] text-ink group-hover:text-primary transition-colors">{store.name}</h3>
      <p className="clamp-2 mt-1 text-xs leading-5 text-muted">{store.description}</p>
      <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-black text-primary">
        <Icon name="tag" className="w-3 h-3" />
        {count} عرض نشط
      </span>
      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-primary opacity-0 transition-all group-hover:opacity-100">
        عرض العروض
        <Icon name="chevronLeft" className="w-3.5 h-3.5" />
      </span>
    </Link>
  );
}

/* ================= category card ================= */

export function CategoryCard({ category, count }: { category: Category; count: number }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group flex items-center gap-3 rounded-xl border border-line bg-card px-4 py-3.5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:border-primary/30"
    >
      <span className="inline-flex w-11 h-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-bg">
        <Icon name={category.icon} className="w-5 h-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-sm text-ink group-hover:text-primary transition-colors">{category.name}</span>
        <span className="text-xs text-muted">{count} منتج</span>
      </span>
      <Icon name="chevronLeft" className="w-4 h-4 shrink-0 text-muted transition-transform group-hover:-translate-x-0.5" />
    </Link>
  );
}

/* ================= filter panel ================= */

export const defaultFilters: Filters = {
  storeIds: [],
  categoryId: null,
  minPrice: "",
  maxPrice: "",
  minDiscount: 0,
  sort: "latest",
  showExpired: false,
};

export function FilterPanel({
  filters,
  onChange,
  stores,
  categories,
  showStores = true,
  showCategories = true,
  resultCount,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  stores: Store[];
  categories: Category[];
  showStores?: boolean;
  showCategories?: boolean;
  resultCount?: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const toggleStore = (id: number) =>
    set({
      storeIds: filters.storeIds.includes(id)
        ? filters.storeIds.filter((x) => x !== id)
        : [...filters.storeIds, id],
    });
  const dirty =
    filters.storeIds.length > 0 ||
    filters.categoryId !== null ||
    filters.minPrice !== "" ||
    filters.maxPrice !== "" ||
    filters.minDiscount > 0 ||
    filters.showExpired;

  return (
    <div className="rounded-xl border border-line bg-card p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display font-bold text-[15px]">
          <Icon name="filter" className="w-4 h-4 text-primary" />
          تصفية النتائج
          {typeof resultCount === "number" && (
            <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-black text-primary">{resultCount}</span>
          )}
        </h3>
        {dirty && (
          <button onClick={() => onChange({ ...defaultFilters, sort: filters.sort })} className="text-xs font-bold text-flash hover:underline">
            مسح الكل
          </button>
        )}
      </div>

      <div className="space-y-5">
        <div>
          <p className="mb-2 text-xs font-black text-muted">الترتيب حسب</p>
          <select
            value={filters.sort}
            onChange={(e) => set({ sort: e.target.value as SortKey })}
            className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-bold outline-none focus:border-primary"
            aria-label="ترتيب النتائج"
          >
            {Object.entries(SORT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>

        {showCategories && (
          <div>
            <p className="mb-2 text-xs font-black text-muted">التصنيف</p>
            <select
              value={filters.categoryId ?? ""}
              onChange={(e) => set({ categoryId: e.target.value ? Number(e.target.value) : null })}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-bold outline-none focus:border-primary"
              aria-label="التصنيف"
            >
              <option value="">كل التصنيفات</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}

        {showStores && (
          <div>
            <p className="mb-2 text-xs font-black text-muted">المتجر</p>
            <div className="flex flex-wrap gap-1.5">
              {stores.map((s) => {
                const active = filters.storeIds.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStore(s.id)}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                      active ? "border-primary bg-primary text-bg" : "border-line bg-surface text-ink2 hover:border-primary/40"
                    }`}
                    aria-pressed={active}
                  >
                    <StoreLogo store={s} size="sm" />
                    {s.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-black text-muted">السعر (ر.س)</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="من"
              value={filters.minPrice}
              onChange={(e) => set({ minPrice: e.target.value })}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-bold outline-none focus:border-primary"
              aria-label="أقل سعر"
            />
            <span className="text-muted">—</span>
            <input
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="إلى"
              value={filters.maxPrice}
              onChange={(e) => set({ maxPrice: e.target.value })}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm font-bold outline-none focus:border-primary"
              aria-label="أعلى سعر"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 flex items-center justify-between text-xs font-black text-muted">
            نسبة الخصم
            <span className="rounded-md bg-flash-soft px-2 py-0.5 text-[11px] font-black text-flash">
              {filters.minDiscount > 0 ? `${filters.minDiscount}% فأكثر` : "الكل"}
            </span>
          </p>
          <input
            type="range"
            min={0}
            max={60}
            step={5}
            value={filters.minDiscount}
            onChange={(e) => set({ minDiscount: Number(e.target.value) })}
            className="w-full"
            aria-label="أقل نسبة خصم"
          />
          <div className="flex justify-between text-[10px] font-bold text-muted"><span>0%</span><span>60%+</span></div>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-bg px-3 py-2.5">
          <input
            type="checkbox"
            checked={filters.showExpired}
            onChange={(e) => set({ showExpired: e.target.checked })}
            className="h-4 w-4 accent-[#0d5c42]"
          />
          <span className="text-xs font-bold text-ink2">إظهار العروض المنتهية</span>
        </label>
      </div>
    </div>
  );
}

/* ================= product grid with pagination ================= */

export function ProductGrid({
  products,
  stores,
  pageSize = 12,
  showCountdown = false,
  emptyTitle = "لا توجد عروض مطابقة",
  emptyDesc = "جرّب تغيير الفلاتر أو البحث عن شيء آخر.",
}: {
  products: Product[];
  stores: Store[];
  pageSize?: number;
  showCountdown?: boolean;
  emptyTitle?: string;
  emptyDesc?: string;
}) {
  const [visible, setVisible] = useState(pageSize);
  useEffect(() => setVisible(pageSize), [products.length, pageSize]);
  const storeOf = (id: number) => stores.find((s) => s.id === id);

  if (!products.length)
    return <EmptyState icon="tag" title={emptyTitle} desc={emptyDesc} />;

  const shown = products.slice(0, visible);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((p) => (
          <ProductCard key={p.id} product={p} store={storeOf(p.storeId)} showCountdown={showCountdown} />
        ))}
      </div>
      {products.length > visible && (
        <div className="mt-8 flex flex-col items-center gap-2">
          <button
            onClick={() => setVisible((v) => v + pageSize)}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-primary px-8 py-3 text-sm font-black text-primary transition-all hover:bg-primary hover:text-bg active:scale-95"
          >
            عرض المزيد من العروض
            <Icon name="chevronDown" className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-muted">
            عرض {shown.length} من أصل {products.length} عرض
          </span>
        </div>
      )}
    </div>
  );
}

/* ================= page head ================= */

export function PageHead({
  eyebrow,
  title,
  desc,
  children,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-night px-5 py-8 sm:px-8 sm:py-10 text-bg">
      <div className="absolute inset-0 dots-pattern opacity-60" aria-hidden="true" />
      <div className="absolute -top-24 -start-24 h-64 w-64 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-20 -end-16 h-56 w-56 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
      <div className="relative max-w-3xl">
        {eyebrow && (
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-black text-accent">
            <Icon name="zap" className="w-3 h-3" filled />
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-2xl font-black sm:text-3xl lg:text-4xl leading-snug">{title}</h1>
        {desc && <p className="mt-3 max-w-2xl text-sm sm:text-[15px] leading-7 text-bg/65">{desc}</p>}
        {children && <div className="mt-5">{children}</div>}
      </div>
    </div>
  );
}
