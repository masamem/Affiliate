import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { ProductGrid } from "../components/Sections";
import { EmptyState, Icon, toast } from "../components/ui";
import * as db from "../lib/db";
import { applySeo, useFavorites, useSeo } from "../lib/utils";

function LegalShell({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <main className="mx-auto max-w-3xl px-4 pt-10">
        <div className="rounded-2xl border border-line bg-card p-6 shadow-soft sm:p-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1 text-[11px] font-black text-primary">
            <Icon name="shield" className="w-3 h-3" />
            آخر تحديث: {updated}
          </span>
          <h1 className="mt-4 font-display text-2xl font-black sm:text-3xl">{title}</h1>
          <div className="mt-6 space-y-6 text-[15px] leading-8 text-ink2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-black [&_h2]:text-ink [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:ps-5 [&_ul]:space-y-1.5">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ================= عن الموقع ================= */

export function AboutPage() {
  useSeo({ title: "من نحن | وفرلي", description: "تعرف على قصة وفرلي — منصة سعودية تجمع أفضل العروض من متاجرك المفضلة في مكان واحد.", path: "/about" }, []);
  return (
    <LegalShell title="من نحن" updated="يناير 2025">
      <p>
        <strong>وفرلي (Wafferly)</strong> منصة سعودية متخصصة في رصد وعرض أفضل العروض والمنتجات من المتاجر الإلكترونية الكبرى مثل أمازون السعودية، نون، علي إكسبرس، شي إن، تيمو، جرير وإكسترا — في مكان واحد وبعملة الريال السعودي.
      </p>
      <h2>كيف يعمل وفرلي؟</h2>
      <ul>
        <li>نرصد العروض والتخفيضات من المتاجر الشريكة ونراجعها يدويًا.</li>
        <li>نعرض لك السعر ونسبة الخصم وتفاصيل المنتج بشفافية كاملة.</li>
        <li>عند الضغط على «شاهد العرض» نوجهك لصفحة المنتج في المتجر نفسه، حيث تتم عملية الشراء بالكامل هناك.</li>
        <li>قد نحصل على عمولة تسويقية من المتجر عند الشراء عبر روابطنا، دون أي تكلفة إضافية عليك.</li>
      </ul>
      <h2>ماذا لا نفعل؟</h2>
      <p>
        لا نبيع منتجات، ولا نعالج مدفوعات، ولا ندّعي ضمان أقل الأسعار — السعر النهائي والتوفر يحددهما المتجر البائع. دورنا أن نوفر وقتك ونوصلك للعرض المناسب أسرع.
      </p>
      <h2>تواصل معنا</h2>
      <p>
        لأي استفسار أو اقتراح أو بلاغ عن رابط لا يعمل، راسلنا عبر <Link to="/contact" className="font-black text-primary underline underline-offset-4">صفحة التواصل</Link>.
      </p>
    </LegalShell>
  );
}

/* ================= تواصل معنا ================= */

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const settings = db.getSettings();

  useSeo({ title: "تواصل معنا | وفرلي", description: "راسل فريق وفرلي لأي استفسار أو اقتراح أو بلاغ عن رابط.", path: "/contact" }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = "أدخل اسمك الكامل";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "أدخل بريدًا إلكترونيًا صحيحًا";
    if (form.subject.trim().length < 3) errs.subject = "أدخل موضوع الرسالة";
    if (form.message.trim().length < 10) errs.message = "الرسالة قصيرة جدًا (10 أحرف على الأقل)";
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast("تحقق من الحقول المطلوبة", "error");
      return;
    }
    setSent(true);
    toast("تم إرسال رسالتك بنجاح — سنرد خلال 48 ساعة");
  };

  const inputCls = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm font-medium outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/15";

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 pt-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-line bg-card p-6 shadow-soft sm:p-8">
            <h1 className="font-display text-2xl font-black sm:text-3xl">تواصل معنا</h1>
            <p className="mt-2 text-sm text-muted">سؤال؟ اقتراح عرض؟ رابط لا يعمل؟ راسلنا وسنرد سريعًا.</p>

            {sent ? (
              <div className="mt-8 flex flex-col items-center rounded-xl bg-primary-soft px-6 py-12 text-center">
                <span className="inline-flex w-14 h-14 items-center justify-center rounded-full bg-primary text-bg">
                  <Icon name="check" className="w-7 h-7" />
                </span>
                <h2 className="mt-4 font-display text-xl font-black text-primary">وصلتنا رسالتك!</h2>
                <p className="mt-2 text-sm text-ink2">سنعاود التواصل معك على بريدك خلال 48 ساعة عمل.</p>
                <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }} className="mt-5 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-bg hover:bg-primary-dark transition-colors">
                  إرسال رسالة أخرى
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold">الاسم <span className="text-flash">*</span></label>
                    <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="اسمك الكريم" />
                    {errors.name && <p className="mt-1 text-xs font-bold text-flash">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-bold">البريد الإلكتروني <span className="text-flash">*</span></label>
                    <input className={inputCls} type="email" dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                    {errors.email && <p className="mt-1 text-xs font-bold text-flash">{errors.email}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold">الموضوع <span className="text-flash">*</span></label>
                  <input className={inputCls} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="مثال: اقتراح إضافة متجر" />
                  {errors.subject && <p className="mt-1 text-xs font-bold text-flash">{errors.subject}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold">الرسالة <span className="text-flash">*</span></label>
                  <textarea className={`${inputCls} min-h-32 resize-y`} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="اكتب رسالتك هنا…" />
                  {errors.message && <p className="mt-1 text-xs font-bold text-flash">{errors.message}</p>}
                </div>
                <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display font-bold text-bg transition-all hover:bg-primary-dark active:scale-95">
                  <Icon name="send" className="w-4.5 h-4.5" />
                  إرسال الرسالة
                </button>
              </form>
            )}
          </div>

          <aside className="space-y-3">
            {[
              { icon: "mail", label: "البريد الإلكتروني", value: settings.email, href: `mailto:${settings.email}` },
              { icon: "whatsapp", label: "واتساب", value: "+966 5X XXX XXXX", href: settings.whatsapp },
              { icon: "xtwitter", label: "حساب X", value: "@wafferly", href: settings.twitter },
            ].map((c) => (
              <a key={c.label} href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="flex items-center gap-3.5 rounded-xl border border-line bg-card p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:border-primary/40">
                <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                  <Icon name={c.icon} className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-xs font-bold text-muted">{c.label}</span>
                  <span className="text-sm font-black text-ink" dir="ltr">{c.value}</span>
                </span>
              </a>
            ))}
            <div className="rounded-xl border border-accent/30 bg-accent-soft/60 p-4 text-[13px] leading-6 text-ink2">
              <p className="font-black text-ink">ملاحظة:</p>
              وفرلي موقع تسويق بالعمولة — مشاكل الطلبات والشحن والاسترجاع تُعالج لدى المتجر البائع مباشرة.
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ================= صفحات قانونية ================= */

export function PrivacyPage() {
  useSeo({ title: "سياسة الخصوصية | وفرلي", description: "كيف يجمع موقع وفرلي بياناتك ويستخدمها ويحميها.", path: "/privacy" }, []);
  return (
    <LegalShell title="سياسة الخصوصية" updated="يناير 2025">
      <p>خصوصيتك مهمة لنا. توضح هذه السياسة البيانات التي نجمعها في موقع وفرلي، وكيف نستخدمها، وخياراتك حيالها.</p>
      <h2>1. البيانات التي نجمعها</h2>
      <ul>
        <li><strong>بيانات الاستخدام:</strong> الصفحات المزارة، الروابط التي تنقر عليها، نوع الجهاز والمتصفح، ومصدر الزيارة — لأغراض إحصائية مجهولة الهوية.</li>
        <li><strong>النقرات على روابط الأفلييت:</strong> نسجل وقت النقرة ونوع الجهاز ومصدر الزيارة بشكل مُجزّأ (Hashed) دون تخزين عنوان IP الكامل.</li>
        <li><strong>المفضلة:</strong> المنتجات التي تحفظها تُخزن محليًا في متصفحك فقط ولا تُرسل لأي خادم.</li>
        <li><strong>رسائل التواصل:</strong> الاسم والبريد ومحتوى الرسالة عند مراسلتنا.</li>
      </ul>
      <h2>2. كيف نستخدم البيانات</h2>
      <ul>
        <li>تحسين تجربة التصفح وترتيب العروض حسب الاهتمام.</li>
        <li>قياس أداء الروابط التسويقية مع المتاجر الشريكة.</li>
        <li>الرد على استفساراتك.</li>
      </ul>
      <h2>3. ملفات الارتباط</h2>
      <p>نستخدم ملفات ارتباط تقنية وأخرى تحليلية (مثل Google Analytics إن فُعّلت). راجع <Link to="/cookies" className="font-black text-primary underline underline-offset-4">سياسة ملفات الارتباط</Link>.</p>
      <h2>4. حقوقك</h2>
      <p>يمكنك طلب حذف بيانات مراسلاتك أو الاستفسار عن أي بيانات مرتبطة بك عبر <Link to="/contact" className="font-black text-primary underline underline-offset-4">صفحة التواصل</Link>.</p>
      <h2>5. أمان البيانات</h2>
      <p>تُخزن كلمات مرور لوحة التحكم مجزّأة (Hashed) ولا تُخزن كنص واضح، وتُحمى مناطق الإدارة بجلسات محددة الصلاحية.</p>
    </LegalShell>
  );
}

export function TermsPage() {
  useSeo({ title: "الشروط والأحكام | وفرلي", description: "شروط استخدام موقع وفرلي للعروض والتسويق بالعمولة.", path: "/terms" }, []);
  return (
    <LegalShell title="الشروط والأحكام" updated="يناير 2025">
      <p>باستخدامك موقع وفرلي فأنت توافق على الشروط التالية:</p>
      <h2>1. طبيعة الخدمة</h2>
      <p>وفرلي منصة عرض وتسويق بالعمولة. نحن لا نبيع المنتجات ولا نعالج الطلبات أو المدفوعات؛ تتم كل عمليات الشراء لدى المتجر البائع وتخضع لشروطه.</p>
      <h2>2. دقة الأسعار</h2>
      <p>نبذل جهدًا لعرض أسعار محدثة، لكن الأسعار والتوفر قد تتغير في أي وقت، والسعر النهائي الملزم هو المعروض في متجر البائع لحظة الشراء.</p>
      <h2>3. روابط الأفلييت</h2>
      <p>قد نحصل على عمولة عند الشراء عبر روابطنا دون أي تكلفة إضافية عليك. لا يؤثر ذلك على ترتيب العروض أو صدقيتنا في العرض.</p>
      <h2>4. الاستخدام المقبول</h2>
      <ul>
        <li>يُمنع استخدام الموقع في أي نشاط مخالف للأنظمة في المملكة العربية السعودية.</li>
        <li>يُمنع محاولة الوصول غير المصرح به للوحة التحكم أو البيانات.</li>
        <li>يُمنع إعادة نشر محتوى الموقع تجاريًا دون إذن كتابي.</li>
      </ul>
      <h2>5. حدود المسؤولية</h2>
      <p>لا يتحمل وفرلي مسؤولية جودة المنتجات أو تأخر الشحن أو سياسات الاسترجاع؛ هذه مسؤولية المتجر البائع. المحتوى مقدم «كما هو» دون ضمانات من أي نوع.</p>
      <h2>6. التعديلات</h2>
      <p>قد نحدّث هذه الشروط، ويعتبر استمرار استخدامك للموقع موافقة على النسخة المنشورة.</p>
    </LegalShell>
  );
}

export function CookiesPage() {
  useSeo({ title: "سياسة ملفات الارتباط | وفرلي", description: "ملفات الارتباط التي يستخدمها موقع وفرلي وكيفية التحكم بها.", path: "/cookies" }, []);
  return (
    <LegalShell title="سياسة ملفات الارتباط" updated="يناير 2025">
      <p>ملفات الارتباط (Cookies) ملفات نصية صغيرة يحفظها متصفحك لتذكر تفضيلاتك وتحسين تجربتك.</p>
      <h2>الملفات التي نستخدمها</h2>
      <ul>
        <li><strong>تقنية ضرورية:</strong> لحفظ جلستك في لوحة التحكم وتفضيلات العرض.</li>
        <li><strong>التخزين المحلي (LocalStorage):</strong> لحفظ قائمة مفضلتك داخل متصفحك فقط.</li>
        <li><strong>تحليلية:</strong> مثل Google Analytics 4 (إن فُعّل) لفهم كيفية استخدام الموقع بشكل مجمّع ومجهول الهوية.</li>
      </ul>
      <h2>التحكم بالملفات</h2>
      <p>يمكنك تعطيل ملفات الارتباط من إعدادات متصفحك في أي وقت؛ قد يؤثر ذلك على بعض الميزات مثل المفضلة وجلسة الإدارة.</p>
    </LegalShell>
  );
}

export function DisclosurePage() {
  const settings = db.getSettings();
  useSeo({ title: "الإفصاح عن روابط الأفلييت | وفرلي", description: "شرح شفاف لكيفية عمل روابط التسويق بالعمولة في وفرلي.", path: "/disclosure" }, []);
  return (
    <LegalShell title="الإفصاح عن روابط التسويق بالعمولة" updated="يناير 2025">
      <div className="rounded-xl border border-accent/30 bg-accent-soft/60 p-4 font-bold text-ink">
        {settings.disclosure}
      </div>
      <h2>ماذا يعني هذا عمليًا؟</h2>
      <p>
        عندما تضغط زر «شاهد العرض» أو «شراء من المتجر»، تمر أولًا عبر رابط داخلي (<span dir="ltr" className="font-mono text-[13px] bg-bg px-1.5 py-0.5 rounded">/go/product-slug</span>) يسجل النقرة إحصائيًا ثم يوجهك لصفحة المنتج في المتجر. إذا أتممت الشراء، قد يدفع المتجر لوفرلي عمولة تسويقية صغيرة.
      </p>
      <h2>هل تدفع أكثر؟</h2>
      <p><strong>لا.</strong> العمولة تأتي من هامش المتجر التسويقي، وسعر المنتج عليك هو نفسه مع أو بدون رابطنا.</p>
      <h2>هل يؤثر ذلك على مصداقية العروض؟</h2>
      <ul>
        <li>نرتب العروض وفق الخصم والمشاهدات والتقييمات، لا وفق حجم العمولة.</li>
        <li>نعرض السعر السابق ونسبة الخصم بشفافية، ونشير للعروض المنتهية بوضوح.</li>
        <li>لا نستخدم عبارات تضليلية مثل «أرخص سعر مضمون» — السعر النهائي يحدده المتجر.</li>
      </ul>
      <h2>المتاجر الشريكة حاليًا</h2>
      <p>برنامج شركاء أمازون، برنامج نون للشركاء، برنامج علي إكسبرس، وغيرها. تُحدَّث القائمة مع كل شراكة جديدة.</p>
    </LegalShell>
  );
}

/* ================= المفضلة ================= */

export function FavoritesPage() {
  const [favs] = useFavorites();
  const data = useMemo(() => {
    const stores = db.getStores();
    const products = db.getProducts().filter((p) => favs.includes(p.slug));
    return { stores, products };
  }, [favs]);

  useSeo({ title: "مفضلتي | وفرلي", description: "المنتجات التي حفظتها في وفرلي.", path: "/favorites" }, [favs.length]);

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 pt-8">
        <div className="mb-8">
          <h1 className="flex items-center gap-3 font-display text-2xl font-black sm:text-3xl">
            <span className="inline-flex w-11 h-11 items-center justify-center rounded-xl bg-flash-soft text-flash">
              <Icon name="heart" className="w-5 h-5" filled />
            </span>
            مفضلتي
            <span className="rounded-full bg-bg px-3 py-1 text-sm text-muted">{data.products.length}</span>
          </h1>
          <p className="mt-2 text-sm text-muted">محفوظة محليًا في متصفحك — بدون تسجيل حساب.</p>
        </div>
        {data.products.length ? (
          <ProductGrid products={data.products} stores={data.stores} showCountdown />
        ) : (
          <EmptyState
            icon="heart"
            title="مفضلتك فارغة"
            desc="اضغط على أيقونة القلب في أي بطاقة منتج لحفظه هنا والعودة إليه لاحقًا."
            action={<Link to="/deals" className="rounded-xl bg-primary px-6 py-3 font-bold text-bg hover:bg-primary-dark transition-colors">تصفح العروض</Link>}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

/* ================= 404 ================= */

export function NotFoundPage() {
  applySeo({ title: "الصفحة غير موجودة (404) | وفرلي", description: "يبدو أن العرض الذي تبحث عنه غير موجود.", path: "/404" });
  return (
    <>
      <main className="relative mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center">
        <div className="relative">
          <span className="font-display text-[110px] sm:text-[150px] font-black leading-none text-primary/10 select-none" aria-hidden="true">404</span>
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="inline-flex w-20 h-20 items-center justify-center rounded-2xl bg-flash-soft text-flash">
              <Icon name="tag" className="w-10 h-10" />
            </span>
          </span>
        </div>
        <h1 className="mt-6 font-display text-2xl font-black sm:text-3xl">يبدو أن العرض الذي تبحث عنه غير موجود</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted">
          ربما انتهى العرض أو تغيّر رابطه. لا تقلق — لدينا عشرات العروض النشطة الآن في انتظارك.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display font-bold text-bg transition-all hover:bg-primary-dark active:scale-95">
            <Icon name="home" className="w-4.5 h-4.5" />
            العودة إلى الصفحة الرئيسية
          </Link>
          <Link to="/deals" className="inline-flex items-center gap-2 rounded-xl border-2 border-line bg-card px-6 py-3 font-display font-bold text-ink2 transition-all hover:border-primary hover:text-primary active:scale-95">
            تصفح العروض
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
