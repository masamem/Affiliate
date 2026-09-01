import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon, SmartImage, StoreLogo } from "../components/ui";
import * as db from "../lib/db";
import { fmt, useSeo } from "../lib/utils";

const clicked = new Set<string>();

export default function GoPage({ slug }: { slug: string }) {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(3);
  const startedRef = useRef(false);

  const data = useMemo(() => {
    const product = db.getProductBySlug(slug);
    if (!product) return null;
    const store = db.getStoreById(product.storeId);
    return { product, store };
  }, [slug]);

  useEffect(() => {
    if (!data || startedRef.current) return;
    startedRef.current = true;
    db.recordClick(data.product.id);
    const timer = setTimeout(() => {
      window.location.assign(data.product.affiliateUrl);
    }, 2600);
    const counter = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 850);
    return () => {
      clearTimeout(timer);
      clearInterval(counter);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.product.id]);

  useSeo(
    {
      title: data ? `تحويل إلى ${data.store?.name || "المتجر"} | وفرلي` : "الرابط غير موجود | وفرلي",
      description: "جاري تحويلك إلى المتجر لإتمام الشراء.",
      path: `/go/${slug}`,
    },
    [slug]
  );

  if (!data) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <Icon name="alert" className="mx-auto w-12 h-12 text-flash" />
          <h1 className="mt-4 font-display text-2xl font-black">الرابط غير موجود</h1>
          <p className="mt-2 text-muted">المنتج المطلوب غير متوفر أو تم حذفه.</p>
          <Link to="/deals" className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 font-bold text-bg hover:bg-primary-dark">تصفح العروض</Link>
        </div>
      </main>
    );
  }

  const { product, store } = data;

  return (
    <main className="relative flex min-h-[78vh] items-center justify-center overflow-hidden bg-night px-4 py-14">
      <div className="absolute inset-0 dots-pattern opacity-60" aria-hidden="true" />
      <div className="absolute -top-24 start-1/3 h-72 w-72 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-lg">
        <div className="rounded-2xl border border-bg/10 bg-night2 p-6 sm:p-8 text-center shadow-lift">
          {store && <StoreLogo store={store} size="xl" />}
          <h1 className="mt-4 font-display text-xl font-black text-bg sm:text-2xl">
            جاري تحويلك إلى {store?.name || "المتجر"}…
          </h1>
          <p className="mt-2 text-sm text-bg/55">سيفتح رابط العرض في نافذتك خلال ثوانٍ — تم تسجيل النقرة لدعم استمراريتنا.</p>

          {/* product mini */}
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-bg/10 bg-night p-3 text-start">
            <SmartImage src={product.image} alt={product.name} className="w-16 h-16 rounded-lg shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="clamp-2 text-sm font-bold text-bg">{product.name}</p>
              <p className="mt-0.5 font-display font-black text-accent">
                {fmt(product.price)} <span className="text-[10px] text-bg/50">ر.س</span>
              </p>
            </div>
          </div>

          {/* progress */}
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-bg/10">
            <div className="go-progress h-full rounded-full bg-accent" />
          </div>
          <p className="mt-3 text-xs font-bold text-bg/45" aria-live="polite">
            التحويل التلقائي خلال {Math.max(1, seconds)} ثوانٍ…
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-display font-bold text-ink transition-all hover:bg-accent-dark active:scale-95"
            >
              فتح المتجر الآن
              <Icon name="external" className="w-4 h-4" />
            </a>
            <button
              onClick={() => navigate(`/product/${product.slug}`)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-bg/15 px-5 py-3 font-display font-bold text-bg transition-all hover:border-flash hover:text-flash active:scale-95"
            >
              <Icon name="x" className="w-4 h-4" />
              إلغاء التحويل
            </button>
          </div>

          <p className="mt-5 text-[11px] leading-5 text-bg/40">
            قد نحصل على عمولة عند الشراء من خلال هذا الرابط دون أي تكلفة إضافية عليك.{" "}
            <Link to="/disclosure" className="text-accent/80 hover:text-accent underline underline-offset-2">الإفصاح الكامل</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
