import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { ProductBadge, Store } from "../lib/types";
import { BADGE_LABELS } from "../lib/types";
import type { ToastMsg } from "../lib/utils";
import { toast as pushToast } from "../lib/utils";

/* ================= icons (hand-drawn inline SVG) ================= */

const paths: Record<string, ReactNode> = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>),
  menu: (<><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h10" /></>),
  x: (<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
  heart: (<path d="M19 14c1.5-1.5 2.3-3.2 2.3-5A5.3 5.3 0 0 0 16 3.7c-1.6 0-3 .7-4 1.9-1-1.2-2.4-1.9-4-1.9A5.3 5.3 0 0 0 2.7 9c0 1.8.8 3.5 2.3 5l7 6.9z" />),
  star: (<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />),
  arrow: (<><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>),
  external: (<><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14 21 3" /></>),
  tag: (<><path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" /><circle cx="7.5" cy="7.5" r="0.6" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  eye: (<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>),
  bag: (<><path d="M6 2 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-5z" /><path d="M3 7h18" /><path d="M16 11a4 4 0 0 1-8 0" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  chevronDown: (<path d="m6 9 6 6 6-6" />),
  chevronLeft: (<path d="m15 18-6-6 6-6" />),
  filter: (<path d="M22 4H2l8 9.2V19l4 3v-8.8z" />),
  check: (<path d="M20 6 9 17l-5-5" />),
  plus: (<><path d="M12 5v14" /><path d="M5 12h14" /></>),
  pencil: (<><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" /></>),
  trash: (<><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M10 11v6" /><path d="M14 11v6" /></>),
  gear: (<><circle cx="12" cy="12" r="3.2" /><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.2 5.2l1.7 1.7M17.1 17.1l1.7 1.7M18.8 5.2l-1.7 1.7M6.9 17.1l-1.7 1.7" /></>),
  logout: (<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></>),
  chart: (<><path d="M3 3v18h18" /><rect x="7" y="12" width="3" height="6" rx="0.5" /><rect x="12" y="7" width="3" height="11" rx="0.5" /><rect x="17" y="10" width="3" height="8" rx="0.5" /></>),
  cursor: (<path d="m4 4 7.1 17 2.5-7.4L21 11.1z" />),
  home: (<><path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h6v10" /></>),
  shield: (<><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></>),
  mail: (<><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" /></>),
  send: (<><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>),
  alert: (<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>),
  box: (<><path d="M21 8 12 3 3 8v8l9 5 9-5z" /><path d="m3 8 9 5 9-5" /><path d="M12 13v8" /></>),
  download: (<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></>),
  refresh: (<><path d="M3 12a9 9 0 0 1 15.5-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.5 6.4L3 16" /><path d="M3 21v-5h5" /></>),
  lock: (<><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6" /></>),
  calendar: (<><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>),
  link: (<><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>),
  flame: (<path d="M12 2s-6.5 6.6-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 8.6 12 2 12 2z" />),
  zap: (<path d="M13 2 3 14h9l-1 8 10-12h-9z" />),
  copy: (<><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>),
  image: (<><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-4.6-4.6a1.4 1.4 0 0 0-2 0L5 20" /></>),
  whatsapp: (<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.5.7.7-2.4-.2-.3A8 8 0 0 1 12 4zm-3.1 4.1c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.2s.9 2.6 1.1 2.8c.1.2 1.9 3 4.6 4.1 2.3 1 2.7.8 3.2.7.5 0 1.6-.6 1.8-1.3.2-.6.2-1.2.2-1.3-.1-.1-.2-.2-.5-.3l-1.7-.8c-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.6-.7c.1-.2.1-.4 0-.6L10.6 8.6c-.2-.4-.4-.5-.6-.5h-1.1z" fill="currentColor" stroke="none" />),
  xtwitter: (<path d="M18.2 2.3h3.3l-7.2 8.3 8.5 11.1h-6.7l-5.2-6.8-6 6.8H1.7l7.7-8.8L1.3 2.3h6.8l4.7 6.2 5.4-6.2zm-1.2 17.5h1.9L6.9 4.1H4.9l12.1 15.7z" fill="currentColor" stroke="none" />),
  telegram: (<path d="M21.9 4.4 18.7 19.5c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.3 2.3c-.3.3-.5.5-.9.5l.3-4.9 9-8.1c.4-.4-.1-.6-.6-.2L6.3 13.5l-4.8-1.5c-1-.3-1-1 .2-1.5L20.5 2.9c.9-.3 1.6.2 1.4 1.5z" fill="currentColor" stroke="none" />),
  instagram: (<><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.2 6.8h.01" /></>),
  phone: (<><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M11 18h2" /></>),
  chip: (<><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="10" y="10" width="4" height="4" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></>),
  laptop: (<><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9" /><path d="M2.5 16h19l1 2.6a1 1 0 0 1-.9 1.4H2.4a1 1 0 0 1-.9-1.4z" /></>),
  washer: (<><rect x="4" y="2" width="16" height="20" rx="2.5" /><circle cx="12" cy="13" r="4.5" /><circle cx="12" cy="13" r="1.6" /><path d="M7.5 5.5h.01M11 5.5h3" /></>),
  pot: (<><path d="M4 10h16v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" /><path d="M2 10h20" /><path d="M9 2c0 1.5 1.5 1.5 1.5 3M13.5 2c0 1.5 1.5 1.5 1.5 3" /></>),
  shirt: (<path d="M20.4 3.5 16 2a4 4 0 0 1-8 0L3.6 3.5a2 2 0 0 0-1.3 2.2l.6 3.5a1 1 0 0 0 1 .8H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.1a1 1 0 0 0 1-.8l.6-3.5a2 2 0 0 0-1.3-2.2z" />),
  perfume: (<><rect x="7.5" y="9" width="9" height="12" rx="2.5" /><path d="M10 9V6h4v3" /><path d="M9 3h6" /><path d="M12 13v3" /></>),
  sparkle: (<path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />),
  gamepad: (<><rect x="2.5" y="7" width="19" height="11" rx="5.5" /><path d="M7 10.5v4M5 12.5h4" /><path d="M15.5 11h.01M18 13.5h.01" /></>),
  toy: (<><circle cx="12" cy="12" r="9" /><path d="M3.4 8.5c2.8 2.2 14.4 2.2 17.2 0M3.4 15.5c2.8-2.2 14.4-2.2 17.2 0" /></>),
  car: (<><path d="m5 11 1.6-4.6A2 2 0 0 1 8.5 5h7a2 2 0 0 1 1.9 1.4L19 11" /><rect x="3" y="11" width="18" height="6" rx="2" /><circle cx="7.5" cy="17.5" r="1.8" /><circle cx="16.5" cy="17.5" r="1.8" /></>),
  dumbbell: (<><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1M3 3l1 1" /><path d="m18 22 4-4M2 6l4-4" /><path d="m3 10 7-7M14 21l7-7" /></>),
  watch: (<><circle cx="12" cy="12" r="6" /><path d="M12 9.5V12l1.6 1.6" /><path d="m16.1 7.7-.8-4.1a2 2 0 0 0-2-1.6h-2.6a2 2 0 0 0-2 1.6l-.8 4.1M7.9 16.3l.8 4.1a2 2 0 0 0 2 1.6h2.6a2 2 0 0 0 2-1.6l.8-4.1" /></>),
  gem: (<><path d="M6 3h12l4 6-10 13L2 9z" /><path d="M11 3 8 9l4 13 4-13-3-6" /><path d="M2 9h20" /></>),
};

export function Icon({
  name,
  className = "w-5 h-5",
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.box}
    </svg>
  );
}

/* ================= toaster ================= */

let toastId = 0;

export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    const onToast = (e: Event) => {
      const { text, type } = (e as CustomEvent).detail as Omit<ToastMsg, "id">;
      const id = ++toastId;
      setItems((prev) => [...prev.slice(-3), { id, text, type }]);
      setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3200);
    };
    window.addEventListener("wafferly:toast", onToast);
    return () => window.removeEventListener("wafferly:toast", onToast);
  }, []);
  return (
    <div className="fixed bottom-5 start-5 z-[90] flex flex-col gap-2 max-w-[calc(100vw-2.5rem)]">
      {items.map((t) => (
        <div
          key={t.id}
          className={`toast-in flex items-center gap-2.5 rounded-lg px-4 py-3 text-sm font-bold shadow-lift border ${
            t.type === "success"
              ? "bg-night text-bg border-night3"
              : t.type === "error"
                ? "bg-flash text-bg border-flash"
                : "bg-card text-ink border-line"
          }`}
        >
          <span className={t.type === "error" ? "text-bg" : "text-accent"}>
            <Icon name={t.type === "error" ? "alert" : "check"} className="w-4.5 h-4.5" />
          </span>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export { pushToast as toast };

/* ================= smart image with skeleton ================= */

export function SmartImage({
  src,
  alt,
  className = "",
  imgClass = "",
  eager = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClass?: string;
  eager?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 shimmer" />}
      <img
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-all duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${imgClass}`}
      />
    </div>
  );
}

/* ================= store logo ================= */

function luminance(hex: string): number {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function StoreLogo({
  store,
  size = "md",
}: {
  store: Store;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const cls = {
    sm: "w-6 h-6 text-[11px] rounded-md",
    md: "w-8 h-8 text-sm rounded-lg",
    lg: "w-12 h-12 text-xl rounded-xl",
    xl: "w-16 h-16 text-2xl rounded-2xl",
  }[size];
  const light = luminance(store.logoColor) > 0.6;
  return (
    <span
      className={`${cls} inline-flex items-center justify-center font-display font-bold shrink-0 shadow-soft`}
      style={{ backgroundColor: store.logoColor, color: light ? "#13221b" : "#fbfbf7" }}
      aria-hidden="true"
    >
      {store.logoLetter}
    </span>
  );
}

/* ================= badges & ratings ================= */

const badgeStyles: Record<Exclude<ProductBadge, "">, string> = {
  special: "bg-accent text-ink",
  hot: "bg-flash text-bg",
  best: "bg-primary text-bg",
  pick: "bg-night text-accent",
};

export function BadgePill({ badge }: { badge: ProductBadge }) {
  if (!badge) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold ${badgeStyles[badge]}`}
    >
      <Icon name={badge === "hot" ? "flame" : badge === "best" ? "zap" : badge === "pick" ? "check" : "star"} className="w-3 h-3" filled />
      {BADGE_LABELS[badge]}
    </span>
  );
}

export function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1 text-accent-dark" title={`التقييم ${rating} من 5`}>
      <span className="inline-flex" dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => (
          <Icon key={i} name="star" className={`w-3.5 h-3.5 ${i <= full ? "" : "opacity-25"}`} filled />
        ))}
      </span>
      <span className="text-xs font-bold text-muted">{rating.toFixed(1)}</span>
    </span>
  );
}

/* ================= scroll reveal ================= */

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("is-in");
            obs.disconnect();
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ================= section header ================= */

export function SectionHead({
  icon,
  title,
  subtitle,
  to,
  toLabel = "عرض الكل",
  dark = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  to?: string;
  toLabel?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2.5">
          <span className={`inline-flex w-9 h-9 items-center justify-center rounded-lg ${dark ? "bg-night3 text-accent" : "bg-primary-soft text-primary"}`}>
            <Icon name={icon} className="w-4.5 h-4.5" />
          </span>
          <h2 className={`font-display font-bold text-xl sm:text-2xl ${dark ? "text-bg" : "text-ink"}`}>{title}</h2>
        </div>
        {subtitle && <p className={`mt-1.5 text-sm ${dark ? "text-bg/60" : "text-muted"}`}>{subtitle}</p>}
      </div>
      {to && (
        <Link
          to={to}
          className={`group hidden sm:inline-flex items-center gap-1.5 text-sm font-bold whitespace-nowrap ${dark ? "text-accent hover:text-bg" : "text-primary hover:text-primary-dark"} transition-colors`}
        >
          {toLabel}
          <Icon name="chevronLeft" className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

/* ================= modal ================= */

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-night/60 backdrop-blur-[2px] cursor-default" onClick={onClose} aria-label="إغلاق" />
      <div className={`relative w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto rounded-xl bg-card border border-line shadow-lift toast-in`}>
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-line bg-card z-10">
          <h3 className="font-display font-bold text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg text-muted hover:text-ink transition-colors" aria-label="إغلاق">
            <Icon name="x" className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ================= form primitives ================= */

export const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink placeholder:text-muted/70 outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15";

export function Field({
  label,
  error,
  children,
  hint,
  required,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-[13px] font-bold text-ink2">
        {label}
        {required && <span className="text-flash">*</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-bold text-flash">{error}</span>}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 group"
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${checked ? "bg-primary" : "bg-line2"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${checked ? "start-[22px]" : "start-0.5"}`}
        />
      </span>
      {label && <span className="text-sm font-bold text-ink2 group-hover:text-ink">{label}</span>}
    </button>
  );
}

/* ================= empty state ================= */

export function EmptyState({
  icon = "box",
  title,
  desc,
  action,
}: {
  icon?: string;
  title: string;
  desc?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line2 bg-surface/60 px-6 py-16 text-center">
      <span className="mb-4 inline-flex w-14 h-14 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon name={icon} className="w-6 h-6" />
      </span>
      <h3 className="font-display font-bold text-lg text-ink">{title}</h3>
      {desc && <p className="mt-1.5 max-w-sm text-sm text-muted">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ================= breadcrumbs ================= */

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-[13px] font-medium text-muted flex-wrap">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <Icon name="chevronLeft" className="w-3.5 h-3.5 text-line2" />}
          {it.to ? (
            <Link to={it.to} className="hover:text-primary transition-colors">
              {it.label}
            </Link>
          ) : (
            <span className="text-ink font-bold">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
