import { buildSeedDB } from "./data";
import type {
  AffiliateClick,
  Category,
  DBShape,
  Product,
  Settings,
  Store,
} from "./types";
import { deviceOf, hashStr } from "./utils";

/**
 * طبقة البيانات – Data Service Layer
 * -----------------------------------
 * تعمل حاليًا على LocalStorage بهيكل مطابق تمامًا لمخطط PostgreSQL/Prisma
 * (stores / categories / products / product_images / affiliate_clicks / settings)
 * بحيث يمكن استبدال الدوال هنا بنداءات Supabase أو Prisma دون تغيير الواجهات.
 */

const DB_KEY = "wafferly.db.v1";
const SESSION_KEY = "wafferly.session";
const SALT = "wfr-salt";

let cache: DBShape | null = null;

function load(): DBShape {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as DBShape;
      if (parsed && parsed.version === 1 && Array.isArray(parsed.products)) {
        cache = parsed;
        return cache;
      }
    }
  } catch {
    /* corrupted -> reseed */
  }
  cache = buildSeedDB();
  persist();
  return cache;
}

function persist() {
  if (cache) localStorage.setItem(DB_KEY, JSON.stringify(cache));
}

function nextId<T extends { id: number }>(arr: T[]): number {
  return arr.reduce((m, x) => Math.max(m, x.id), 0) + 1;
}

/* ================= stores ================= */

export function getStores(includeInactive = false): Store[] {
  const stores = load().stores;
  return includeInactive ? [...stores] : stores.filter((s) => s.status === "active");
}

export function getStoreById(id: number): Store | undefined {
  return load().stores.find((s) => s.id === id);
}

export function getStoreBySlug(slug: string): Store | undefined {
  return load().stores.find((s) => s.slug === slug);
}

export function saveStore(data: Omit<Store, "id" | "createdAt" | "updatedAt">, id?: number): Store {
  const db = load();
  const now = new Date().toISOString();
  if (id) {
    const idx = db.stores.findIndex((s) => s.id === id);
    const updated: Store = { ...db.stores[idx], ...data, updatedAt: now };
    db.stores[idx] = updated;
    persist();
    return updated;
  }
  const store: Store = { ...data, id: nextId(db.stores), createdAt: now, updatedAt: now };
  db.stores.push(store);
  persist();
  return store;
}

export function deleteStore(id: number) {
  const db = load();
  db.stores = db.stores.filter((s) => s.id !== id);
  persist();
}

/* ================= categories ================= */

export function getCategories(): Category[] {
  return [...load().categories];
}

export function getCategoryById(id: number): Category | undefined {
  return load().categories.find((c) => c.id === id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return load().categories.find((c) => c.slug === slug);
}

export function saveCategory(data: Omit<Category, "id" | "createdAt" | "updatedAt">, id?: number): Category {
  const db = load();
  const now = new Date().toISOString();
  if (id) {
    const idx = db.categories.findIndex((c) => c.id === id);
    const updated: Category = { ...db.categories[idx], ...data, updatedAt: now };
    db.categories[idx] = updated;
    persist();
    return updated;
  }
  const cat: Category = { ...data, id: nextId(db.categories), createdAt: now, updatedAt: now };
  db.categories.push(cat);
  persist();
  return cat;
}

export function deleteCategory(id: number) {
  const db = load();
  db.categories = db.categories.filter((c) => c.id !== id);
  persist();
}

/* ================= products ================= */

export function getProducts(includeInactive = false): Product[] {
  const list = load().products;
  return includeInactive ? [...list] : list.filter((p) => p.status === "active");
}

export function getProductBySlug(slug: string): Product | undefined {
  return load().products.find((p) => p.slug === slug);
}

export function getProductById(id: number): Product | undefined {
  return load().products.find((p) => p.id === id);
}

export function slugExists(slug: string, exceptId?: number): boolean {
  return load().products.some((p) => p.slug === slug && p.id !== exceptId);
}

export function saveProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt" | "views" | "discountPercentage">,
  id?: number
): Product {
  const db = load();
  const now = new Date().toISOString();
  const discount =
    data.oldPrice && data.oldPrice > data.price
      ? Math.round(((data.oldPrice - data.price) / data.oldPrice) * 100)
      : null;
  if (id) {
    const idx = db.products.findIndex((p) => p.id === id);
    const updated: Product = {
      ...db.products[idx],
      ...data,
      discountPercentage: discount,
      updatedAt: now,
    };
    db.products[idx] = updated;
    persist();
    return updated;
  }
  const product: Product = {
    ...data,
    discountPercentage: discount,
    id: nextId(db.products),
    views: 0,
    createdAt: now,
    updatedAt: now,
  };
  db.products.unshift(product);
  persist();
  return product;
}

export function deleteProduct(id: number) {
  const db = load();
  db.products = db.products.filter((p) => p.id !== id);
  persist();
}

export function toggleProductStatus(id: number): Product {
  const db = load();
  const p = db.products.find((x) => x.id === id)!;
  p.status = p.status === "active" ? "inactive" : "active";
  p.updatedAt = new Date().toISOString();
  persist();
  return { ...p };
}

export function toggleFeatured(id: number): Product {
  const db = load();
  const p = db.products.find((x) => x.id === id)!;
  p.featured = !p.featured;
  p.updatedAt = new Date().toISOString();
  persist();
  return { ...p };
}

export function recordView(id: number) {
  const db = load();
  const p = db.products.find((x) => x.id === id);
  if (p) {
    p.views += 1;
    persist();
  }
}

/* ================= affiliate clicks ================= */

export function recordClick(productId: number): AffiliateClick | null {
  const db = load();
  const p = db.products.find((x) => x.id === productId);
  if (!p) return null;
  const ua = navigator.userAgent;
  const click: AffiliateClick = {
    id: nextId(db.clicks),
    productId: p.id,
    storeId: p.storeId,
    ipHash: hashStr(`${ua}-${Date.now()}-${Math.random()}`),
    userAgent: ua,
    referrer: document.referrer ? new URL(document.referrer).origin : "direct",
    device: deviceOf(ua),
    createdAt: new Date().toISOString(),
  };
  db.clicks.unshift(click);
  p.views += 1;
  persist();
  return click;
}

export function getClicks(): AffiliateClick[] {
  return [...load().clicks];
}

export interface Stats {
  totalClicks: number;
  todayClicks: number;
  weekClicks: number;
  totalViews: number;
  productsCount: number;
  storesCount: number;
  categoriesCount: number;
  clicksByDay: { label: string; count: number }[];
  topProducts: { product: Product; count: number }[];
  topStores: { store: Store; count: number }[];
  latestProducts: Product[];
}

export function getStats(): Stats {
  const db = load();
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = dayStart - 6 * 86400000;

  const todayClicks = db.clicks.filter((c) => new Date(c.createdAt).getTime() >= dayStart).length;
  const weekClicks = db.clicks.filter((c) => new Date(c.createdAt).getTime() >= weekStart).length;

  const byDay: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const end = start + 86400000;
    byDay.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      count: db.clicks.filter((c) => {
        const t = new Date(c.createdAt).getTime();
        return t >= start && t < end;
      }).length,
    });
  }

  const perProduct = new Map<number, number>();
  const perStore = new Map<number, number>();
  db.clicks.forEach((c) => {
    perProduct.set(c.productId, (perProduct.get(c.productId) || 0) + 1);
    perStore.set(c.storeId, (perStore.get(c.storeId) || 0) + 1);
  });

  const topProducts = [...perProduct.entries()]
    .map(([pid, count]) => ({ product: db.products.find((p) => p.id === pid)!, count }))
    .filter((x) => x.product)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const topStores = [...perStore.entries()]
    .map(([sid, count]) => ({ store: db.stores.find((s) => s.id === sid)!, count }))
    .filter((x) => x.store)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return {
    totalClicks: db.clicks.length,
    todayClicks,
    weekClicks,
    totalViews: db.products.reduce((s, p) => s + p.views, 0),
    productsCount: db.products.length,
    storesCount: db.stores.length,
    categoriesCount: db.categories.length,
    clicksByDay: byDay,
    topProducts,
    topStores,
    latestProducts: [...db.products]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
  };
}

/* ================= settings ================= */

export function getSettings(): Settings {
  return { ...load().settings };
}

export function saveSettings(patch: Partial<Settings>) {
  const db = load();
  db.settings = { ...db.settings, ...patch };
  persist();
}

/* ================= auth ================= */

export function login(user: string, password: string): boolean {
  const s = load().settings;
  const ok = user.trim() === s.adminUser && hashStr(`${password}::${SALT}`) === s.adminHash;
  if (ok) {
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ u: user, exp: Date.now() + 12 * 60 * 60 * 1000 })
    );
  }
  return ok;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function isAuthed(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw) as { u: string; exp: number };
    if (s.exp < Date.now()) {
      localStorage.removeItem(SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function changePassword(newPassword: string) {
  saveSettings({ adminHash: hashStr(`${newPassword}::${SALT}`) });
}

/* ================= maintenance ================= */

export function resetDB() {
  cache = buildSeedDB();
  persist();
}

export function exportJSON(): string {
  return JSON.stringify(load(), null, 2);
}
