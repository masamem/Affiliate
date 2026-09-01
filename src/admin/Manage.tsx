import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Field, Icon, Modal, SmartImage, StoreLogo, Switch, inputCls, toast } from "../components/ui";
import * as db from "../lib/db";
import type { Category, Product, ProductBadge, Store } from "../lib/types";
import { describeUA, deviceOf, fmt, slugify, timeAgo } from "../lib/utils";

const btnPrimary = "inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-black text-bg transition-all hover:bg-primary-dark active:scale-95";
const btnGhost = "inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-black text-ink2 transition-colors hover:border-primary hover:text-primary";
const th = "px-3 py-3 text-start text-[11px] font-black text-muted whitespace-nowrap";
const td = "px-3 py-3 text-sm font-medium whitespace-nowrap";

function ConfirmDelete({ open, name, onClose, onConfirm }: { open: boolean; name: string; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="تأكيد الحذف">
      <p className="text-sm leading-7 text-ink2">
        هل أنت متأكد من حذف <strong className="text-flash">«{name}»</strong>؟ لا يمكن التراجع عن هذا الإجراء.
      </p>
      <div className="mt-5 flex gap-3">
        <button onClick={onConfirm} className="flex-1 rounded-lg bg-flash py-2.5 text-sm font-black text-bg hover:opacity-90">نعم، احذف</button>
        <button onClick={onClose} className="flex-1 rounded-lg border border-line py-2.5 text-sm font-black text-ink2 hover:bg-bg">تراجع</button>
      </div>
    </Modal>
  );
}

/* ================= products ================= */

interface PForm {
  name: string; slug: string; storeId: string; categoryId: string; price: string; oldPrice: string;
  image: string; images: string; badge: ProductBadge; featured: boolean; status: "active" | "inactive";
  expiryDate: string; affiliateUrl: string; shortDescription: string; description: string; features: string;
  keywords: string; metaTitle: string; metaDescription: string;
}

function toForm(p?: Product): PForm {
  return {
    name: p?.name || "",
    slug: p?.slug || "",
    storeId: p ? String(p.storeId) : "",
    categoryId: p ? String(p.categoryId) : "",
    price: p ? String(p.price) : "",
    oldPrice: p?.oldPrice ? String(p.oldPrice) : "",
    image: p?.image || "",
    images: p?.images.join("\n") || "",
    badge: p?.badge || "",
    featured: p?.featured || false,
    status: p?.status || "active",
    expiryDate: p?.expiryDate ? p.expiryDate.slice(0, 10) : "",
    affiliateUrl: p?.affiliateUrl || "https://example.com/affiliate?tag=wafferly-21&asins=",
    shortDescription: p?.shortDescription || "",
    description: p?.description || "",
    features: p?.features.join("\n") || "",
    keywords: p?.keywords || "",
    metaTitle: p?.metaTitle || "",
    metaDescription: p?.metaDescription || "",
  };
}

function ProductForm({ initial, onClose, onSaved }: { initial: Product | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<PForm>(() => toForm(initial || undefined));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const stores = db.getStores(true);
  const categories = db.getCategories();

  const set = (k: keyof PForm, v: string | boolean) => {
    setF((prev) => {
      const next = { ...prev, [k]: v };
      if (k === "name" && !slugTouched) next.slug = slugify(String(v));
      return next;
    });
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (f.name.trim().length < 3) errs.name = "اسم المنتج مطلوب (3 أحرف على الأقل)";
    if (!f.slug.trim()) errs.slug = "الـ slug مطلوب";
    else if (db.slugExists(f.slug.trim(), initial?.id)) errs.slug = "هذا الـ slug مستخدم لمنتج آخر";
    if (!f.storeId) errs.storeId = "اختر المتجر";
    if (!f.categoryId) errs.categoryId = "اختر التصنيف";
    const price = parseFloat(f.price);
    if (isNaN(price) || price <= 0) errs.price = "أدخل سعرًا صحيحًا";
    if (f.oldPrice) {
      const old = parseFloat(f.oldPrice);
      if (isNaN(old) || old <= price) errs.oldPrice = "السعر السابق يجب أن يكون أعلى من الحالي";
    }
    if (!f.image.trim()) errs.image = "رابط الصورة الرئيسية مطلوب";
    try {
      const u = new URL(f.affiliateUrl);
      if (!/^https?:$/.test(u.protocol)) errs.affiliateUrl = "الرابط يجب أن يبدأ بـ http(s)";
    } catch {
      errs.affiliateUrl = "رابط Affiliate غير صالح";
    }
    if (f.shortDescription.trim().length < 10) errs.shortDescription = "أضف وصفًا مختصرًا (10 أحرف على الأقل)";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("تحقق من الحقول المظللة بالأحمر", "error");
      return;
    }

    db.saveProduct(
      {
        name: f.name.trim(),
        slug: f.slug.trim(),
        description: f.description.trim(),
        shortDescription: f.shortDescription.trim(),
        image: f.image.trim(),
        images: f.images.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean),
        features: f.features.split("\n").map((x) => x.trim()).filter(Boolean),
        price,
        oldPrice: f.oldPrice ? parseFloat(f.oldPrice) : null,
        affiliateUrl: f.affiliateUrl.trim(),
        storeId: Number(f.storeId),
        categoryId: Number(f.categoryId),
        badge: f.badge,
        featured: f.featured,
        status: f.status,
        expiryDate: f.expiryDate ? new Date(`${f.expiryDate}T23:59:00`).toISOString() : null,
        metaTitle: f.metaTitle.trim(),
        metaDescription: f.metaDescription.trim(),
        keywords: f.keywords.trim(),
        rating: initial?.rating ?? 4.2,
      },
      initial?.id
    );
    toast(initial ? "تم تحديث المنتج" : "تمت إضافة المنتج بنجاح");
    onSaved();
  };

  const err = (k: string) => errors[k];

  return (
    <div className="fixed inset-0 z-[75] flex">
      <button className="absolute inset-0 bg-night/60 backdrop-blur-[2px] cursor-default" onClick={onClose} aria-label="إغلاق" />
      <div className="relative ms-auto h-full w-full max-w-2xl overflow-y-auto bg-card shadow-lift toast-in border-s border-line">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-card px-5 py-4">
          <h3 className="font-display text-lg font-black">{initial ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-bg text-muted" aria-label="إغلاق"><Icon name="x" className="w-5 h-5" /></button>
        </div>
        <form onSubmit={save} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="اسم المنتج" required error={err("name")}>
              <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="مثال: آيفون 16 برو – 256GB" />
            </Field>
            <Field label="Slug (رابط SEO)" required error={err("slug")} hint="يُستخدم في الرابط: /product/slug — أحرف لاتينية وشرطات">
              <input className={inputCls} dir="ltr" value={f.slug} onChange={(e) => { setSlugTouched(true); set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-")); }} />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="المتجر" required error={err("storeId")}>
              <select className={inputCls} value={f.storeId} onChange={(e) => set("storeId", e.target.value)}>
                <option value="">— اختر المتجر —</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </Field>
            <Field label="التصنيف" required error={err("categoryId")}>
              <select className={inputCls} value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                <option value="">— اختر التصنيف —</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="السعر الحالي (ر.س)" required error={err("price")}>
              <input className={inputCls} type="number" min="0" step="0.01" value={f.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field label="السعر السابق" error={err("oldPrice")}>
              <input className={inputCls} type="number" min="0" step="0.01" value={f.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} />
            </Field>
            <Field label="تاريخ انتهاء العرض" hint="اختياري — يعرض عدّادًا تنازليًا">
              <input className={inputCls} type="date" value={f.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} />
            </Field>
          </div>
          {f.price && f.oldPrice && parseFloat(f.oldPrice) > parseFloat(f.price) && (
            <p className="rounded-lg bg-flash-soft px-3 py-2 text-xs font-black text-flash">
              نسبة الخصم المحسوبة: {Math.round(((parseFloat(f.oldPrice) - parseFloat(f.price)) / parseFloat(f.oldPrice)) * 100)}%
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="رابط الصورة الرئيسية" required error={err("image")}>
              <input className={inputCls} dir="ltr" value={f.image} onChange={(e) => set("image", e.target.value)} placeholder="https://…" />
            </Field>
            <div>
              <span className="mb-1.5 block text-[13px] font-bold text-ink2">معاينة</span>
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-line2 bg-surface p-2">
                {f.image ? <SmartImage src={f.image} alt="معاينة" className="w-14 h-14 rounded-lg shrink-0" /> : <span className="flex w-14 h-14 items-center justify-center rounded-lg bg-bg text-muted"><Icon name="image" className="w-5 h-5" /></span>}
                <span className="text-[11px] text-muted">تُعرض الصورة مربعة في البطاقات</span>
              </div>
            </div>
          </div>

          <Field label="صور إضافية (رابط في كل سطر)" hint="تظهر كمعرض صور في صفحة المنتج">
            <textarea className={`${inputCls} min-h-16`} dir="ltr" value={f.images} onChange={(e) => set("images", e.target.value)} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="الشارة (Badge)">
              <select className={inputCls} value={f.badge} onChange={(e) => set("badge", e.target.value as ProductBadge)}>
                <option value="">بدون</option>
                <option value="special">عرض مميز</option>
                <option value="hot">خصم قوي</option>
                <option value="best">الأكثر مبيعًا</option>
                <option value="pick">اختيارنا</option>
              </select>
            </Field>
            <div className="rounded-lg border border-line bg-surface px-3.5 py-3">
              <Switch checked={f.featured} onChange={(v) => set("featured", v)} label="منتج مميز (يظهر في الرئيسية)" />
            </div>
            <div className="rounded-lg border border-line bg-surface px-3.5 py-3">
              <Switch checked={f.status === "active"} onChange={(v) => set("status", v ? "active" : "inactive")} label={f.status === "active" ? "نشط" : "معطل"} />
            </div>
          </div>

          <Field label="رابط Affiliate" required error={err("affiliateUrl")} hint="الرابط الطويل الذي سيُحوَّل إليه المستخدم عبر /go/slug — لا يظهر للزائر">
            <input className={inputCls} dir="ltr" value={f.affiliateUrl} onChange={(e) => set("affiliateUrl", e.target.value)} />
          </Field>

          <Field label="الوصف المختصر" required error={err("shortDescription")}>
            <textarea className={`${inputCls} min-h-16`} value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />
          </Field>
          <Field label="الوصف الكامل">
            <textarea className={`${inputCls} min-h-24`} value={f.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="أهم المميزات (ميزة في كل سطر)">
            <textarea className={`${inputCls} min-h-20`} value={f.features} onChange={(e) => set("features", e.target.value)} />
          </Field>

          <div className="rounded-xl border border-dashed border-line2 bg-surface/70 p-4">
            <p className="mb-3 flex items-center gap-2 text-[13px] font-black text-ink2"><Icon name="search" className="w-4 h-4 text-primary" /> إعدادات SEO</p>
            <div className="space-y-4">
              <Field label="Meta Title"><input className={inputCls} value={f.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} /></Field>
              <Field label="Meta Description"><textarea className={`${inputCls} min-h-16`} value={f.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} /></Field>
              <Field label="الكلمات المفتاحية" hint="مفصولة بفواصل"><input className={inputCls} value={f.keywords} onChange={(e) => set("keywords", e.target.value)} /></Field>
            </div>
          </div>

          <div className="sticky bottom-0 -mx-5 -mb-5 flex gap-3 border-t border-line bg-card px-5 py-4">
            <button type="submit" className={`${btnPrimary} flex-1 justify-center py-3`}>
              <Icon name="check" className="w-4.5 h-4.5" />
              {initial ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
            <button type="button" onClick={onClose} className={btnGhost}>إلغاء</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ProductsAdmin() {
  const [params, setParams] = useSearchParams();
  const [tick, setTick] = useState(0);
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState<"all" | "active" | "inactive">("all");
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Product | null>(null);

  useEffect(() => {
    if (params.get("new") === "1") {
      setEditing(null);
      setFormOpen(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const refresh = () => setTick((t) => t + 1);
  const products = useMemo(() => {
    let list = db.getProducts(true);
    if (statusF !== "all") list = list.filter((p) => p.status === statusF);
    if (q.trim()) list = list.filter((p) => p.name.includes(q.trim()) || p.slug.includes(q.trim().toLowerCase()));
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, q, statusF]);

  const clicksOf = useMemo(() => {
    const m = new Map<number, number>();
    db.getClicks().forEach((c) => m.set(c.productId, (m.get(c.productId) || 0) + 1));
    return m;
  }, [tick]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">المنتجات</h1>
          <p className="mt-1 text-sm text-muted">{db.getProducts(true).length} منتج — إدارة كاملة للأفلييت</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className={btnPrimary}>
          <Icon name="plus" className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52">
          <Icon name="search" className="absolute start-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted" />
          <input className={`${inputCls} ps-9`} placeholder="ابحث بالاسم أو الـ slug…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className={`${inputCls} w-40`} value={statusF} onChange={(e) => setStatusF(e.target.value as typeof statusF)} aria-label="فلترة الحالة">
          <option value="all">كل الحالات</option>
          <option value="active">نشط</option>
          <option value="inactive">معطل</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-card shadow-soft">
        <table className="w-full min-w-[860px] border-collapse">
          <thead className="border-b border-line bg-surface">
            <tr>
              <th className={th}>المنتج</th>
              <th className={th}>المتجر</th>
              <th className={th}>السعر</th>
              <th className={th}>الخصم</th>
              <th className={th}>النقرات</th>
              <th className={th}>مميز</th>
              <th className={th}>الحالة</th>
              <th className={th}>إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const store = db.getStoreById(p.storeId);
              return (
                <tr key={p.id} className="transition-colors hover:bg-bg/60">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <SmartImage src={p.image} alt={p.name} className="w-11 h-11 rounded-lg shrink-0" />
                      <div className="max-w-60">
                        <p className="truncate font-bold">{p.name}</p>
                        <p className="text-[11px] text-muted" dir="ltr">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className={td}>
                    {store && (
                      <span className="flex items-center gap-2">
                        <StoreLogo store={store} size="sm" />
                        {store.name.split(" ")[0]}
                      </span>
                    )}
                  </td>
                  <td className={td}>
                    <span className="font-display font-black">{fmt(p.price)}</span>
                    {p.oldPrice && <span className="ms-1.5 text-xs text-muted"><s>{fmt(p.oldPrice)}</s></span>}
                  </td>
                  <td className={td}>
                    {p.discountPercentage ? <span className="rounded-md bg-flash-soft px-2 py-0.5 text-xs font-black text-flash">{p.discountPercentage}%</span> : <span className="text-muted">—</span>}
                  </td>
                  <td className={td}><span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-black text-accent-dark" dir="ltr">{clicksOf.get(p.id) || 0}</span></td>
                  <td className={td}>
                    <button onClick={() => { db.toggleFeatured(p.id); refresh(); toast(p.featured ? "أُزيل من المميز" : "أُضيف للمنتجات المميزة"); }} aria-label="تبديل التمييز" className={`inline-flex w-8 h-8 items-center justify-center rounded-lg transition-all active:scale-90 ${p.featured ? "bg-accent text-ink" : "bg-bg text-muted hover:text-accent-dark"}`}>
                      <Icon name="star" className="w-4 h-4" filled={p.featured} />
                    </button>
                  </td>
                  <td className={td}>
                    <button
                      onClick={() => { db.toggleProductStatus(p.id); refresh(); }}
                      className={`rounded-full px-3 py-1 text-[11px] font-black transition-colors ${p.status === "active" ? "bg-primary-soft text-primary hover:bg-primary hover:text-bg" : "bg-line text-muted hover:bg-flash hover:text-bg"}`}
                    >
                      {p.status === "active" ? "نشط" : "معطل"}
                    </button>
                  </td>
                  <td className={td}>
                    <div className="flex gap-1.5">
                      <button onClick={() => { setEditing(p); setFormOpen(true); }} className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-primary-soft text-primary hover:bg-primary hover:text-bg transition-colors" aria-label="تعديل">
                        <Icon name="pencil" className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleting(p)} className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-flash-soft text-flash hover:bg-flash hover:text-bg transition-colors" aria-label="حذف">
                        <Icon name="trash" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {products.length === 0 && <p className="p-8 text-center text-sm text-muted">لا منتجات مطابقة</p>}
      </div>

      {formOpen && <ProductForm initial={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); refresh(); }} />}
      <ConfirmDelete
        open={!!deleting}
        name={deleting?.name || ""}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) { db.deleteProduct(deleting.id); toast("تم حذف المنتج", "info"); } setDeleting(null); refresh(); }}
      />
    </div>
  );
}

/* ================= stores ================= */

interface SForm { name: string; slug: string; logoColor: string; logoLetter: string; description: string; websiteUrl: string; status: "active" | "inactive"; }

export function StoresAdmin() {
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<Store | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Store | null>(null);
  const stores = useMemo(() => db.getStores(true).sort((a, b) => a.id - b.id), [tick]);
  const products = useMemo(() => db.getProducts(true), [tick]);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const refresh = () => setTick((t) => t + 1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">المتاجر</h1>
          <p className="mt-1 text-sm text-muted">{stores.length} متجر شريك</p>
        </div>
        <button onClick={openNew} className={btnPrimary}><Icon name="plus" className="w-4 h-4" />إضافة متجر</button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {stores.map((s) => (
          <div key={s.id} className="rounded-xl border border-line bg-card p-4 shadow-soft transition-all hover:shadow-lift">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <StoreLogo store={s} size="lg" />
                <div>
                  <h3 className="font-display font-bold">{s.name}</h3>
                  <p className="text-[11px] text-muted" dir="ltr">/store/{s.slug}</p>
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${s.status === "active" ? "bg-primary-soft text-primary" : "bg-line text-muted"}`}>
                {s.status === "active" ? "نشط" : "معطل"}
              </span>
            </div>
            <p className="clamp-2 mt-3 text-xs leading-5 text-muted">{s.description}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs font-black text-muted">{products.filter((p) => p.storeId === s.id).length} منتج</span>
              <div className="flex gap-1.5">
                <button onClick={() => { setEditing(s); setFormOpen(true); }} className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-primary-soft text-primary hover:bg-primary hover:text-bg transition-colors" aria-label="تعديل"><Icon name="pencil" className="w-4 h-4" /></button>
                <button onClick={() => setDeleting(s)} className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-flash-soft text-flash hover:bg-flash hover:text-bg transition-colors" aria-label="حذف"><Icon name="trash" className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {formOpen && (
        <StoreForm
          initial={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); refresh(); }}
        />
      )}
      <ConfirmDelete
        open={!!deleting}
        name={deleting?.name || ""}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) { db.deleteStore(deleting.id); toast("تم حذف المتجر", "info"); } setDeleting(null); refresh(); }}
      />
    </div>
  );
}

function StoreForm({ initial, onClose, onSaved }: { initial: Store | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<SForm>({
    name: initial?.name || "",
    slug: initial?.slug || "",
    logoColor: initial?.logoColor || "#0d5c42",
    logoLetter: initial?.logoLetter || "",
    description: initial?.description || "",
    websiteUrl: initial?.websiteUrl || "https://",
    status: initial?.status || "active",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(!!initial);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (f.name.trim().length < 2) errs.name = "اسم المتجر مطلوب";
    if (!f.slug.trim()) errs.slug = "الـ slug مطلوب";
    else if (db.getStores(true).some((s) => s.slug === f.slug.trim() && s.id !== initial?.id)) errs.slug = "مستخدم لمتجر آخر";
    if (!f.logoLetter.trim()) errs.logoLetter = "حرف الشعار مطلوب";
    try { new URL(f.websiteUrl); } catch { errs.websiteUrl = "رابط غير صالح"; }
    setErrors(errs);
    if (Object.keys(errs).length) return toast("تحقق من الحقول", "error");
    db.saveStore(
      {
        name: f.name.trim(), slug: f.slug.trim(), logoColor: f.logoColor,
        logoLetter: f.logoLetter.trim().slice(0, 1).toUpperCase() || f.name.trim()[0],
        description: f.description.trim(), websiteUrl: f.websiteUrl.trim(), status: f.status,
      },
      initial?.id
    );
    toast(initial ? "تم تحديث المتجر" : "تمت إضافة المتجر");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={initial ? "تعديل المتجر" : "إضافة متجر"} wide>
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم المتجر" required error={errors.name}><input className={inputCls} value={f.name} onChange={(e) => { setF({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }); }} /></Field>
          <Field label="Slug" required error={errors.slug}><input className={inputCls} dir="ltr" value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }); }} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="لون الشعار">
            <div className="flex items-center gap-2">
              <input type="color" value={f.logoColor} onChange={(e) => setF({ ...f, logoColor: e.target.value })} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-surface p-1" aria-label="لون الشعار" />
              <span className="text-xs font-mono text-muted" dir="ltr">{f.logoColor}</span>
            </div>
          </Field>
          <Field label="حرف الشعار" required error={errors.logoLetter}><input className={inputCls} maxLength={1} value={f.logoLetter} onChange={(e) => setF({ ...f, logoLetter: e.target.value })} /></Field>
          <Field label="الحالة">
            <div className="h-11 rounded-lg border border-line bg-surface px-3.5 flex items-center">
              <Switch checked={f.status === "active"} onChange={(v) => setF({ ...f, status: v ? "active" : "inactive" })} label={f.status === "active" ? "نشط" : "معطل"} />
            </div>
          </Field>
        </div>
        <Field label="الموقع الرسمي" required error={errors.websiteUrl}><input className={inputCls} dir="ltr" value={f.websiteUrl} onChange={(e) => setF({ ...f, websiteUrl: e.target.value })} /></Field>
        <Field label="وصف المتجر"><textarea className={`${inputCls} min-h-20`} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="flex gap-3 pt-1">
          <button type="submit" className={`${btnPrimary} flex-1 justify-center`}><Icon name="check" className="w-4 h-4" />حفظ</button>
          <button type="button" onClick={onClose} className={btnGhost}>إلغاء</button>
        </div>
      </form>
    </Modal>
  );
}

/* ================= categories ================= */

const CATEGORY_ICONS = ["phone", "chip", "laptop", "washer", "pot", "shirt", "perfume", "sparkle", "gamepad", "toy", "car", "dumbbell", "watch", "gem"];

export function CategoriesAdmin() {
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const categories = useMemo(() => db.getCategories().sort((a, b) => a.id - b.id), [tick]);
  const products = useMemo(() => db.getProducts(true), [tick]);
  const refresh = () => setTick((t) => t + 1);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">التصنيفات</h1>
          <p className="mt-1 text-sm text-muted">{categories.length} تصنيف</p>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className={btnPrimary}><Icon name="plus" className="w-4 h-4" />إضافة تصنيف</button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-card shadow-soft">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-line bg-surface">
            <tr><th className={th}>التصنيف</th><th className={th}>Slug</th><th className={th}>المنتجات</th><th className={th}>Meta Title</th><th className={th}>إجراءات</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-bg/60 transition-colors">
                <td className={td}>
                  <span className="flex items-center gap-2.5">
                    <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-primary-soft text-primary"><Icon name={c.icon} className="w-4.5 h-4.5" /></span>
                    <span className="font-bold">{c.name}</span>
                  </span>
                </td>
                <td className={td}><span className="text-muted" dir="ltr">/category/{c.slug}</span></td>
                <td className={td}><span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-black text-primary">{products.filter((p) => p.categoryId === c.id).length}</span></td>
                <td className={`${td} max-w-56 truncate text-muted text-xs`}>{c.metaTitle}</td>
                <td className={td}>
                  <div className="flex gap-1.5">
                    <button onClick={() => { setEditing(c); setFormOpen(true); }} className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-primary-soft text-primary hover:bg-primary hover:text-bg transition-colors" aria-label="تعديل"><Icon name="pencil" className="w-4 h-4" /></button>
                    <button onClick={() => setDeleting(c)} className="inline-flex w-8 h-8 items-center justify-center rounded-lg bg-flash-soft text-flash hover:bg-flash hover:text-bg transition-colors" aria-label="حذف"><Icon name="trash" className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formOpen && <CategoryForm initial={editing} onClose={() => setFormOpen(false)} onSaved={() => { setFormOpen(false); refresh(); }} />}
      <ConfirmDelete
        open={!!deleting}
        name={deleting?.name || ""}
        onClose={() => setDeleting(null)}
        onConfirm={() => { if (deleting) { db.deleteCategory(deleting.id); toast("تم حذف التصنيف", "info"); } setDeleting(null); refresh(); }}
      />
    </div>
  );
}

function CategoryForm({ initial, onClose, onSaved }: { initial: Category | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    name: initial?.name || "", slug: initial?.slug || "", icon: initial?.icon || "tag",
    description: initial?.description || "", metaTitle: initial?.metaTitle || "", metaDescription: initial?.metaDescription || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = useState(!!initial);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (f.name.trim().length < 2) errs.name = "الاسم مطلوب";
    if (!f.slug.trim()) errs.slug = "الـ slug مطلوب";
    setErrors(errs);
    if (Object.keys(errs).length) return toast("تحقق من الحقول", "error");
    db.saveCategory(
      {
        name: f.name.trim(), slug: f.slug.trim(), icon: f.icon, description: f.description.trim(),
        metaTitle: f.metaTitle.trim() || `عروض ${f.name.trim()} في السعودية | وفرلي`,
        metaDescription: f.metaDescription.trim(),
      },
      initial?.id
    );
    toast(initial ? "تم تحديث التصنيف" : "تمت إضافة التصنيف");
    onSaved();
  };

  return (
    <Modal open onClose={onClose} title={initial ? "تعديل التصنيف" : "إضافة تصنيف"} wide>
      <form onSubmit={save} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="اسم التصنيف" required error={errors.name}><input className={inputCls} value={f.name} onChange={(e) => { setF({ ...f, name: e.target.value, slug: slugTouched ? f.slug : slugify(e.target.value) }); }} /></Field>
          <Field label="Slug" required error={errors.slug}><input className={inputCls} dir="ltr" value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }); }} /></Field>
        </div>
        <Field label="الأيقونة">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORY_ICONS.map((ic) => (
              <button type="button" key={ic} onClick={() => setF({ ...f, icon: ic })} className={`inline-flex w-10 h-10 items-center justify-center rounded-lg border transition-all ${f.icon === ic ? "border-primary bg-primary text-bg" : "border-line bg-surface text-muted hover:border-primary/40"}`} aria-label={ic}>
                <Icon name={ic} className="w-4.5 h-4.5" />
              </button>
            ))}
          </div>
        </Field>
        <Field label="الوصف"><textarea className={`${inputCls} min-h-16`} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Meta Title"><input className={inputCls} value={f.metaTitle} onChange={(e) => setF({ ...f, metaTitle: e.target.value })} /></Field>
        <Field label="Meta Description"><textarea className={`${inputCls} min-h-16`} value={f.metaDescription} onChange={(e) => setF({ ...f, metaDescription: e.target.value })} /></Field>
        <div className="flex gap-3 pt-1">
          <button type="submit" className={`${btnPrimary} flex-1 justify-center`}><Icon name="check" className="w-4 h-4" />حفظ</button>
          <button type="button" onClick={onClose} className={btnGhost}>إلغاء</button>
        </div>
      </form>
    </Modal>
  );
}

/* ================= clicks ================= */

export function ClicksAdmin() {
  const [limit, setLimit] = useState(15);
  const [deviceF, setDeviceF] = useState<"all" | "mobile" | "desktop" | "tablet">("all");
  const [tick] = useState(0);

  const { clicks, products, stores, stats } = useMemo(() => {
    const clicks = db.getClicks();
    return { clicks, products: db.getProducts(true), stores: db.getStores(true), stats: db.getStats() };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, limit, deviceF]);

  const filtered = deviceF === "all" ? clicks : clicks.filter((c) => c.device === deviceF);
  const deviceCounts = useMemo(() => {
    const m = { mobile: 0, desktop: 0, tablet: 0 };
    clicks.forEach((c) => { m[c.device]++; });
    return m;
  }, [clicks]);

  const exportCsv = () => {
    const rows = [
      ["id", "product_id", "product_name", "store_id", "device", "referrer", "user_agent", "ip_hash", "created_at"],
      ...clicks.map((c) => [
        c.id, c.productId, products.find((p) => p.id === c.productId)?.name || "", c.storeId,
        c.device, c.referrer, `"${c.userAgent.replace(/"/g, '""')}"`, c.ipHash, c.createdAt,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wafferly-clicks-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("تم تصدير النقرات CSV");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-black">نقرات الأفلييت</h1>
          <p className="mt-1 text-sm text-muted">سجل كامل للتحويلات عبر روابط /go</p>
        </div>
        <button onClick={exportCsv} className={btnGhost}><Icon name="download" className="w-4 h-4" />تصدير CSV</button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-accent/40 bg-accent-soft/50 p-4 text-center">
          <p className="font-display text-2xl font-black text-ink" dir="ltr">{fmt(stats.todayClicks)}</p>
          <p className="text-xs font-bold text-muted">اليوم</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-4 text-center">
          <p className="font-display text-2xl font-black text-ink" dir="ltr">{fmt(stats.weekClicks)}</p>
          <p className="text-xs font-bold text-muted">هذا الأسبوع</p>
        </div>
        <div className="rounded-xl border border-line bg-card p-4 text-center">
          <p className="font-display text-2xl font-black text-ink" dir="ltr">{fmt(stats.totalClicks)}</p>
          <p className="text-xs font-bold text-muted">الإجمالي</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {([["all", "الكل"], ["mobile", `جوال (${deviceCounts.mobile})`], ["desktop", `كمبيوتر (${deviceCounts.desktop})`], ["tablet", `تابلت (${deviceCounts.tablet})`]] as const).map(([k, label]) => (
          <button key={k} onClick={() => setDeviceF(k)} className={`rounded-full px-4 py-2 text-xs font-black transition-all ${deviceF === k ? "bg-night text-bg" : "bg-card border border-line text-ink2 hover:border-primary/40"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-card shadow-soft">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-line bg-surface">
            <tr><th className={th}>المنتج</th><th className={th}>المتجر</th><th className={th}>الجهاز</th><th className={th}>المصدر</th><th className={th}>الوقت</th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.slice(0, limit).map((c) => {
              const p = products.find((x) => x.id === c.productId);
              const s = stores.find((x) => x.id === c.storeId);
              return (
                <tr key={c.id} className="hover:bg-bg/60 transition-colors">
                  <td className={td}>
                    {p ? (
                      <span className="flex items-center gap-2.5">
                        <SmartImage src={p.image} alt="" className="w-9 h-9 rounded-md shrink-0" />
                        <span className="max-w-56 truncate font-bold">{p.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted">منتج محذوف</span>
                    )}
                  </td>
                  <td className={td}>{s ? <span className="flex items-center gap-2"><StoreLogo store={s} size="sm" />{s.name.split(" ")[0]}</span> : "—"}</td>
                  <td className={td}>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted" title={describeUA(c.userAgent)}>
                      <Icon name={c.device === "mobile" ? "phone" : c.device === "tablet" ? "grid" : "laptop"} className="w-4 h-4 text-primary" />
                      {c.device === "mobile" ? "جوال" : c.device === "tablet" ? "تابلت" : "كمبيوتر"}
                    </span>
                  </td>
                  <td className={td}><span className="text-xs font-bold text-muted" dir="ltr">{c.referrer === "direct" ? "مباشر" : c.referrer.replace("https://", "")}</span></td>
                  <td className={td}><span className="text-xs font-bold text-muted">{timeAgo(c.createdAt)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted">لا نقرات مسجلة</p>}
      </div>
      {filtered.length > limit && (
        <button onClick={() => setLimit((l) => l + 20)} className="mt-4 w-full rounded-xl border-2 border-primary py-3 text-sm font-black text-primary hover:bg-primary hover:text-bg transition-colors">
          عرض المزيد ({filtered.length - limit} متبقية)
        </button>
      )}
    </div>
  );
}
