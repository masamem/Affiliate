import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getCategories, getProducts, getSettings, getStores } from "../lib/db";
import { useFavorites } from "../lib/utils";
import { Icon, SmartImage, StoreLogo } from "./ui";

const NAV = [
  { to: "/", label: "الرئيسية", end: true },
  { to: "/deals", label: "العروض" },
  { to: "/stores", label: "المتاجر" },
  { to: "/categories", label: "التصنيفات" },
  { to: "/best", label: "أفضل الاختيارات" },
];

function Wordmark({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex w-10 h-10 items-center justify-center rounded-xl bg-primary text-bg shadow-soft transition-transform group-hover:scale-105">
        <Icon name="tag" className="w-5 h-5" />
        <span className="absolute -top-1 -start-1 w-3 h-3 rounded-full bg-accent border-2 border-bg" />
      </span>
      <span className="leading-none">
        <span className={`block font-display font-black text-xl ${light ? "text-bg" : "text-ink"}`}>وفرلي</span>
        <span className={`block text-[10px] font-bold tracking-[0.22em] ${light ? "text-bg/50" : "text-muted"}`}>WAFFERLY</span>
      </span>
    </Link>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const [favs] = useFavorites();
  const settings = getSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return null;
    const products = getProducts()
      .filter((p) => p.name.toLowerCase().includes(query))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    const stores = getStores().filter((s) => s.name.toLowerCase().includes(query) || s.slug.includes(query)).slice(0, 3);
    const categories = getCategories().filter((c) => c.name.includes(q.trim()) || c.slug.includes(query)).slice(0, 3);
    return { products, stores, categories, empty: !products.length && !stores.length && !categories.length };
  }, [q]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setFocused(false);
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  const goSuggestion = (to: string) => {
    setFocused(false);
    setSearchOpen(false);
    setQ("");
    navigate(to);
  };

  const searchBox = (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={submit} role="search">
        <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15">
          <Icon name="search" className="w-4.5 h-4.5 text-muted shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder="ابحث عن منتج، متجر أو تصنيف…"
            className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-muted/70"
            aria-label="البحث في العروض"
          />
          <button
            type="submit"
            className="hidden sm:inline-flex shrink-0 items-center rounded-lg bg-primary px-3.5 py-1.5 text-xs font-bold text-bg transition-colors hover:bg-primary-dark active:scale-95"
          >
            بحث
          </button>
        </div>
      </form>

      {focused && suggestions && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-line bg-card shadow-lift toast-in">
          {suggestions.empty ? (
            <p className="px-4 py-5 text-center text-sm text-muted">لا نتائج مطابقة لـ «{q}» — جرّب كلمة أخرى</p>
          ) : (
            <div className="max-h-[70vh] overflow-y-auto">
              {suggestions.products.length > 0 && (
                <div className="p-2">
                  <p className="px-2.5 py-1.5 text-[11px] font-black text-muted">منتجات</p>
                  {suggestions.products.map((p) => (
                    <button key={p.id} onClick={() => goSuggestion(`/product/${p.slug}`)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start hover:bg-bg transition-colors">
                      <SmartImage src={p.image} alt={p.name} className="w-10 h-10 rounded-lg shrink-0" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink">{p.name}</span>
                        <span className="text-xs text-muted">{p.price.toLocaleString("en-US")} ر.س</span>
                      </span>
                      <Icon name="chevronLeft" className="w-4 h-4 text-muted" />
                    </button>
                  ))}
                </div>
              )}
              {suggestions.stores.length > 0 && (
                <div className="border-t border-line p-2">
                  <p className="px-2.5 py-1.5 text-[11px] font-black text-muted">متاجر</p>
                  {suggestions.stores.map((s) => (
                    <button key={s.id} onClick={() => goSuggestion(`/store/${s.slug}`)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start hover:bg-bg transition-colors">
                      <StoreLogo store={s} size="sm" />
                      <span className="text-sm font-bold text-ink">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {suggestions.categories.length > 0 && (
                <div className="border-t border-line p-2">
                  <p className="px-2.5 py-1.5 text-[11px] font-black text-muted">تصنيفات</p>
                  {suggestions.categories.map((c) => (
                    <button key={c.id} onClick={() => goSuggestion(`/category/${c.slug}`)} className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start hover:bg-bg transition-colors">
                      <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-primary-soft text-primary">
                        <Icon name={c.icon} className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-sm font-bold text-ink">{c.name}</span>
                    </button>
                  ))}
                </div>
              )}
              <button onClick={submit} className="flex w-full items-center justify-center gap-2 border-t border-line bg-bg/60 px-4 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary-soft">
                عرض كل النتائج لـ «{q}»
                <Icon name="chevronLeft" className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header className={`sticky top-0 z-40 transition-shadow ${scrolled ? "shadow-soft" : ""}`}>
        {/* top strip */}
        <div className="hidden md:block bg-night text-bg/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-[11.5px] font-medium">
            <Link to="/disclosure" className="flex min-w-0 items-center gap-1.5 hover:text-accent transition-colors">
              <Icon name="shield" className="w-3.5 h-3.5 shrink-0 text-accent" />
              <span className="truncate">{settings.disclosure}</span>
            </Link>
            <div className="flex shrink-0 items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                الأسعار تُحدَّث يوميًا — العملة: ريال سعودي
              </span>
              <a href={`mailto:${settings.email}`} className="hover:text-accent transition-colors">{settings.email}</a>
            </div>
          </div>
        </div>

        {/* main bar */}
        <div className="border-b border-line bg-card/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center gap-3 sm:gap-5 px-4 py-3">
            <Wordmark />
            <div className="hidden md:block flex-1 max-w-xl mx-auto">{searchBox}</div>
            <nav className="hidden lg:flex items-center gap-1 me-auto" aria-label="الرئيسي">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end as boolean | undefined}
                  className={({ isActive }) =>
                    `relative rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                      isActive ? "text-primary" : "text-ink2 hover:text-primary hover:bg-primary-soft/60"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {n.label}
                      {isActive && <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-accent" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="ms-auto lg:ms-0 flex items-center gap-1.5">
              <Link to="/favorites" className="relative hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-xl border border-line bg-surface text-ink2 transition-all hover:border-flash/40 hover:text-flash active:scale-95" aria-label="المفضلة">
                <Icon name="heart" className="w-4.5 h-4.5" />
                {favs.length > 0 && (
                  <span className="absolute -top-1.5 -start-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-flash px-1 text-[10px] font-black text-bg">
                    {favs.length}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="md:hidden inline-flex w-10 h-10 items-center justify-center rounded-xl border border-line bg-surface text-ink2 active:scale-95"
                aria-label="فتح البحث"
              >
                <Icon name="search" className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden inline-flex w-10 h-10 items-center justify-center rounded-xl bg-night text-bg active:scale-95"
                aria-label="فتح القائمة"
              >
                <Icon name="menu" className="w-5 h-5" />
              </button>
            </div>
          </div>
          {searchOpen && <div className="md:hidden border-t border-line px-4 py-3 bg-card">{searchBox}</div>}
        </div>
      </header>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[70] lg:hidden">
          <button className="absolute inset-0 bg-night/60" onClick={() => setMobileOpen(false)} aria-label="إغلاق القائمة" />
          <div className="absolute inset-y-0 start-0 w-[300px] max-w-[85vw] overflow-y-auto bg-card shadow-lift toast-in flex flex-col">
            <div className="flex items-center justify-between border-b border-line p-4">
              <Wordmark />
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-bg text-muted" aria-label="إغلاق">
                <Icon name="x" className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-3" aria-label="قائمة الجوال">
              {[...NAV, { to: "/favorites", label: "المفضلة" }, { to: "/deals", label: "أحدث العروض", end: false }].map((n, i, arr) => (
                <NavLink
                  key={n.to + i}
                  to={n.to}
                  end={n.end as boolean | undefined}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between rounded-lg px-3.5 py-3 text-[15px] font-bold transition-colors ${
                      isActive && n.label !== "أحدث العروض" ? "bg-primary-soft text-primary" : "text-ink2 hover:bg-bg"
                    } ${arr.length - 1 === i ? "text-flash" : ""}`
                  }
                >
                  {n.label}
                  <Icon name="chevronLeft" className="w-4 h-4 text-muted" />
                </NavLink>
              ))}
            </nav>
            <div className="mt-auto border-t border-line p-4">
              <p className="mb-2.5 text-[11px] font-black text-muted">تصفح حسب المتجر</p>
              <div className="flex flex-wrap gap-2">
                {getStores().slice(0, 6).map((s) => (
                  <Link key={s.id} to={`/store/${s.slug}`} onClick={() => setMobileOpen(false)} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-bold text-ink2 hover:border-primary/40 transition-colors">
                    <StoreLogo store={s} size="sm" />
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
