# ShoeFit Widget

E-ticaret sitelerine tek script ile entegre edilen ayakkabı beden asistanı.  
Kullanıcı "Bedenimi Bul" butonuna tıklar → sidebar açılır → beden öneri akışı çalışır.

**Demo:** [sizeselect-ecommerce.netlify.app](https://sizeselect-ecommerce.netlify.app)

---

## Entegrasyon

### Yöntem 1 — HTML Script Tag

Sitenin `<body>` kapanış etiketinden önce ekle:

```html
<script
  src="https://sizeselect-ecommerce.netlify.app/shoe-size-widget.js"
  data-store-id="STORE_1"
  data-brand="Nike"
  data-target-selector=".add-to-cart-btn"
  data-insert-position="after"
  data-button-color="#2563eb"
  data-language="auto"
  async>
</script>
```

`data-target-selector` → "Bedenimi Bul" butonunun ekleneceği elementin CSS seçicisi (**zorunlu**).

### Yöntem 2 — Tarayıcı Konsolundan Test

```js
const s = document.createElement('script');
s.type = 'module';
s.src = 'https://sizeselect-ecommerce.netlify.app/shoe-size-widget.js';
document.head.appendChild(s);

s.onload = () => window.ShoeFitWidget.init({
  targetSelector: '.add-to-cart-btn',
  insertPosition: 'after',
  brand: 'Nike',
  buttonColor: '#2563eb',
  language: 'auto'
});
```

---

## Tüm Parametreler

| Parametre | Açıklama | Varsayılan |
|---|---|---|
| `data-target-selector` | Butonun ekleneceği element | — (**zorunlu**) |
| `data-insert-position` | `after` veya `before` | `after` |
| `data-brand` | Hedef ayakkabı markası | `Nike` |
| `data-store-id` | Mağaza ID | `STORE_1` |
| `data-button-color` | Buton rengi (hex) | `#2563eb` |
| `data-button-text-color` | Buton yazı rengi | `#ffffff` |
| `data-border-radius` | Köşe yuvarlama | `16px` |
| `data-language` | `tr`, `en`, `auto` | `auto` |
| `data-style-preset` | `modern`, `glass`, `carbon`, `playful`, `cyberpunk`, `retro` | `modern` |
| `data-size-selector` | Beden seçici elementi CSS | — |
| `data-cart-selector` | Sepete ekle butonu CSS | — |
| `data-show-add-to-cart` | `true` / `false` | `true` |
| `data-show-select-size` | `true` / `false` | `true` |

---

## Geliştirme

```bash
npm install
npm run dev      # localhost:5173
npm run build    # dist/ klasörüne üretir
```

Merchant Panel (demo + embed kodu üretici): `http://localhost:5173`
