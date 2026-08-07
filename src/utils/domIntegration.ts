import { InventorySnapshot, VariantOption, escapeSelector, findVariant } from './inventory'

/**
 * Mağaza sayfasıyla etkileşim.
 *
 * Önceki sürüm son çare olarak sayfadaki tüm butonları tarayıp metni "42" olan
 * ilk elemana tıklıyordu — fiyat, adet seçici veya kampanya rozeti de eşleşebiliyordu.
 * Artık yalnızca envanter katmanının doğruladığı, bilinen bir varyant elemanına
 * dokunuyoruz. Bulamazsak hiçbir şeye tıklamıyor, kullanıcıya numarayı söylüyoruz.
 */

const CART_SELECTORS = [
  '.single_add_to_cart_button',
  'form[action*="/cart/add"] button[type="submit"]',
  'form[action*="/cart/add"] input[type="submit"]',
  'button[name="add"]',
  '[data-add-to-cart]',
  '.add-to-cart',
  '#add-to-cart',
  '.btn-cart',
  '#btn-cart',
  'button[class*="add-to-cart"]',
  'button[class*="addtocart"]',
  'button[id*="add-to-cart"]',
  'button[id*="addtocart"]'
]

const CART_TEXTS = ['sepete ekle', 'add to cart', 'add to bag', 'add to basket', 'sepete at']

/**
 * Olayları tek tek yayar. Bir olay türü ortamda desteklenmiyorsa diğerleri
 * çalışmaya devam eder — tek bir başarısız olay yüzünden seçim kaybedilmemeli.
 */
function fire(element: HTMLElement, events: string[]): void {
  for (const type of events) {
    try {
      if (type === 'click') {
        // click() yerel aktivasyon davranışını da çalıştırır; dispatchEvent ile
        // gönderilen sentetik bir olay label→radio bağını tetiklemez.
        element.click()
        continue
      }

      const event =
        type === 'mousedown' || type === 'mouseup'
          ? new MouseEvent(type, { bubbles: true, cancelable: true })
          : new Event(type, { bubbles: true })
      element.dispatchEvent(event)
    } catch (error) {
      console.warn(`[ShoeFit] "${type}" olayı gönderilemedi:`, error)
    }
  }
}

/**
 * Envanterden gelen varyantı sayfada seçer.
 * Element türüne göre doğru etkileşimi uygular; tahmin yürütmez.
 */
export function selectVariant(option: VariantOption): boolean {
  const element = option.element
  if (!element) return false

  try {
    if (element.tagName === 'SELECT') {
      const select = element as HTMLSelectElement
      const index = Array.from(select.options).findIndex(opt => {
        const text = (opt.textContent || '').trim()
        return text === option.label || text.replace(',', '.').includes(String(option.rawValue))
      })
      if (index === -1) return false
      select.selectedIndex = index
      fire(select, ['input', 'change'])
      return true
    }

    if (element.tagName === 'INPUT' && (element as HTMLInputElement).type === 'radio') {
      const radio = element as HTMLInputElement
      if (radio.disabled) return false

      // Tema çoğu zaman görsel durumu label'a bağlar, bu yüzden hem input'u
      // işaretler hem de label'ı tıklarız.
      const label = radio.id
        ? (document.querySelector(`label[for="${escapeSelector(radio.id)}"]`) as HTMLElement | null)
        : null

      radio.checked = true

      if (label) {
        fire(label, ['mousedown', 'click', 'mouseup'])
      } else {
        fire(radio, ['click'])
      }

      if (!radio.checked) radio.checked = true
      fire(radio, ['input', 'change'])
      return true
    }

    fire(element, ['mousedown', 'click', 'mouseup'])
    fire(element, ['input', 'change'])
    return true
  } catch (error) {
    console.warn('[ShoeFit] Varyant seçilemedi:', error)
    return false
  }
}

/** Numaraya karşılık gelen varyantı bulup seçer. */
export function selectSizeByEu(snapshot: InventorySnapshot, eu: number): boolean {
  const option = findVariant(snapshot, eu)
  if (!option || !option.inStock) return false
  return selectVariant(option)
}

function isVisible(element: HTMLElement): boolean {
  if (!element.offsetParent && window.getComputedStyle(element).position !== 'fixed') return false
  const rect = element.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

/** Sepete ekle butonunu bulur — tıklamaz. */
export function findAddToCartButton(customSelector?: string): HTMLElement | null {
  if (customSelector) {
    try {
      const element = document.querySelector(customSelector) as HTMLElement | null
      if (element && isVisible(element)) return element
    } catch (error) {
      console.warn('[ShoeFit] Geçersiz sepet seçicisi:', customSelector, error)
    }
  }

  for (const selector of CART_SELECTORS) {
    const element = document.querySelector(selector) as HTMLElement | null
    if (element && isVisible(element)) return element
  }

  const candidates = Array.from(
    document.querySelectorAll('button, input[type="submit"], a.btn, a.button')
  ) as HTMLElement[]

  for (const candidate of candidates) {
    const text = (candidate.textContent || (candidate as HTMLInputElement).value || '')
      .toLowerCase()
      .trim()
    if (CART_TEXTS.some(pattern => text.includes(pattern)) && isVisible(candidate)) {
      return candidate
    }
  }

  return null
}

/**
 * Sepete ekler. Yalnızca kullanıcı açıkça istediğinde çağrılmalıdır —
 * geri alınması zor bir aksiyondur, sessizce tetiklenmemelidir.
 */
export function addToCart(customSelector?: string): boolean {
  const button = findAddToCartButton(customSelector)
  if (!button) return false
  try {
    button.click()
    return true
  } catch (error) {
    console.warn('[ShoeFit] Sepete eklenemedi:', error)
    return false
  }
}

/** Widget'ın tetikleyicisinin ekleneceği hedefi çözer. */
export function resolveMountTarget(targetSelector?: string): HTMLElement | null {
  if (targetSelector) {
    try {
      const element = document.querySelector(targetSelector) as HTMLElement | null
      if (element) return element
    } catch (error) {
      console.warn('[ShoeFit] Geçersiz hedef seçici:', targetSelector, error)
    }
  }

  const container = document.getElementById('shoefit-widget')
  if (container) return container

  const cart = findAddToCartButton()
  if (cart) return cart

  return null
}
