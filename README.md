# ShoeFit Widget

E-ticaret ürün sayfalarına tek script ile eklenen ayakkabı beden asistanı.
Öneriyi marka **ve model kalıbına**, **kadın/erkek/çocuk ölçek farkına** ve
**mağazanın gerçek stoğuna** göre üretir; sonuç her zaman o sayfada seçilebilen
bir numaradır.

**Demo:** [sizeselect-ecommerce.netlify.app](https://sizeselect-ecommerce.netlify.app) ·
**Panel:** [/dashboard](https://sizeselect-ecommerce.netlify.app/dashboard)

---

## Kurulum

Ürün sayfası şablonunda, `</body>` etiketinden hemen önce:

```html
<script
  src="https://sizeselect-ecommerce.netlify.app/shoe-size-widget.js"
  data-target-selector=".add-to-cart"
  data-size-selector=".size-options"
  data-cart-selector=".add-to-cart"
  data-brand-selector=".product-brand"
  data-model-selector=".product-title"
  data-gender="women"
  async>
</script>
```

Yalnızca `data-target-selector` zorunludur — butonun sayfada nereye ekleneceğini
söyler. Diğerleri verilmezse widget sayfayı kendisi tarar, ancak vermeniz
isabeti belirgin şekilde artırır.

### Programatik kullanım

```js
ShoeFitWidget.init({
  targetSelector: '.add-to-cart',
  sizeSelector: '.size-options',
  gender: 'women'
})

ShoeFitWidget.open()      // paneli aç
ShoeFitWidget.close()     // kapat
ShoeFitWidget.refresh()   // SPA'da ürün değiştiyse yeniden kur
ShoeFitWidget.destroy()   // tamamen kaldır
```

`data-autoinit="false"` verilirse script yüklendiğinde kendini başlatmaz;
kurulumu siz yaparsınız.

---

## Parametreler

### Zorunlu

| Parametre | Açıklama |
|---|---|
| `data-target-selector` | "Bedenimi bul" butonunun ekleneceği elemanın CSS seçicisi |

### Sayfa bağlantıları

| Parametre | Açıklama | Varsayılan |
|---|---|---|
| `data-insert-position` | `after` / `before` | `after` |
| `data-size-selector` | Beden seçici — stok ve satılan numaralar buradan okunur | — |
| `data-cart-selector` | Sepete ekle butonu | otomatik arama |
| `data-brand-selector` | Ürünün markasını içeren eleman | — |
| `data-model-selector` | Ürün başlığı / model adı | sayfa başlığı |
| `data-store-size-system` | `EU` / `US` / `UK` / `CM` | otomatik algılama |
| `data-gender` | `men` / `women` / `kids` | sayfadan algılama |
| `data-allow-add-to-cart` | Sepete ekleme butonunu göster | `true` |

### Görünüm

| Parametre | Açıklama | Varsayılan |
|---|---|---|
| `data-style-preset` | `modern`, `midnight`, `glass`, `minimal`, `vivid`, `mono` | `modern` |
| `data-button-color` | Buton arka planı | `#2563eb` |
| `data-button-text-color` | Buton yazı rengi | `#ffffff` |
| `data-border-radius` | Köşe yuvarlaklığı | `16px` |
| `data-button-font-size` | Buton yazı boyutu | `14px` |
| `data-trigger-label` | Buton metni | dile göre |
| `data-language` | `tr` / `en` / `auto` | `auto` |

### Veri

| Parametre | Açıklama | Varsayılan |
|---|---|---|
| `data-store-id` | Mağaza kimliği (olay verisinde taşınır) | `STORE_1` |
| `data-product-id` | Ürün kimliği | — |
| `data-feedback-endpoint` | Öneri ve uyum kayıtlarının POST edileceği adres | — |
| `data-autoinit` | `false` ise kendini başlatmaz | `true` |

---

## Nasıl çalışıyor

**Tek ölçü birimi santimetredir.** Her marka için "EU 42 kaç cm" çapası
tanımlıdır ([`src/data/brandProfiles.ts`](src/data/brandProfiles.ts)); tüm EU/US/UK
tabloları bundan türetilir ([`src/data/sizeSystem.ts`](src/data/sizeSystem.ts)).
Markalar arası farkın tamamı bu çapada yaşar.

**Model kalıbı ayrı bir düzeltmedir.** Samba kısa, Chuck Taylor uzun kalır. Her
model kendi cm sapmasını taşır ([`src/data/models.ts`](src/data/models.ts)) ve
ürün başlığından tanınır.

**Stok öneriyi kısıtlar.** [`inventory.ts`](src/utils/inventory.ts) Shopify ürün
JSON'unu, WooCommerce varyasyon formunu veya DOM'daki beden ızgarasını okur;
tükenmiş numaraları ayırt eder. Motor öneriyi bu kümeye sabitler, ideal numara
yoksa en yakınına geçer ve bunu kullanıcıya söyler.

**Güven skoru gerçek değişkenlere bağlıdır.** Veri kalitesi, ölçüm yöntemi,
model bilgisi, stok ikamesi ve geri bildirim kalibrasyonu skoru ayrı ayrı
etkiler ([`recommendationEngine.ts`](src/utils/recommendationEngine.ts)).
Doğrulanmamış marka `generic` olarak işaretlenir ve skor düşer.

**Profil ikinci ziyareti sıfır tıka indirir.** Ölçüler tarayıcıda saklanır
([`profile.ts`](src/utils/profile.ts)); profil varsa buton doğrudan bedeni gösterir.

**Geri bildirim döngüsü motoru kalibre eder.** Öneriler kaydedilir, "nasıl geldi?"
yanıtları marka bazlı bir cm düzeltmesine dönüşür ([`feedback.ts`](src/utils/feedback.ts)).
Üç yanıtın altında düzeltme uygulanmaz.

---

## Olaylar

Widget her adımda `shoefit_widget_event` yayar ve aynı veriyi GTM
`dataLayer`'ına gönderir.

```js
window.addEventListener('shoefit_widget_event', event => {
  console.log(event.detail.event, event.detail)
})
```

Olaylar: `widget_opened`, `widget_closed`, `method_selected`, `brand_selected`,
`recommendation_viewed`, `alternative_selected`, `size_selected`, `add_to_cart`,
`profile_saved`, `feedback_recorded`.

---

## Gizlilik

Ayak ölçüsü, genişlik ve referans ayakkabılar yalnızca ziyaretçinin
`localStorage`'ında tutulur. Kimlik bilgisi toplanmaz, üçüncü taraf sunucuya
veri gönderilmez. `data-feedback-endpoint` tanımlanırsa yalnızca anonim öneri ve
uyum kayıtları belirttiğiniz adrese gönderilir.

---

## Geliştirme

```bash
npm install
npm run dev         # localhost:5173 — landing, /dashboard — panel
npm run build       # dist/shoe-size-widget.js (IIFE, ~36 KB gzip)
npm test            # 69 test
npm run typecheck
```

Arayüz Preact üzerine kuruludur ve Shadow DOM içinde render edilir; mağazanın
CSS'i widget'ı, widget'ın CSS'i mağazayı etkilemez.

### Yapı

```
src/
  data/
    sizeSystem.ts       Beden ölçekleri, tablo üretimi, dönüşümler
    brandProfiles.ts    Marka kalıp çapaları ve veri kalitesi
    models.ts           Model bazlı kalıp sapmaları ve tanıma
  utils/
    recommendationEngine.ts  Öneri motoru
    inventory.ts             Varyant ve stok okuma
    domIntegration.ts        Beden seçme, sepete ekleme
    profile.ts               Kalıcı beden profili
    feedback.ts              Geri bildirim ve kalibrasyon
  widget/
    embed.ts            Kurulum, yapılandırma, genel API
    ShoeSizeWidget.tsx  Akış ve durum
    steps.tsx           Adım ekranları
    ui.tsx              Ortak arayüz parçaları
    i18n.ts             TR/EN metinler
  styles/widget.css     Tasarım sistemi ve temalar
public/
  index.html            Landing + beden dönüştürücü
  dashboard.html        Mağaza paneli
```

Landing sayfası ve panel hesaplarını `window.ShoeFitEngine` üzerinden yapar;
marka ve model verisinin ikinci bir kopyası HTML içinde tutulmaz.
