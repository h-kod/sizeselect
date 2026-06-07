# Shoe Size Widget

Bu proje, üçüncü taraf e-ticaret sayfalarına yerleştirilebilen bir ayakkabı numarası asistanı widget'ıdır. Netlify için hazır ve root dizinden doğrudan kopyalanabilir bir JS dosyası sunar.

## Özellikler

- React + TypeScript widget
- Shadow DOM ile stil izolasyonu
- `shoe-size-widget.js` olarak build edilebilir
- Netlify deploy için `dist/` klasörünü publish eder
- Basit embed kodu ile başka sayfalara entegre edilir

## Yerel geliştirme

```bash
npm install
npm run dev
```

`http://localhost:5173` adresinde demo sayfa açılır.

## Yapı ve deploy

```bash
npm run build
```

Bu komut `dist/` klasörüne widget JS dosyasını ve `public/index.html` demo sayfasını çıkarır.

## Netlify kurulumu

1. Projeyi bir Git deposuna push et.
2. Netlify'a bağla.
3. Aşağıdaki ayarları kullan:
   - Build command: `npm run build`
   - Publish directory: `dist`

### Netlify'da embed kodu

Netlify deploy sonrası widget şu adreste sunulur:

```html
<script type="module" src="https://your-site.netlify.app/shoe-size-widget.js" data-brand="Nike" data-product-category="sneaker" data-position="after-size-selector"></script>
```

`your-site.netlify.app` kısmını kendi site adresinle değiştir.

## Notlar

- `netlify.toml` dosyası Netlify build ayarlarını içerir.
- `public/index.html` static demo sayfasıdır ve deploy edildiğinde doğrudan açılabilir.
