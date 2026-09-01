import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Field, Icon, Modal, SmartImage, Switch, StoreLogo, inputCls, toast } from "../components/ui";
import * as db from "../lib/db";
import { fmt, timeAgo, useCountUp } from "../lib/utils";

/* ================= login ================= */

function Login({ onOk }: { onOk: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (db.login(user, pass)) {
      toast(`أهلًا بك في لوحة تحكم وفرلي`);
      onOk();
    } else {
      setError("بيانات الدخول غير صحيحة — حاول مجددًا");
      setShakeKey((k) => k + 1);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-night px-4">
      <div className="absolute inset-0 dots-pattern opacity-60" aria-hidden="true" />
      <div className="absolute -top-24 start-1/4 h-80 w-80 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
      <div className="relative w-full max-w-md">
        <div key={shakeKey} className={`rounded-2xl border border-bg/10 bg-night2 p-8 shadow-lift ${shakeKey ? "shake" : ""}`}>
          <div className="flex items-center gap-3">
            <span className="inline-flex w-12 h-12 items-center justify-center rounded-xl bg-primary text-bg">
              <Icon name="tag" className="w-6 h-6" />
            </span>
            <div>
              <h1 className="font-display text-xl font-black text-bg">لوحة تحكم وفرلي</h1>
              <p className="text-xs font-bold text-bg/45">إدارة المنتجات والعروض والنقرات</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-bg/70">اسم المستخدم</label>
              <div className="relative">
                <Icon name="user" className="absolute start-3 top-1/2 w-4.5 h-4.5 -translate-y-1/2 text-bg/30" />
                <input
                  className="w-full rounded-lg border border-bg/15 bg-night px-3.5 py-3 ps-10 text-sm font-bold text-bg outline-none transition-all focus:border-accent placeholder:text-bg/25"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-bold text-bg/70">كلمة المرور</label>
              <div className="relative">
                <Icon name="lock" className="absolute start-3 top-1/2 w-4.5 h-4.5 -translate-y-1/2 text-bg/30" />
                <input
                  type="password"
                  className="w-full rounded-lg border border-bg/15 bg-night px-3.5 py-3 ps-10 text-sm font-bold text-bg outline-none transition-all focus:border-accent placeholder:text-bg/25"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>
            {error && (
              <p className="flex items-center gap-2 rounded-lg bg-flash/15 px-3 py-2.5 text-[13px] font-bold text-flash">
                <Icon name="alert" className="w-4 h-4 shrink-0" />
                {error}
              </p>
            )}
            <button type="submit" className="w-full rounded-xl bg-accent py-3.5 font-display text-[15px] font-bold text-ink transition-all hover:bg-accent-dark active:scale-[0.98]">
              تسجيل الدخول
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-dashed border-accent/30 bg-accent/5 px-4 py-3 text-center">
            <p className="text-[11px] font-bold text-bg/50">
              بيانات الدخول التجريبية: <span dir="ltr" className="font-mono text-accent">admin / wafferly2024</span>
            </p>
            <p className="mt-1 text-[10px] text-bg/35">غيّرها فورًا من الإعدادات في بيئة الإنتاج — تُخزّن كلمة المرور مجزّأة (Hashed)</p>
          </div>

          <Link to="/" className="mt-5 flex items-center justify-center gap-1.5 text-xs font-bold text-bg/40 hover:text-accent transition-colors">
            <Icon name="arrow" className="w-4 h-4 rotate-180" />
            العودة إلى الموقع
          </Link>
        </div>
      </div>
    </main>
  );
}

/* ================= layout ================= */

const NAV_ITEMS = [
  { to: "/admin", label: "نظرة عامة", icon: "chart", end: true },
  { to: "/admin/products", label: "المنتجات", icon: "tag" },
  { to: "/admin/stores", label: "المتاجر", icon: "bag" },
  { to: "/admin/categories", label: "التصنيفات", icon: "grid" },
  { to: "/admin/clicks", label: "نقرات الأفلييت", icon: "cursor" },
  { to: "/admin/settings", label: "الإعدادات", icon: "gear" },
];

export default function AdminGate() {
  const [authed, setAuthed] = useState(db.isAuthed());
  const [menuOpen, setMenuOpen] = useState(false);

  if (!authed) return <Login onOk={() => setAuthed(true)} />;

  const nav = (
    <nav className="flex flex-col gap-1 p-3" aria-label="قائمة الإدارة">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end as boolean | undefined}
          onClick={() => setMenuOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-bold transition-all ${
              isActive ? "bg-primary text-bg shadow-soft" : "text-bg/55 hover:bg-bg/5 hover:text-bg"
            }`
          }
        >
          <Icon name={item.icon} className="w-4.5 h-4.5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );

  const bottom = (
    <div className="mt-auto border-t border-bg/10 p-3">
      <Link to="/" className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-bold text-bg/55 transition-colors hover:bg-bg/5 hover:text-bg">
        <Icon name="external" className="w-4.5 h-4.5" />
        عرض الموقع
      </Link>
      <button
        onClick={() => { db.logout(); toast("تم تسجيل الخروج", "info"); setAuthed(false); }}
        className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-bold text-flash/80 transition-colors hover:bg-flash/10 hover:text-flash"
      >
        <Icon name="logout" className="w-4.5 h-4.5" />
        تسجيل الخروج
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* desktop sidebar */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-60 flex-col bg-night lg:flex">
        <div className="flex items-center gap-2.5 border-b border-bg/10 p-4">
          <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary text-bg">
            <Icon name="tag" className="w-5 h-5" />
          </span>
          <span className="leading-none">
            <span className="block font-display font-black text-lg text-bg">وفرلي</span>
            <span className="text-[10px] font-bold text-bg/40">لوحة التحكم</span>
          </span>
        </div>
        {nav}
        {bottom}
      </aside>

      {/* mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-night px-4 py-3 lg:hidden">
        <span className="flex items-center gap-2 font-display font-black text-bg">
          <Icon name="tag" className="w-5 h-5 text-accent" />
          لوحة التحكم
        </span>
        <button onClick={() => setMenuOpen(true)} className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-bg/10 text-bg" aria-label="فتح القائمة">
          <Icon name="menu" className="w-5 h-5" />
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button className="absolute inset-0 bg-night/70" onClick={() => setMenuOpen(false)} aria-label="إغلاق" />
          <aside className="absolute inset-y-0 start-0 flex w-64 flex-col bg-night shadow-lift toast-in">
            <div className="flex items-center justify-between border-b border-bg/10 p-4">
              <span className="font-display font-black text-bg">وفرلي</span>
              <button onClick={() => setMenuOpen(false)} className="text-bg/50 hover:text-bg" aria-label="إغلاق"><Icon name="x" className="w-5 h-5" /></button>
            </div>
            {nav}
            {bottom}
          </aside>
        </div>
      )}

      <main className="lg:ms-60">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ================= dashboard ================= */

function StatCard({ icon, label, value, accent = false }: { icon: string; label: string; value: number; accent?: boolean }) {
  const v = useCountUp(value, 700);
  return (
    <div className={`rounded-xl border p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift ${accent ? "border-accent/40 bg-accent-soft/50" : "border-line bg-card"}`}>
      <div className="flex items-center justify-between">
        <span className={`inline-flex w-10 h-10 items-center justify-center rounded-lg ${accent ? "bg-accent text-ink" : "bg-primary-soft text-primary"}`}>
          <Icon name={icon} className="w-5 h-5" />
        </span>
        <span className="font-display text-2xl font-black text-ink" dir="ltr">{fmt(v)}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold text-muted">{label}</p>
    </div>
  );
}

export function Dashboard() {
  const stats = useMemo(() => db.getStats(), []);
  const stores = useMemo(() => db.getStores(true), []);
  const maxDay = Math.max(1, ...stats.clicksByDay.map((d) => d.count));
  const maxTop = Math.max(1, ...stats.topProducts.map((t) => t.count));
  const maxStore = Math.max(1, ...stats.topStores.map((t) => t.count));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">نظرة عامة</h1>
          <p className="mt-1 text-sm text-muted">ملخص أداء المنصة ونقرات الأفلييت</p>
        </div>
        <Link to="/admin/products?new=1" className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-black text-bg transition-all hover:bg-primary-dark active:scale-95">
          <Icon name="plus" className="w-4 h-4" />
          إضافة منتج
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatCard icon="tag" label="المنتجات" value={stats.productsCount} />
        <StatCard icon="bag" label="المتاجر" value={stats.storesCount} />
        <StatCard icon="grid" label="التصنيفات" value={stats.categoriesCount} />
        <StatCard icon="cursor" label="إجمالي النقرات" value={stats.totalClicks} accent />
        <StatCard icon="zap" label="نقرات اليوم" value={stats.todayClicks} accent />
        <StatCard icon="calendar" label="نقرات الأسبوع" value={stats.weekClicks} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        {/* chart */}
        <div className="rounded-xl border border-line bg-card p-5 shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">النقرات — آخر 14 يومًا</h2>
            <span className="rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-black text-primary">{fmt(stats.weekClicks)} هذا الأسبوع</span>
          </div>
          <div className="mt-5 flex h-40 items-end gap-1.5" dir="ltr">
            {stats.clicksByDay.map((d, i) => (
              <div key={i} className="group relative flex-1 flex flex-col items-center justify-end h-full" title={`${d.label}: ${d.count} نقرة`}>
                <span className="pointer-events-none absolute -top-7 rounded-md bg-night px-2 py-0.5 text-[10px] font-black text-bg opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                  {d.count}
                </span>
                <div
                  className={`w-full rounded-t-md transition-all group-hover:opacity-80 ${i === stats.clicksByDay.length - 1 ? "bg-accent" : "bg-primary/75"}`}
                  style={{ height: `${Math.max(5, (d.count / maxDay) * 100)}%` }}
                />
                <span className="mt-1.5 text-[9px] font-bold text-muted">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* top stores */}
        <div className="rounded-xl border border-line bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="font-display font-bold">أكثر المتاجر نقرًا</h2>
          <div className="mt-4 space-y-3.5">
            {stats.topStores.map((t) => (
              <div key={t.store.id} className="flex items-center gap-3">
                <StoreLogo store={t.store} size="md" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between text-[13px] font-bold">
                    <span className="truncate">{t.store.name}</span>
                    <span className="text-muted" dir="ltr">{t.count}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(t.count / maxStore) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        {/* top products */}
        <div className="rounded-xl border border-line bg-card p-5 shadow-soft lg:col-span-2">
          <h2 className="font-display font-bold">أكثر المنتجات نقرًا</h2>
          <div className="mt-4 space-y-3">
            {stats.topProducts.map((t, i) => (
              <Link key={t.product.id} to={`/product/${t.product.slug}`} className="flex items-center gap-3 rounded-lg p-1.5 -m-1.5 transition-colors hover:bg-bg">
                <span className="w-5 text-center font-display text-sm font-black text-muted">{i + 1}</span>
                <SmartImage src={t.product.image} alt={t.product.name} className="w-11 h-11 rounded-lg shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{t.product.name}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${(t.count / maxTop) * 100}%` }} />
                  </div>
                </div>
                <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-black text-accent-dark" dir="ltr">{t.count}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* latest products */}
        <div className="rounded-xl border border-line bg-card p-5 shadow-soft lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">أحدث المنتجات</h2>
            <Link to="/admin/products" className="text-xs font-black text-primary hover:underline">إدارة الكل</Link>
          </div>
          <div className="mt-3 divide-y divide-line">
            {stats.latestProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 py-2.5">
                <SmartImage src={p.image} alt={p.name} className="w-11 h-11 rounded-lg shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-bold">{p.name}</p>
                  <p className="text-[11px] text-muted">{stores.find((s) => s.id === p.storeId)?.name} · {timeAgo(p.createdAt)}</p>
                </div>
                <span className="font-display text-sm font-black text-primary" dir="ltr">{fmt(p.price)}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${p.status === "active" ? "bg-primary-soft text-primary" : "bg-line text-muted"}`}>
                  {p.status === "active" ? "نشط" : "معطل"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================= settings ================= */

export function SettingsPage() {
  const [s, setS] = useState(() => db.getSettings());
  const [pw, setPw] = useState({ p1: "", p2: "" });
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => setS(db.getSettings()), []);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) {
      toast("البريد الإلكتروني غير صحيح", "error");
      return;
    }
    db.saveSettings(s);
    toast("تم حفظ الإعدادات بنجاح");
  };

  const changePw = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.p1.length < 8) return toast("كلمة المرور يجب ألا تقل عن 8 أحرف", "error");
    if (pw.p1 !== pw.p2) return toast("كلمتا المرور غير متطابقتين", "error");
    db.changePassword(pw.p1);
    setPw({ p1: "", p2: "" });
    toast("تم تغيير كلمة المرور");
  };

  const exportData = () => {
    const blob = new Blob([db.exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wafferly-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("تم تصدير نسخة احتياطية من البيانات");
  };

  const set = (k: keyof typeof s) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS({ ...s, [k]: e.target.value });

  const sec = "rounded-xl border border-line bg-card p-5 shadow-soft";
  const h2 = "font-display font-bold text-[15px] mb-4 flex items-center gap-2";

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-black">الإعدادات</h1>
      <p className="mt-1 text-sm text-muted">إعدادات الموقع العامة والـ SEO والتتبع</p>

      <form onSubmit={save} className="mt-6 space-y-4">
        <div className={sec}>
          <h2 className={h2}><Icon name="home" className="w-4.5 h-4.5 text-primary" /> هوية الموقع</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم الموقع" required><input className={inputCls} value={s.siteName} onChange={set("siteName")} /></Field>
            <Field label="البريد الإلكتروني"><input className={inputCls} dir="ltr" value={s.email} onChange={set("email")} /></Field>
          </div>
          <div className="mt-4">
            <Field label="الوصف التعريفي (Tagline)"><textarea className={`${inputCls} min-h-20`} value={s.tagline} onChange={set("tagline")} /></Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="رابط X (تويتر)"><input className={inputCls} dir="ltr" value={s.twitter} onChange={set("twitter")} /></Field>
            <Field label="رابط انستقرام"><input className={inputCls} dir="ltr" value={s.instagram} onChange={set("instagram")} /></Field>
            <Field label="رابط واتساب"><input className={inputCls} dir="ltr" value={s.whatsapp} onChange={set("whatsapp")} /></Field>
          </div>
        </div>

        <div className={sec}>
          <h2 className={h2}><Icon name="shield" className="w-4.5 h-4.5 text-primary" /> نص الإفصاح</h2>
          <Field label="نص الإفصاح عن الأفلييت" hint="يظهر في الفوتر وصفحة المنتج وصفحة الإفصاح">
            <textarea className={`${inputCls} min-h-24`} value={s.disclosure} onChange={set("disclosure")} />
          </Field>
        </div>

        <div className={sec}>
          <h2 className={h2}><Icon name="search" className="w-4.5 h-4.5 text-primary" /> SEO الافتراضي</h2>
          <div className="space-y-4">
            <Field label="Default Meta Title"><input className={inputCls} value={s.defaultMetaTitle} onChange={set("defaultMetaTitle")} /></Field>
            <Field label="Default Meta Description"><textarea className={`${inputCls} min-h-20`} value={s.defaultMetaDescription} onChange={set("defaultMetaDescription")} /></Field>
          </div>
        </div>

        <div className={sec}>
          <h2 className={h2}><Icon name="chart" className="w-4.5 h-4.5 text-primary" /> التتبع والتحليلات</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Google Analytics 4 ID" hint="مثال: G-XXXXXXX — يُحقن تلقائيًا عند الحفظ"><input className={inputCls} dir="ltr" placeholder="G-XXXXXXXXXX" value={s.gaId} onChange={set("gaId")} /></Field>
            <Field label="Google Search Console Verification"><input className={inputCls} dir="ltr" value={s.gscVerification} onChange={set("gscVerification")} /></Field>
          </div>
          <div className="mt-4">
            <Field label="Facebook Pixel ID (اختياري)"><input className={inputCls} dir="ltr" value={s.fbPixel} onChange={set("fbPixel")} /></Field>
          </div>
        </div>

        <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 font-display font-bold text-bg transition-all hover:bg-primary-dark active:scale-95">
          <Icon name="check" className="w-4.5 h-4.5" />
          حفظ الإعدادات
        </button>
      </form>

      <form onSubmit={changePw} className={`${sec} mt-4`}>
        <h2 className={h2}><Icon name="lock" className="w-4.5 h-4.5 text-primary" /> تغيير كلمة مرور المدير</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="كلمة المرور الجديدة" required><input type="password" className={inputCls} value={pw.p1} onChange={(e) => setPw({ ...pw, p1: e.target.value })} /></Field>
          <Field label="تأكيد كلمة المرور" required><input type="password" className={inputCls} value={pw.p2} onChange={(e) => setPw({ ...pw, p2: e.target.value })} /></Field>
        </div>
        <button type="submit" className="mt-4 rounded-lg bg-night px-5 py-2.5 text-sm font-black text-bg hover:bg-night2 transition-colors">تحديث كلمة المرور</button>
      </form>

      <div className={`${sec} mt-4 border-flash/25`}>
        <h2 className={h2}><Icon name="alert" className="w-4.5 h-4.5 text-flash" /> منطقة الخطر</h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-black text-ink2 hover:border-primary hover:text-primary transition-colors">
            <Icon name="download" className="w-4 h-4" />
            تصدير نسخة احتياطية (JSON)
          </button>
          <button onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-2 rounded-lg bg-flash-soft px-4 py-2.5 text-sm font-black text-flash hover:bg-flash hover:text-bg transition-colors">
            <Icon name="refresh" className="w-4 h-4" />
            إعادة تعيين البيانات التجريبية
          </button>
        </div>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="إعادة تعيين البيانات">
        <p className="text-sm leading-7 text-ink2">
          سيتم حذف كل تعديلاتك (منتجات، متاجر، تصنيفات، نقرات، إعدادات) واستعادة البيانات التجريبية الأصلية. هذا الإجراء لا يمكن التراجع عنه.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => { db.resetDB(); setS(db.getSettings()); setConfirmReset(false); toast("تمت إعادة تعيين البيانات التجريبية", "info"); }}
            className="flex-1 rounded-lg bg-flash py-2.5 text-sm font-black text-bg hover:opacity-90 transition-opacity"
          >
            نعم، أعد التعيين
          </button>
          <button onClick={() => setConfirmReset(false)} className="flex-1 rounded-lg border border-line py-2.5 text-sm font-black text-ink2 hover:bg-bg transition-colors">تراجع</button>
        </div>
      </Modal>
    </div>
  );
}
