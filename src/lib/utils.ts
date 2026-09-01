import { useEffect, useRef, useState } from "react";
import type { Filters, Product, Settings, SortKey } from "./types";

export const SITE_URL =
  (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SITE_URL ||
  "https://wafferly.sa";

/* ---------------- formatting ---------------- */

export function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function fmtCompact(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function price(n: number): string {
  return `${fmt(n)} ر.س`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "الآن";
  if (mins < 60) return `قبل ${mins} دقيقة`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `قبل ${hours} ساعة`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `قبل ${days} يوم`;
  return new Date(iso).toLocaleDateString("ar-SA");
}

export function daysFromNowIso(days: number, hour = 21): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9 + (days % 9), 15, 0, 0);
  return d.toISOString();
}

/* ---------------- product helpers ---------------- */

export function discountOf(p: Product): number | null {
  if (p.oldPrice && p.oldPrice > p.price)
    return Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
  return p.discountPercentage;
}

export function isExpired(p: Product): boolean {
  return !!p.expiryDate && new Date(p.expiryDate).getTime() < Date.now();
}

export function dealLive(p: Product): boolean {
  return p.status === "active" && !isExpired(p);
}

export function saveAmount(p: Product): number {
  return p.oldPrice ? Math.max(0, p.oldPrice - p.price) : 0;
}

export function applyFilters(products: Product[], f: Filters): Product[] {
  let list = products.filter((p) => p.status === "active");
  if (!f.showExpired) list = list.filter((p) => !isExpired(p));
  if (f.storeIds.length) list = list.filter((p) => f.storeIds.includes(p.storeId));
  if (f.categoryId) list = list.filter((p) => p.categoryId === f.categoryId);
  const min = parseFloat(f.minPrice);
  const max = parseFloat(f.maxPrice);
  if (!isNaN(min)) list = list.filter((p) => p.price >= min);
  if (!isNaN(max)) list = list.filter((p) => p.price <= max);
  if (f.minDiscount > 0)
    list = list.filter((p) => (discountOf(p) || 0) >= f.minDiscount);

  const sorted = [...list];
  const bySort: Record<SortKey, (a: Product, b: Product) => number> = {
    latest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    discount: (a, b) => (discountOf(b) || 0) - (discountOf(a) || 0),
    views: (a, b) => b.views - a.views,
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
  };
  sorted.sort(bySort[f.sort]);
  return sorted;
}

export const SORT_LABELS: Record<SortKey, string> = {
  latest: "الأحدث",
  discount: "الأعلى خصمًا",
  views: "الأكثر مشاهدة",
  priceAsc: "السعر: من الأقل",
  priceDesc: "السعر: من الأعلى",
};

/* ---------------- misc ---------------- */

export function slugify(s: string): string {
  const latin = s
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return latin || `item-${Date.now().toString(36)}`;
}

export function hashStr(str: string): string {
  let h1 = 0xdeadbeef ^ 7, h2 = 0x41c6ce57 ^ 7;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

export function deviceOf(ua: string): "mobile" | "desktop" | "tablet" {
  if (/tablet|ipad/i.test(ua)) return "tablet";
  if (/mobile|iphone|android.*mobile|samsung/i.test(ua)) return "mobile";
  return "desktop";
}

export function describeUA(ua: string): string {
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /opr\//i.test(ua)
      ? "Opera"
      : /chrome|crios/i.test(ua)
        ? "Chrome"
        : /safari/i.test(ua)
          ? "Safari"
          : /firefox/i.test(ua)
            ? "Firefox"
            : "متصفح";
  const os = /windows/i.test(ua)
    ? "Windows"
    : /iphone|ipad|ios/i.test(ua)
      ? "iOS"
      : /android/i.test(ua)
        ? "Android"
        : /mac os/i.test(ua)
          ? "macOS"
          : "نظام آخر";
  return `${browser} · ${os}`;
}

/* ---------------- favorites (local storage) ---------------- */

const FAV_KEY = "wafferly.favs";
const FAV_EVENT = "wafferly:favs";

export function readFavs(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAV_KEY) || "[]") as string[];
  } catch {
    return [];
  }
}

export function toggleFav(slug: string) {
  const favs = readFavs();
  const next = favs.includes(slug) ? favs.filter((s) => s !== slug) : [...favs, slug];
  localStorage.setItem(FAV_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(FAV_EVENT));
  return next.includes(slug);
}

export function useFavorites(): [string[], (slug: string) => boolean] {
  const [favs, setFavs] = useState<string[]>(readFavs);
  useEffect(() => {
    const onChange = () => setFavs(readFavs());
    window.addEventListener(FAV_EVENT, onChange);
    return () => window.removeEventListener(FAV_EVENT, onChange);
  }, []);
  return [favs, toggleFav];
}

/* ---------------- toasts ---------------- */

export interface ToastMsg {
  id: number;
  text: string;
  type: "success" | "info" | "error";
}

export function toast(text: string, type: ToastMsg["type"] = "success") {
  window.dispatchEvent(new CustomEvent("wafferly:toast", { detail: { text, type } }));
}

/* ---------------- animated counter ---------------- */

export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const frame = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return value;
}

/* ---------------- SEO ---------------- */

interface SeoOpts {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "product" | "article";
  jsonLd?: object | object[];
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function applySeo(opts: SeoOpts) {
  document.title = opts.title;
  upsertMeta("name", "description", opts.description);
  const url = `${SITE_URL}${opts.path}`;

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;

  upsertMeta("property", "og:title", opts.title);
  upsertMeta("property", "og:description", opts.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:type", opts.type || "website");
  if (opts.image) upsertMeta("property", "og:image", opts.image);
  upsertMeta("name", "twitter:title", opts.title);
  upsertMeta("name", "twitter:description", opts.description);
  if (opts.image) upsertMeta("name", "twitter:image", opts.image);

  let script = document.getElementById("seo-jsonld") as HTMLScriptElement | null;
  if (opts.jsonLd) {
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "seo-jsonld";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(opts.jsonLd);
  } else if (script) {
    script.remove();
  }
}

export function useSeo(opts: SeoOpts, deps: unknown[] = []) {
  useEffect(() => {
    applySeo(opts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function applyAnalytics(s: Settings) {
  if (s.gscVerification) upsertMeta("name", "google-site-verification", s.gscVerification);
  if (s.gaId && !document.getElementById("ga-gtag")) {
    const script = document.createElement("script");
    script.id = "ga-gtag";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(s.gaId)}`;
    document.head.appendChild(script);
    const inline = document.createElement("script");
    inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${s.gaId.replace(/'/g, "")}');`;
    document.head.appendChild(inline);
  }
  if (s.fbPixel && !document.getElementById("fb-pixel")) {
    const script = document.createElement("script");
    script.id = "fb-pixel";
    script.textContent = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${s.fbPixel.replace(/'/g, "")}');fbq('track','PageView');`;
    document.head.appendChild(script);
  }
}

export function organizationJsonLd(s: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.siteName,
    url: SITE_URL,
    email: s.email,
    description: s.tagline,
    sameAs: [s.twitter, s.instagram].filter(Boolean),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}
