import { Link } from "react-router-dom";
import { getCategories, getSettings, getStores } from "../lib/db";
import { Icon, StoreLogo } from "./ui";

export default function Footer() {
  const settings = getSettings();
  const stores = getStores();
  const categories = getCategories().slice(0, 8);

  const colTitle = "mb-4 font-display font-bold text-[15px] text-bg";
  const linkCls = "text-sm text-bg/60 hover:text-accent transition-colors leading-7";

  return (
    <footer className="mt-16 bg-night text-bg">
      {/* disclosure band */}
      <div className="border-b border-bg/10">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-xl border border-accent/25 bg-night2 px-5 py-4">
            <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
              <Icon name="shield" className="w-5 h-5" />
            </span>
            <p className="flex-1 text-[13px] leading-6 text-bg/75">
              <span className="font-bold text-accent">الإفصاح عن روابط الأفلييت: </span>
              {settings.disclosure}{" "}
              <Link to="/disclosure" className="font-bold text-accent underline underline-offset-4 hover:text-bg transition-colors">
                اقرأ التفاصيل
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {/* about */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary text-bg">
                <Icon name="tag" className="w-5 h-5" />
              </span>
              <span className="leading-none">
                <span className="block font-display font-black text-xl">وفرلي</span>
                <span className="block text-[10px] font-bold tracking-[0.22em] text-bg/40">WAFFERLY</span>
              </span>
            </div>
            <p className="text-sm leading-7 text-bg/60">
              منصة سعودية تجمع لك أفضل العروض والمنتجات من متاجرك المفضلة في مكان واحد، مع تخفيضات محدثة يوميًا بالريال السعودي.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a href={settings.twitter} target="_blank" rel="noopener noreferrer" aria-label="حسابنا على X" className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-bg/5 text-bg/70 hover:bg-accent hover:text-ink transition-all active:scale-95">
                <Icon name="xtwitter" className="w-4 h-4" />
              </a>
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="حسابنا على انستقرام" className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-bg/5 text-bg/70 hover:bg-accent hover:text-ink transition-all active:scale-95">
                <Icon name="instagram" className="w-4 h-4" />
              </a>
              <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="واتساب" className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-bg/5 text-bg/70 hover:bg-accent hover:text-ink transition-all active:scale-95">
                <Icon name="whatsapp" className="w-4 h-4" />
              </a>
              <a href={`mailto:${settings.email}`} aria-label="البريد الإلكتروني" className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-bg/5 text-bg/70 hover:bg-accent hover:text-ink transition-all active:scale-95">
                <Icon name="mail" className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* links */}
          <div>
            <h3 className={colTitle}>عن الموقع</h3>
            <ul className="space-y-1">
              <li><Link className={linkCls} to="/about">من نحن</Link></li>
              <li><Link className={linkCls} to="/contact">تواصل معنا</Link></li>
              <li><Link className={linkCls} to="/best">أفضل الاختيارات</Link></li>
              <li><Link className={linkCls} to="/favorites">مفضلتي</Link></li>
            </ul>
          </div>
          <div>
            <h3 className={colTitle}>روابط مهمة</h3>
            <ul className="space-y-1">
              <li><Link className={linkCls} to="/disclosure">الإفصاح عن الأفلييت</Link></li>
              <li><Link className={linkCls} to="/privacy">سياسة الخصوصية</Link></li>
              <li><Link className={linkCls} to="/terms">الشروط والأحكام</Link></li>
              <li><Link className={linkCls} to="/cookies">سياسة ملفات الارتباط</Link></li>
            </ul>
          </div>

          {/* stores */}
          <div>
            <h3 className={colTitle}>أشهر المتاجر</h3>
            <ul className="space-y-1">
              {stores.slice(0, 6).map((s) => (
                <li key={s.id}>
                  <Link to={`/store/${s.slug}`} className="flex items-center gap-2 text-sm text-bg/60 hover:text-accent transition-colors leading-8">
                    <StoreLogo store={s} size="sm" />
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* categories */}
          <div>
            <h3 className={colTitle}>أشهر التصنيفات</h3>
            <ul className="space-y-1">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/category/${c.slug}`} className={linkCls}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-bg/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row">
          <p className="text-xs text-bg/50">
            © {new Date().getFullYear()} وفرلي — جميع الحقوق محفوظة. الأسعار والتوفر قد تتغير في أي وقت، والسعر النهائي هو السعر المعروض في متجر البائع.
          </p>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-bg/40 hover:text-accent transition-colors">
            <Icon name="lock" className="w-3.5 h-3.5" />
            لوحة التحكم
          </Link>
        </div>
      </div>
    </footer>
  );
}
