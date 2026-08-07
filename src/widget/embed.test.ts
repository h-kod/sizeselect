// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

/**
 * embed.ts modül yüklenirken kendini başlatmaya çalışır; testte hedef
 * bulunmadığı için sessizce vazgeçmesi beklenir.
 */
const productPage = `
  <div id="brand">Adidas</div>
  <h1 id="title">Adidas Samba OG</h1>
  <div id="sizes">
    <input type="radio" id="p41" name="size" value="41" /><label for="p41">41</label>
    <input type="radio" id="p42" name="size" value="42" disabled /><label for="p42">42</label>
    <input type="radio" id="p43" name="size" value="43" /><label for="p43">43</label>
  </div>
  <button class="add-to-cart">Sepete ekle</button>`

let api: typeof import('./embed').default

beforeEach(async () => {
  document.body.innerHTML = productPage
  localStorage.clear()
  api = (await import('./embed')).default
})

afterEach(() => {
  api?.destroy()
})

const shadowOf = () =>
  (document.querySelector('[data-ssw-host]') as HTMLElement | null)?.shadowRoot ?? null

const settle = (ms = 60) => new Promise(resolve => setTimeout(resolve, ms))

describe('widget kurulumu', () => {
  it('hedef elemanın yanına monte olur ve stil enjekte eder', () => {
    api.init({ targetSelector: '.add-to-cart', sizeSelector: '#sizes' })

    const host = document.querySelector('[data-ssw-host]')
    expect(host).not.toBeNull()
    expect(host?.shadowRoot).not.toBeNull()
    // Stil düğümü shadow'un içinde olmalı — sayfanın CSS'i widget'a sızmasın.
    // İçeriği build zamanında gömülür, bu yüzden burada yalnızca varlığı denetlenir.
    expect(shadowOf()?.querySelector('style')).not.toBeNull()
    expect(shadowOf()?.querySelector('.sf-trigger')).not.toBeNull()
  })

  it('tema ve renk değişkenlerini host üzerine yazar', () => {
    api.init({
      targetSelector: '.add-to-cart',
      stylePreset: 'midnight',
      buttonColor: '#ff0000',
      borderRadius: '4px'
    })

    const host = document.querySelector('[data-ssw-host]') as HTMLElement
    expect(host.getAttribute('data-preset')).toBe('midnight')
    expect(host.style.getPropertyValue('--sf-accent')).toBe('#ff0000')
    expect(host.style.getPropertyValue('--sf-radius')).toBe('4px')
  })

  it('hedef bulunamazsa mevcut kurulumu yıkmaz', () => {
    api.init({ targetSelector: '.add-to-cart' })
    expect(document.querySelector('[data-ssw-host]')).not.toBeNull()

    // Sayfa yüklenirken tetiklenen ikinci bir başlatma çalışan widget'ı
    // silip yerine hiçbir şey koymamalı.
    api.init({ targetSelector: '.olmayan-secici' })
    expect(document.querySelector('[data-ssw-host]')).not.toBeNull()
    expect(shadowOf()?.querySelector('.sf-trigger')).not.toBeNull()
  })

  it('yeniden başlatmada tek bir örnek bırakır', () => {
    api.init({ targetSelector: '.add-to-cart' })
    api.init({ targetSelector: '.add-to-cart' })
    expect(document.querySelectorAll('[data-ssw-host]')).toHaveLength(1)
  })

  it('destroy her şeyi temizler', () => {
    api.init({ targetSelector: '.add-to-cart' })
    api.destroy()
    expect(document.querySelector('[data-ssw-host]')).toBeNull()
  })
})

describe('kategori (gender) parametresi', () => {
  const genderOf = () => {
    const shadow = shadowOf()!
    const active = Array.from(shadow.querySelectorAll('.sf-segmented .sf-segment')).find(node =>
      node.getAttribute('aria-checked') === 'true'
    )
    return (active?.textContent || '').trim()
  }

  it('merchant kategoriyi verdiğinde o kullanılır', async () => {
    api.init({ targetSelector: '.add-to-cart', gender: 'women', language: 'tr' })
    api.open()
    await settle()

    expect(genderOf()).toBe('Kadın')
  })

  it('kategori verilmezse sayfadan tahmin edilir', async () => {
    document.title = "Nike Air Max Çocuk Spor Ayakkabı"
    api.init({ targetSelector: '.add-to-cart', gender: 'auto', language: 'tr' })
    api.open()
    await settle()

    expect(genderOf()).toBe('Çocuk')
    document.title = ''
  })

  it('kayıtlı profil olsa da merchant kategorisi öncelikli', async () => {
    localStorage.setItem(
      'shoefit.profile.v2',
      JSON.stringify({
        version: 2,
        gender: 'men',
        footWidth: 'normal',
        measured: true,
        footCm: 26.5,
        references: [],
        updatedAt: new Date().toISOString()
      })
    )

    api.init({ targetSelector: '.add-to-cart', gender: 'women', language: 'tr' })
    api.open()
    await settle()

    // Kadın ürünü sayfasında erkek ölçeğine düşmek US/UK numaralarını kaydırırdı.
    expect(genderOf()).toBe('Kadın')
  })
})

describe('panel kontrolü', () => {
  it('init ardından hemen çağrılan open kaybolmaz', async () => {
    api.init({ targetSelector: '.add-to-cart', sizeSelector: '#sizes' })
    // Bileşen henüz dinlemeye başlamamışken gelen istek kuyruğa alınmalı.
    api.open()

    await settle()
    expect(shadowOf()?.querySelector('.sf-panel')).not.toBeNull()
  })

  it('merchant kendi pencere olayını da yayabilir', async () => {
    api.init({ targetSelector: '.add-to-cart' })
    await settle()

    window.dispatchEvent(new CustomEvent('shoefit_open_widget'))
    await settle()
    expect(shadowOf()?.querySelector('.sf-panel')).not.toBeNull()

    window.dispatchEvent(new CustomEvent('shoefit_close_widget'))
    await settle()
    expect(shadowOf()?.querySelector('.sf-panel')).toBeNull()
  })

  it('panel açıldığında adım göstergesi ve yöntem kartları gelir', async () => {
    api.init({ targetSelector: '.add-to-cart', sizeSelector: '#sizes' })
    api.open()
    await settle()

    const shadow = shadowOf()!
    expect(shadow.querySelector('.sf-steps')).not.toBeNull()
    expect(shadow.querySelectorAll('.sf-choice').length).toBeGreaterThanOrEqual(2)
  })
})

describe('dışa açılan motor', () => {
  it('global API üzerinden hesap yapılabilir', () => {
    const engine = (window as any).ShoeFitEngine
    expect(typeof engine.recommendSize).toBe('function')
    expect(engine.brandNames.length).toBeGreaterThan(5)

    const result = engine.recommendSize({
      targetBrand: 'Adidas',
      gender: 'men',
      refBrand: 'Nike',
      refSize: '42',
      refSystem: 'EU',
      refFit: 'perfect',
      offeredEuSizes: [41, 42, 43],
      inStockEuSizes: [41, 43]
    })

    expect([41, 43]).toContain(result.recommendedEu)
  })

  it('sürüm bilgisi yayınlanır', () => {
    expect((window as any).ShoeFitWidget.version).toBe('2.0.0')
  })
})
