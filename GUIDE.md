# T5DE / IMVU HUNTER v12 — الدليل الشامل المحدّث

هذا الدليل يشرح بنية المشروع بالكامل والأنظمة الثلاثة الجديدة التي تمت إضافتها:

1. نظام السوق مع الارتداء المباشر (Market Wear) وشارات AP / GA.
2. نظام البحث المتقدم عن المصممين بالاسم أو الـ ID (يعمل حتى مع الحسابات الموقوفة).
3. نظام الخطوط والأحجام المتكامل عبر `themes.css` المبني على متغير `--scale`.

---

## 1. نظرة عامة على آلية عمل المشروع

T5DE ليس تطبيقاً مستقلاً، بل **مُعدِّل (patcher)** لعميل IMVU Classic. يعمل بالخطوات التالية:

1. `Client.download()` — تنزيل مُثبّت IMVU بالإصدار المطلوب.
2. `Client.install()` — تثبيت العميل تلقائياً عبر أتمتة النوافذ.
3. `Client.copy()` — نسخ ملفات العميل إلى مجلد العمل وإضافة `devicefingerprint.pyd`.
4. `Client.patch()` — تشغيل المُعدِّلات (Patchers) الثلاثة:
   - **InterfacePatcher** — يفك ضغط `imvuContent.jar` ويعدّل HTML/CSS/JS ثم يعيد الأرشفة.
   - **PythonPatcher** — يفك ضغط `library.zip`، يفكّك (decompile) ملفات `.pyo` عبر `uncompyle6`، يعدّل الكود، ثم يعيد التجميع.
   - **ChecksumPatcher** — يعدّل `checksum.txt` لتجاوز نظام التحقق ومنع التحديث التلقائي.

### نظام الـ Patch

كل تعديل يرث من أحد الأنواع: `InterfacePatch`، `PythonPatch`، أو `ChecksumPatch`.
داخل المُنشئ يتم تسجيل بدائل عبر:

```python
self.register('NAME', 'path/to/file', r'regex_pattern')
```

ثم تنفّذ الدالة `patch(self, context)` التعديل عند مطابقة النمط. كائن `Context` يوفّر:

- `context.line` — السطر الحالي.
- `context.write(text, indent)` — كتابة سطر للمخرجات مع المسافات البادئة.
- `context.skip(n)` / `context.seek(n)` — تخطّي أو القفز بين الأسطر.
- `context.pattern` — اسم البديل المطابق حالياً.

الاكتشاف التلقائي للمُعدِّلات يتم عبر `inspect.getmembers` على حزم `patches/interface`، `patches/python`، `patches/checksum`، لذلك يكفي إنشاء ملف جديد وتسجيله في `__init__.py`.

---

## 2. الملفات الجديدة المضافة

```
t5de/
├── assets/
│   ├── css/
│   │   └── themes.css                 نظام المتغيرات والأحجام المبني على --scale
│   └── js/
│       ├── t5de_theme.js              تطبيق --scale + شريط تكبير الواجهة + حفظه
│       ├── t5de_wear.js               جسر الارتداء المباشر وحساب شارة AP/GA
│       └── t5de_designer_search.js    لوحة البحث عن المصمم وعرض منتجاته
└── patches/interface/
    ├── ThemeScalePatch.py             يحقن themes.css و t5de_theme.js في الواجهة
    ├── MarketWearPatch.py             يضيف زر الارتداء وشارة AP/GA في السوق
    └── DesignerSearchPatch.py         يحقن لوحة البحث المتقدم وأنماطها
```

كما تمت إضافة دالة مساعدة `deploy_asset()` في `t5de/patch/InterfacePatch.py` تنسخ أي ملف من مجلد `assets` إلى داخل `imvuContent/` أثناء التعديل.

---

## 3. نظام الخطوط والأحجام (`themes.css` + `--scale`)

### الفكرة

كل القياسات في الواجهة مشتقة من متغير واحد `--scale` (القيمة الافتراضية `1`). تغيير هذا المتغير يكبّر أو يصغّر كل شيء تلقائياً دون لمس باقي الكود.

### المتغيرات الأساسية في `:root`

| المتغير | الوصف |
|---|---|
| `--scale` | معامل التكبير الرئيسي |
| `--font-base` / `--font-title` / `--font-small` / `--font-badge` | أحجام النصوص |
| `--btn-h` | أقل ارتفاع للأزرار |
| `--input-h` | أقل ارتفاع لحقول الإدخال |
| `--pad-btn-y` / `--pad-btn-x` | حشوة الأزرار |
| `--pad-input-y` / `--pad-input-x` | حشوة الحقول |
| `--radius` | تدوير الحواف |
| `--gap` | المسافة بين العناصر |
| `--switch-w` / `--switch-h` / `--switch-knob` | أبعاد السويتش |

### كيف يكبّر كل شيء

تستخدم القواعد دالة `calc()` لضرب كل قيمة في `--scale`:

```css
.t5de-scaled button {
    min-height: calc(var(--btn-h) * var(--scale));
    padding: calc(var(--pad-btn-y) * var(--scale)) calc(var(--pad-btn-x) * var(--scale));
    font-size: calc(var(--font-base) * var(--scale));
    border-radius: calc(var(--radius) * var(--scale));
}
```

وهكذا تتكبّر تلقائياً عند تغيير `--scale`:
- حشوة الأزرار والحقول.
- أقل ارتفاع للأزرار (`--btn-h`) والإدخالات (`--input-h`).
- أحجام خطوط العناوين والنصوص والشارات.
- تدوير الحواف (`border-radius`) والمسافات (`gap`).
- السويتشات (المفتاح والمقبض المتحرك).

### التحكم الحي

ملف `t5de_theme.js`:
- يقرأ آخر قيمة محفوظة من `localStorage` (المفتاح `t5de.scale`).
- يضيف الصنف `t5de-scaled` على `<body>`.
- يضبط `document.documentElement.style.setProperty('--scale', value)`.
- يبني شريط تمرير (`#t5de-scale-control`) لتغيير الحجم من 75% إلى 200% ويحفظه فوراً.

> أي عنصر تريد تطبيق النظام عليه، يكفي أن يكون داخل `.t5de-scaled` ويستخدم الأصناف الجاهزة: `t5de-btn`, `t5de-title`, `t5de-text`, `t5de-small`, `t5de-badge`, `t5de-row`, `t5de-col`, `t5de-card`, `t5de-switch`.

### آلية الحقن (`ThemeScalePatch`)

- ينسخ `themes.css` و`t5de_theme.js` إلى `imvuContent/t5de/`.
- يضيف `@import url("../t5de/themes.css");` في أعلى `shop/style.css`.
- يحقن سكربت تحميل `t5de_theme.js` داخل `shop/ShopMode.js`.

---

## 4. نظام السوق مع الارتداء المباشر (`MarketWearPatch`)

### ما الذي يضيفه

لكل منتج في لوحة معلومات السوق:
- **شارة AP / GA** توضّح نوع وصول المنتج.
- **زر Wear** يرتدي المنتج مباشرة من الواجهة دون كتابة أمر يدوي.

### آلية العمل

1. عند بناء عنصر `more-info` في `ShopMode.js` يُضاف صندوق أزرار يحتوي الشارة وزر الارتداء.
2. تُسجَّل عناصر DOM (`elAccessBadge`, `elWearButton`).
3. عند تحديث المنتج:
   - تُحسب الشارة عبر `window.t5deBadgeFor(product)`.
   - يُربط زر الارتداء بمعرّف المنتج عبر `window.t5deWear(product.id)`.

### جسر الارتداء (`t5de_wear.js`)

يحاول `t5deWear(pid)` تنفيذ الارتداء بثلاث طرق متتالية حتى ينجح:
1. استدعاء جسر العميل `imvu.call("useProduct", { productId })`.
2. إرسال الأمر `*use <id>` عبر `sendChatCommand` (نفس آلية ميزة `*use` الأصلية في T5DE).
3. مخطط `imvu:use?product=<id>` كحل أخير.

> ملاحظة: كما هو الحال مع أمر `*use`، الملابس المرتداة بهذه الطريقة يراها فقط المستخدمون الذين يملكون عميلاً معدّلاً، بينما الأثاث يراه مستخدمو الجوال أيضاً.

شارة AP/GA تُحسب من حقول المنتج (`is_ap`, `rating`, `access_pass`). إذا كان المنتج AP تظهر شارة `AP` صفراء، وإلا تظهر `GA` خضراء.

---

## 5. نظام البحث المتقدم عن المصممين (`DesignerSearchPatch`)

### الفكرة

عند إيقاف حساب مصمم، يختفي ملفه الشخصي لكن **منتجاته تبقى موجودة على خوادم IMVU**، فقط يصعب الوصول إليها. هذا النظام يصل إليها مباشرة عبر واجهات IMVU العامة.

### الواجهة

لوحة عائمة `#t5de-designer-search` في أعلى يمين السوق تحتوي:
- حقل بحث يقبل **اسم المصمم أو الـ ID**.
- زر Search.
- منطقة نتائج تعرض كل منتج كبطاقة فيها: الـ ID، زر **Wear** (ارتداء مباشر)، وزر **Open** (فتح صفحة المنتج).

### آلية العمل (`t5de_designer_search.js`)

1. `resolveCreator(query)`:
   - إذا كان الإدخال أرقاماً فقط ← يُعامل كـ ID مباشرة (`/user/user-<id>`).
   - وإلا ← يبحث بالاسم عبر `/user?username=` ويستخرج `legacy_cid`.
2. `fetchProducts(cid)` ← يستدعي `/product?creator=<cid>&limit=100` ويستخرج معرّفات المنتجات من العلاقات.
3. تُرسم المنتجات في بطاقات، وزر الارتداء يستخدم نفس جسر `window.t5deWear`.

> لأن الاستدعاءات تتم على واجهة الكتالوج/المنتجات وليس على ملف المستخدم، تظهر المنتجات حتى لو كان الحساب موقوفاً.

تُحقن اللوحة وأنماطها (المثبّتة `position: fixed` والمتوافقة مع `--scale`) عبر `DesignerSearchPatch`.

---

## 6. ترتيب تنفيذ التعديلات والتكامل

المُعدِّلات تُكتشف أبجدياً. التعديلات التي تشترك في ملفات السوق (`ShopMode.js`, `style.css`) تستخدم نقاط ربط (anchors) تبقى موجودة بعد كل تعديل:

- `r'.more-info'` و `r'dialog\.elMoreInfo ='` و `r'var categoryNames = \[\];'`

لذلك يستطيع `ShopModePatch` و`ThemeScalePatch` و`MarketWearPatch` و`DesignerSearchPatch` العمل على نفس الملفات بالتتابع دون تعارض، حيث يعيد كل تعديل كتابة سطر الربط ليجده التعديل التالي.

تم التحقق من ذلك عبر محاكاة كاملة لمحرك التعديل على ملفات اختبار، ونتج عنها ملفات JS صحيحة و CSS متوازن الأقواس.

---

## 7. البناء والتثبيت

**المتطلبات:** Python 2.7 و NSIS.

```
python -m pip install -r requirements.txt
python -m t5de --patch --version <IMVU_VERSION>
makensis ./scripts/install.nsi
```

ثم شغّل المُثبّت الناتج `T5DE-*.exe`.

---

## 8. كيفية إضافة نظام جديد لاحقاً

1. أنشئ ملف Patch جديد في `t5de/patches/interface` (أو `python`).
2. ورّث من `InterfacePatch` / `PythonPatch`.
3. سجّل بدائلك في `__init__`.
4. ضع منطق التعديل في `patch(self, context)`.
5. إن احتجت أصولاً ثابتة، ضعها في `t5de/assets` واستخدم `self.deploy_asset(...)`.
6. أضف سطر الاستيراد في `__init__.py` للحزمة.

بهذا يتكامل نظامك الجديد تلقائياً مع باقي المُعدِّل.
