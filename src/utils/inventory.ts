import { Gender, SizeSystem, readSystemValue } from '../data/sizeSystem'
import { getBrandTable } from '../data/brandProfiles'

/**
 * Ürün sayfasındaki gerçek beden varyantlarını okur.
 *
 * Bunun olmaması ürünün en pahalı hatasıydı: motor mağazada satılmayan bir
 * numarayı önerebiliyor, kullanıcı "Sepete Ekle"ye bastığında hiçbir şey
 * olmuyordu. Öneri, ancak tıklanabilir bir bedene karşılık geliyorsa değerlidir.
 */

export interface VariantOption {
  /** Ekranda görünen etiket ("42", "EU 42.5", "US 9") */
  label: string
  /** Etiketten çıkarılan sayısal değer */
  rawValue: number
  /** EU karşılığı */
  eu: number
  inStock: boolean
  /** Varyantı seçmek için kullanılacak element */
  element: HTMLElement
}

export interface InventorySnapshot {
  options: VariantOption[]
  offeredEuSizes: number[]
  inStockEuSizes: number[]
  /** Mağazanın etiketlerinde kullandığı beden sistemi */
  detectedSystem: SizeSystem
  source: 'shopify' | 'woocommerce' | 'dom' | 'none'
}

const EMPTY: InventorySnapshot = {
  options: [],
  offeredEuSizes: [],
  inStockEuSizes: [],
  detectedSystem: 'EU',
  source: 'none'
}

const OUT_OF_STOCK_PATTERNS = [
  'sold-out', 'soldout', 'sold_out',
  'out-of-stock', 'outofstock', 'out_of_stock',
  'unavailable', 'disabled', 'is-disabled',
  'tukendi', 'tükendi', 'stokta-yok', 'stoktayok'
]

const OUT_OF_STOCK_TEXT = [
  'sold out', 'out of stock', 'tükendi', 'tukendi', 'stokta yok', 'mevcut değil'
]

const SIZE_CONTAINER_HINTS = [
  '[data-shoefit-sizes]',
  '[class*="size"]', '[id*="size"]',
  '[class*="beden"]', '[id*="beden"]',
  '[class*="numara"]', '[id*="numara"]',
  '[class*="swatch"]', '[class*="variant"]'
]

/** "EU 42,5 (Son 2 ürün)" → 42.5 */
export function parseSizeLabel(text: string): number | null {
  if (!text) return null
  const cleaned = text.replace(',', '.')
  const match = cleaned.match(/(\d{1,2}(?:\.\d)?)/)
  if (!match) return null
  const value = parseFloat(match[1])
  return isNaN(value) ? null : value
}

/** Değer kümesinden mağazanın hangi sistemi kullandığını tahmin eder. */
export function detectSizeSystem(values: number[], hint?: string): SizeSystem {
  const normalizedHint = (hint || '').toUpperCase()
  if (normalizedHint === 'EU' || normalizedHint === 'US' || normalizedHint === 'UK' || normalizedHint === 'CM') {
    return normalizedHint as SizeSystem
  }

  const valid = values.filter(v => v > 0)
  if (valid.length === 0) return 'EU'

  const median = [...valid].sort((a, b) => a - b)[Math.floor(valid.length / 2)]
  if (median >= 33) return 'EU'
  if (median >= 19) return 'CM'
  return 'US'
}

function isElementOutOfStock(element: HTMLElement): boolean {
  const input = element as HTMLInputElement
  if (input.disabled) return true
  if (element.getAttribute('aria-disabled') === 'true') return true
  if (element.getAttribute('data-available') === 'false') return true
  if (element.getAttribute('data-in-stock') === 'false') return true

  const scope = [element, element.parentElement].filter(Boolean) as HTMLElement[]

  for (const node of scope) {
    const className = typeof node.className === 'string' ? node.className.toLowerCase() : ''
    if (OUT_OF_STOCK_PATTERNS.some(pattern => className.includes(pattern))) return true

    const text = (node.textContent || '').toLowerCase()
    if (OUT_OF_STOCK_TEXT.some(pattern => text.includes(pattern))) return true
  }

  // Üstü çizili / soluk gösterim tükenmiş varyantın yaygın işaretidir.
  try {
    const style = window.getComputedStyle(element)
    if (style.textDecorationLine.includes('line-through')) return true
    if (parseFloat(style.opacity || '1') < 0.45) return true
  } catch {
    /* getComputedStyle bağlam dışında çağrılırsa yok say */
  }

  return false
}

function euFromValue(value: number, system: SizeSystem, brand: string, gender: Gender): number {
  if (system === 'EU') return value

  const table = getBrandTable(brand, gender)
  let best = table[0]
  let bestDiff = Infinity
  for (const row of table) {
    const diff = Math.abs(readSystemValue(row, system) - value)
    if (diff < bestDiff) {
      bestDiff = diff
      best = row
    }
  }
  return best ? best.eu : value
}

function collectFromSelect(select: HTMLSelectElement): Array<{ label: string; value: number; inStock: boolean; element: HTMLElement }> {
  const results: Array<{ label: string; value: number; inStock: boolean; element: HTMLElement }> = []
  for (const option of Array.from(select.options)) {
    const label = (option.textContent || '').trim()
    const value = parseSizeLabel(label)
    if (value === null) continue
    const soldOutByText = OUT_OF_STOCK_TEXT.some(pattern => label.toLowerCase().includes(pattern))
    results.push({
      label,
      value,
      inStock: !option.disabled && !soldOutByText,
      element: select
    })
  }
  return results
}

/** CSS.escape her ortamda yok; id'yi güvenli biçimde kaçırmak için yedek. */
export function escapeSelector(value: string): string {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value)
  return value.replace(/([^\w-])/g, '\\$1')
}

function collectFromRadios(radios: HTMLInputElement[]) {
  return radios
    .map(radio => {
      const labelEl = radio.id
        ? (document.querySelector(`label[for="${escapeSelector(radio.id)}"]`) as HTMLElement | null)
        : null
      const label = (labelEl?.textContent || radio.value || radio.getAttribute('aria-label') || '').trim()
      const value = parseSizeLabel(label)
      if (value === null) return null
      return {
        label,
        value,
        inStock: !isElementOutOfStock(radio) && (!labelEl || !isElementOutOfStock(labelEl)),
        element: radio as HTMLElement
      }
    })
    .filter(Boolean) as Array<{ label: string; value: number; inStock: boolean; element: HTMLElement }>
}

function collectFromButtons(container: Element) {
  const items = Array.from(
    container.querySelectorAll('button, [role="button"], label, li, a')
  ) as HTMLElement[]

  return items
    .map(item => {
      // Alt elemanı olan kapsayıcıları atla, yalnızca yaprak düğümleri al.
      if (item.querySelector('button, [role="button"], input')) return null
      const label = (item.textContent || '').trim()
      if (!label || label.length > 24) return null
      const value = parseSizeLabel(label)
      if (value === null) return null
      return {
        label,
        value,
        inStock: !isElementOutOfStock(item),
        element: item
      }
    })
    .filter(Boolean) as Array<{ label: string; value: number; inStock: boolean; element: HTMLElement }>
}

/** Shopify ürün JSON'u sayfada gömülü geliyorsa kesin veriyi oradan al. */
function readShopifyVariants(): Array<{ label: string; value: number; inStock: boolean }> | null {
  try {
    const meta = (window as any).ShopifyAnalytics?.meta?.product
    const variants = meta?.variants
    if (Array.isArray(variants) && variants.length > 0) {
      const parsed = variants
        .map((variant: any) => {
          const label = String(variant.public_title || variant.name || '').trim()
          const value = parseSizeLabel(label)
          if (value === null) return null
          return { label, value, inStock: variant.available !== false }
        })
        .filter(Boolean)
      if (parsed.length > 0) return parsed as Array<{ label: string; value: number; inStock: boolean }>
    }

    const jsonScript = document.querySelector(
      'script[type="application/json"][id^="ProductJson"], script[data-product-json]'
    )
    if (jsonScript?.textContent) {
      const data = JSON.parse(jsonScript.textContent)
      if (Array.isArray(data?.variants)) {
        const parsed = data.variants
          .map((variant: any) => {
            const label = String(variant.public_title || variant.title || '').trim()
            const value = parseSizeLabel(label)
            if (value === null) return null
            return { label, value, inStock: variant.available !== false }
          })
          .filter(Boolean)
        if (parsed.length > 0) return parsed as Array<{ label: string; value: number; inStock: boolean }>
      }
    }
  } catch (error) {
    console.warn('[ShoeFit] Shopify varyant okuması başarısız:', error)
  }
  return null
}

/** WooCommerce varyasyon formu varyantları data attribute içinde taşır. */
function readWooVariants(): Array<{ label: string; value: number; inStock: boolean }> | null {
  try {
    const form = document.querySelector('form.variations_form[data-product_variations]')
    const raw = form?.getAttribute('data-product_variations')
    if (!raw || raw === 'false') return null

    const variations = JSON.parse(raw)
    if (!Array.isArray(variations)) return null

    const parsed = variations
      .map((variation: any) => {
        const attributes = variation.attributes || {}
        const label = String(Object.values(attributes)[0] ?? '').trim()
        const value = parseSizeLabel(label)
        if (value === null) return null
        return { label, value, inStock: variation.is_in_stock !== false }
      })
      .filter(Boolean)

    return parsed.length > 0 ? (parsed as Array<{ label: string; value: number; inStock: boolean }>) : null
  } catch (error) {
    console.warn('[ShoeFit] WooCommerce varyant okuması başarısız:', error)
  }
  return null
}

export interface ReadInventoryOptions {
  /** Merchant'ın verdiği beden seçici CSS'i */
  sizeSelector?: string
  /** Mağazanın kullandığı beden sistemi ipucu */
  systemHint?: string
  brand: string
  gender: Gender
}

export function readInventory(options: ReadInventoryOptions): InventorySnapshot {
  const { sizeSelector, systemHint, brand, gender } = options

  const build = (
    rows: Array<{ label: string; value: number; inStock: boolean; element?: HTMLElement }>,
    source: InventorySnapshot['source']
  ): InventorySnapshot => {
    const deduped = new Map<number, { label: string; value: number; inStock: boolean; element?: HTMLElement }>()
    for (const row of rows) {
      const existing = deduped.get(row.value)
      // Aynı numara birden çok kez geçiyorsa stokta olanı tut.
      if (!existing || (!existing.inStock && row.inStock)) deduped.set(row.value, row)
    }

    const unique = Array.from(deduped.values()).sort((a, b) => a.value - b.value)
    if (unique.length === 0) return EMPTY

    const detectedSystem = detectSizeSystem(unique.map(r => r.value), systemHint)

    const optionList: VariantOption[] = unique.map(row => ({
      label: row.label,
      rawValue: row.value,
      eu: euFromValue(row.value, detectedSystem, brand, gender),
      inStock: row.inStock,
      element: row.element as HTMLElement
    }))

    return {
      options: optionList,
      offeredEuSizes: optionList.map(o => o.eu),
      inStockEuSizes: optionList.filter(o => o.inStock).map(o => o.eu),
      detectedSystem,
      source
    }
  }

  // 1. Platform verisi — en güvenilir kaynak.
  const shopify = readShopifyVariants()
  if (shopify) return build(shopify, 'shopify')

  const woo = readWooVariants()
  if (woo) return build(woo, 'woocommerce')

  // 2. Merchant'ın verdiği seçici.
  if (sizeSelector) {
    try {
      const nodes = Array.from(document.querySelectorAll(sizeSelector)) as HTMLElement[]
      const rows: Array<{ label: string; value: number; inStock: boolean; element: HTMLElement }> = []

      for (const node of nodes) {
        if (node.tagName === 'SELECT') {
          rows.push(...collectFromSelect(node as HTMLSelectElement))
        } else if (node.tagName === 'INPUT' && (node as HTMLInputElement).type === 'radio') {
          rows.push(...collectFromRadios([node as HTMLInputElement]))
        } else {
          const radios = Array.from(node.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]
          if (radios.length > 0) {
            rows.push(...collectFromRadios(radios))
          } else {
            rows.push(...collectFromButtons(node))
          }
        }
      }

      if (rows.length > 0) return build(rows, 'dom')
    } catch (error) {
      console.warn('[ShoeFit] Geçersiz beden seçicisi:', sizeSelector, error)
    }
  }

  // 3. Sayfa üzerinde sezgisel arama.
  const selects = Array.from(
    document.querySelectorAll('select[name*="size" i], select[id*="size" i], select[class*="size" i], select[name*="beden" i]')
  ) as HTMLSelectElement[]
  for (const select of selects) {
    const rows = collectFromSelect(select)
    if (rows.length >= 2) return build(rows, 'dom')
  }

  const sizeRadios = (Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]).filter(radio => {
    const haystack = `${radio.name} ${radio.id}`.toLowerCase()
    return haystack.includes('size') || haystack.includes('beden') || haystack.includes('numara')
  })
  if (sizeRadios.length >= 2) {
    const rows = collectFromRadios(sizeRadios)
    if (rows.length >= 2) return build(rows, 'dom')
  }

  for (const hint of SIZE_CONTAINER_HINTS) {
    let containers: Element[] = []
    try {
      containers = Array.from(document.querySelectorAll(hint))
    } catch {
      continue
    }
    for (const container of containers) {
      const rows = collectFromButtons(container)
      // En az üç sayısal seçenek olmadan bunun bir beden ızgarası olduğuna güvenmeyiz.
      if (rows.length >= 3) return build(rows, 'dom')
    }
  }

  return EMPTY
}

/** Belirli bir EU numarasına karşılık gelen varyantı bulur. */
export function findVariant(snapshot: InventorySnapshot, eu: number): VariantOption | null {
  return snapshot.options.find(option => Math.abs(option.eu - eu) < 0.01) || null
}
