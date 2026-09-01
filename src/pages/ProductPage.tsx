import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { CountdownChip, ProductCard, ProductGrid } from "../components/Sections";
import { BadgePill, Breadcrumbs, Icon, SmartImage, Stars, StoreLogo, toast } from "../components/ui";
import * as db from "../lib/db";
import {
  SITE_URL,
  breadcrumbJsonLd,
  discountOf,
  fmt,
  fmtCompact,
  isExpired,
  saveAmount,
  timeAgo,
  toggleFav,
  useFavorites,
  useSeo,
} from "../lib/utils";

const viewed = new Set<string>();

export default function ProductPage({ slug }: { slug: string }) {
  const data = useMemo(() => {
    const product = db.getProductBySlug(slug);
    if (!product) return null;
    if (!viewed.has(slug)) {
      viewed.add(slug);
      db.recordView(product.id);
    }
    const store = db.getStoreById(product.storeId);
    const category = db.getCategoryById(product.categoryId);
    const settings = db.getSettings();
    const products = db.getProducts();
    const similar = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
    const sameStore = products.filter((p) => p.storeId === product.storeId && p.id !== product.id).slice(0, 4);
    return { product, store, category, settings, similar, sameStore };
  }, [slug]);

  const gallery = data ? [data.product.image, ...data.product.images.filter((i) => i !== data.product.image)] : [];
  const [activeImg, setActiveImg] = useState(0);
  const [favs] = useFavorites();

  const earlyProduct = data?.product;
  const earlyStore = data?.store;
  const earlyCategory = data?.category;
  const earlySettings = data?.settings ?? db.getSettings();

  useSeo(
    {
      title: earlyProduct ? earlyProduct.metaTitle || `${earlyProduct.name} | وفرلي` : "المنتج غير موجود | وفرلي",
      description: earlyProduct ? earlyProduct.metaDescription || earlyProduct.shortDescription : "المنتج المطلوب غير متوفر.",
      path: earlyProduct ? `/product/${earlyProduct.slug}` : "/404",
      image: earlyProduct?.image,
      type: "product",
      jsonLd: earlyProduct
        ? [
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: earlyProduct.name,
              image: earlyProduct.image,
              description: earlyProduct.description,
              sku: earlyProduct.slug,
              brand: earlyStore ? { "@type": "Brand", name: earlyStore.name } : undefined,
              aggregateRating: { "@type": "AggregateRating", ratingValue: earlyProduct.rating, reviewCount: earlyProduct.views },
              offers: {
                "@type": "Offer",
                url: `${SITE_URL}/product/${earlyProduct.slug}`,
                priceCurrency: "SAR",
                price: earlyProduct.price,
                availability: isExpired(earlyProduct) ? "https://schema.org/Discontinued" : "https://schema.org/InStock",
                seller: earlyStore ? { "@type": "Organization", name: earlyStore.name } : undefined,
              },
            },
            breadcrumbJsonLd([
              { name: "الرئيسية", path: "/" },
              ...(earlyCategory ? [{ name: earlyCategory.name, path: `/category/${earlyCategory.slug}` }] : []),
              { name: earlyProduct.name, path: `/product/${earlyProduct.slug}` },
            ]),
          ]
        : undefined,
    },
    [slug]
  );

  if (!data) {
    return <NotFoundInline />;
  }

  const { product, store, category } = data;
  const settings = data.settings ?? earlySettings;
  const discount = discountOf(product);
  const expired = isExpired(product);
  const saved = favs.includes(product.slug);
  const pageUrl = `${SITE_URL}/product/${product.slug}`;
  const shareText = `${product.name} — ${fmt(product.price)} ر.س${discount ? ` (خصم ${discount}%)` : ""} على وفرلي`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      toast("تم نسخ رابط المنتج");
    } catch {
      toast("تعذّر النسخ — انسخ الرابط من شريط العنوان", "error");
    }
  };

  const onSave = () => {
    const added = toggleFav(product.slug);
    toast(added ? "تم حفظ المنتج في مفضلتك" : "تمت الإزالة من مفضلتك", added ? "success" : "info");
  };

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-6">
        <Breadcrumbs
          items={[
            { label: "الرئيسية", to: "/" },
            ...(category ? [{ label: category.name, to: `/category/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-5 grid gap-8 lg:grid-cols-2">
          {/* gallery */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-card shadow-soft">
              <SmartImage src={gallery[activeImg]} alt={product.name} className="aspect-square" eager />
              <div className="absolute top-3 start-3 flex flex-col items-start gap-2">
                {discount && discount > 0 && !expired && (
                  <span className="rounded-lg bg-flash px-3 py-1.5 text-sm font-black text-bg shadow-soft">خصم {discount}%</span>
                )}
                <BadgePill badge={product.badge} />
              </div>
              {expired && (
                <span className="absolute inset-x-0 bottom-0 bg-night/85 py-3 text-center text-sm font-black text-bg">العرض منتهي — احتفظنا بالصفحة للأرشفة</span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2.5">
                {gallery.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`overflow-hidden rounded-xl border-2 transition-all ${i === activeImg ? "border-primary" : "border-line hover:border-line2"}`}
                    aria-label={`صورة ${i + 1}`}
                  >
                    <SmartImage src={img} alt="" className="w-20 h-20" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* info */}
          <div>
            {store && (
              <Link to={`/store/${store.slug}`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 shadow-soft transition-colors hover:border-primary/40">
                <StoreLogo store={store} size="sm" />
                <span className="text-sm font-bold text-ink2">{store.name}</span>
                <Icon name="chevronLeft" className="w-3.5 h-3.5 text-muted" />
              </Link>
            )}
            <h1 className="mt-3 font-display text-2xl font-black leading-snug sm:text-3xl">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Stars rating={product.rating} />
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted">
                <Icon name="eye" className="w-4 h-4" />
                {fmtCompact(product.views)} مشاهدة
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted">
                <Icon name="clock" className="w-4 h-4" />
                {timeAgo(product.createdAt)}
              </span>
            </div>

            <p className="mt-4 text-[15px] leading-8 text-ink2">{product.shortDescription}</p>

            {/* price ticket */}
            <div className="relative mt-6 rounded-xl border-2 border-dashed border-line2 bg-card p-5">
              <span className="absolute -top-2.5 start-8 h-5 w-5 rounded-full border-2 border-dashed border-line2 bg-bg" aria-hidden="true" />
              <span className="absolute -bottom-2.5 start-8 h-5 w-5 rounded-full border-2 border-dashed border-line2 bg-bg" aria-hidden="true" />
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-muted">السعر الحالي</p>
                  <p className="font-display text-4xl font-black text-primary">
                    {fmt(product.price)} <span className="text-base text-muted">ر.س</span>
                  </p>
                  {product.oldPrice && (
                    <p className="mt-1 text-sm text-muted">
                      بدلاً من <s className="font-bold text-ink2">{fmt(product.oldPrice)} ر.س</s>
                      <span className="ms-2 rounded-md bg-flash-soft px-2 py-0.5 text-xs font-black text-flash">
                        وفّر {fmt(saveAmount(product))} ر.س
                      </span>
                    </p>
                  )}
                </div>
                {product.expiryDate && !expired && (
                  <div className="rounded-lg bg-flash-soft px-3 py-2 text-flash">
                    <p className="text-[10px] font-black">ينتهي العرض خلال</p>
                    <CountdownChip expiry={product.expiryDate} className="text-sm" />
                  </div>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {expired ? (
                <span className="inline-flex flex-1 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-line px-6 py-4 font-display text-lg font-bold text-muted">
                  العرض منتهي
                </span>
              ) : (
                <Link
                  to={`/go/${product.slug}`}
                  className="group inline-flex flex-1 items-center justify-center gap-2.5 rounded-xl bg-accent px-6 py-4 font-display text-lg font-bold text-ink shadow-lift transition-all hover:bg-accent-dark hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <Icon name="bag" className="w-5 h-5" />
                  شراء من المتجر
                  <Icon name="external" className="w-4.5 h-4.5 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              )}
              <button
                onClick={onSave}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border-2 px-5 py-3.5 font-display font-bold transition-all active:scale-95 ${
                  saved ? "border-flash/30 bg-flash-soft text-flash" : "border-line text-ink2 hover:border-flash/40 hover:text-flash"
                }`}
              >
                <Icon name="heart" className="w-5 h-5" filled={saved} />
                {saved ? "محفوظ" : "حفظ"}
              </button>
            </div>
            {expired && store && (
              <Link to={`/store/${store.slug}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-black text-primary hover:underline">
                تصفح عروض {store.name} الحالية
                <Icon name="chevronLeft" className="w-4 h-4" />
              </Link>
            )}

            {/* share */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-muted">مشاركة العرض:</span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText + "\n" + pageUrl)}`}
                target="_blank" rel="noopener noreferrer" aria-label="مشاركة عبر واتساب"
                className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-[#25D366]/12 text-[#128C4A] transition-all hover:bg-[#25D366] hover:text-bg active:scale-90"
              >
                <Icon name="whatsapp" className="w-4.5 h-4.5" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`}
                target="_blank" rel="noopener noreferrer" aria-label="مشاركة عبر X"
                className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-ink/8 text-ink transition-all hover:bg-ink hover:text-bg active:scale-90"
              >
                <Icon name="xtwitter" className="w-4 h-4" />
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`}
                target="_blank" rel="noopener noreferrer" aria-label="مشاركة عبر تيليجرام"
                className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-[#229ED9]/12 text-[#1B7FB0] transition-all hover:bg-[#229ED9] hover:text-bg active:scale-90"
              >
                <Icon name="telegram" className="w-4 h-4" />
              </a>
              <button
                onClick={copyLink} aria-label="نسخ الرابط"
                className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-primary-soft text-primary transition-all hover:bg-primary hover:text-bg active:scale-90"
              >
                <Icon name="link" className="w-4 h-4" />
              </button>
            </div>

            {/* disclosure */}
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-accent/30 bg-accent-soft/60 px-4 py-3">
              <Icon name="shield" className="mt-0.5 w-4.5 h-4.5 shrink-0 text-accent-dark" />
              <p className="text-[13px] leading-6 text-ink2">
                {settings.disclosure}{" "}
                <Link to="/disclosure" className="font-black text-primary underline underline-offset-4">التفاصيل</Link>
              </p>
            </div>

            {/* features */}
            {product.features.length > 0 && (
              <div className="mt-6">
                <h2 className="font-display font-bold text-lg">أهم المميزات</h2>
                <ul className="mt-3 space-y-2.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm font-medium text-ink2">
                      <span className="mt-0.5 inline-flex w-5 h-5 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                        <Icon name="check" className="w-3 h-3" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* description */}
        <div className="mt-10 rounded-xl border border-line bg-card p-6 shadow-soft">
          <h2 className="font-display font-bold text-lg">عن هذا المنتج</h2>
          <p className="mt-3 max-w-3xl text-[15px] leading-8 text-ink2">{product.description}</p>
          <p className="mt-4 flex items-center gap-2 text-xs font-bold text-muted">
            <Icon name="alert" className="w-4 h-4 text-accent-dark" />
            الأسعار والتوفر قد تتغير في أي وقت، والسعر النهائي هو السعر المعروض في متجر البائع.
          </p>
        </div>

        {/* rails */}
        {data.similar.length > 0 && (
          <section className="mt-12" aria-label="منتجات مشابهة">
            <h2 className="mb-5 font-display text-xl font-bold">منتجات مشابهة{category ? ` في ${category.name}` : ""}</h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {data.similar.map((p) => (
                <ProductCard key={p.id} product={p} store={db.getStoreById(p.storeId)} />
              ))}
            </div>
          </section>
        )}
        {data.sameStore.length > 0 && store && (
          <section className="mt-12" aria-label={`عروض من ${store.name}`}>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2.5 font-display text-xl font-bold">
                <StoreLogo store={store} size="md" />
                عروض أخرى من {store.name}
              </h2>
              <Link to={`/store/${store.slug}`} className="hidden sm:inline-flex items-center gap-1 text-sm font-black text-primary hover:underline">
                كل العروض
                <Icon name="chevronLeft" className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {data.sameStore.map((p) => (
                <ProductCard key={p.id} product={p} store={store} />
              ))}
            </div>
          </section>
        )}
        {data.similar.length === 0 && data.sameStore.length === 0 && (
          <div className="mt-12">
            <ProductGrid products={db.getProducts().filter((p) => p.id !== product.id).slice(0, 4)} stores={db.getStores()} pageSize={4} emptyTitle="لا توجد منتجات أخرى بعد" />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function NotFoundInline() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col items-center px-4 py-24 text-center">
      <Icon name="alert" className="w-12 h-12 text-flash" />
      <h1 className="mt-4 font-display text-2xl font-black">المنتج غير موجود</h1>
      <p className="mt-2 text-muted">ربما تم حذف المنتج أو تغيير رابطه.</p>
      <Link to="/deals" className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-bg hover:bg-primary-dark">تصفح العروض</Link>
    </main>
  );
}
