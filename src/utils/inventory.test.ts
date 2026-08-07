// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { detectSizeSystem, parseSizeLabel, readInventory } from './inventory'

const options = { brand: 'Nike', gender: 'men' as const }

beforeEach(() => {
  document.body.innerHTML = ''
  delete (window as any).ShopifyAnalytics
})

describe('etiket ayrıştırma', () => {
  it('sayısal bedeni gürültünün içinden çıkarır', () => {
    expect(parseSizeLabel('42')).toBe(42)
    expect(parseSizeLabel('EU 42,5')).toBe(42.5)
    expect(parseSizeLabel('42.5 (Son 2 ürün)')).toBe(42.5)
    expect(parseSizeLabel('US 9')).toBe(9)
  })

  it('sayı içermeyen etiket için null döner', () => {
    expect(parseSizeLabel('Tek ebat')).toBeNull()
    expect(parseSizeLabel('')).toBeNull()
  })
})

describe('sistem tespiti', () => {
  it('değer aralığından sistemi tahmin eder', () => {
    expect(detectSizeSystem([39, 40, 41, 42, 43])).toBe('EU')
    expect(detectSizeSystem([24, 25, 26, 27])).toBe('CM')
    expect(detectSizeSystem([7, 8, 9, 10])).toBe('US')
  })

  it('açık ipucu her zaman kazanır', () => {
    expect(detectSizeSystem([39, 40, 41], 'US')).toBe('US')
  })
})

describe('DOM üzerinden envanter okuma', () => {
  it('radio tabanlı beden ızgarasını okur ve devre dışı olanları tükenmiş sayar', () => {
    document.body.innerHTML = `
      <div id="sizes">
        <input type="radio" id="s-41" name="size" value="41" /><label for="s-41">41</label>
        <input type="radio" id="s-42" name="size" value="42" /><label for="s-42">42</label>
        <input type="radio" id="s-43" name="size" value="43" disabled /><label for="s-43">43</label>
      </div>`

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })

    expect(snapshot.source).toBe('dom')
    expect(snapshot.offeredEuSizes).toEqual([41, 42, 43])
    expect(snapshot.inStockEuSizes).toEqual([41, 42])
  })

  it('select içindeki tükenmiş seçenekleri metinden tanır', () => {
    document.body.innerHTML = `
      <select id="size-select" name="size">
        <option>40</option>
        <option>41 - Tükendi</option>
        <option>42</option>
      </select>`

    const snapshot = readInventory({ ...options, sizeSelector: '#size-select' })

    expect(snapshot.offeredEuSizes).toEqual([40, 41, 42])
    expect(snapshot.inStockEuSizes).toEqual([40, 42])
  })

  it('buton ızgarasında sold-out sınıfını tanır', () => {
    document.body.innerHTML = `
      <div id="sizes">
        <button>41</button>
        <button class="sold-out">42</button>
        <button>43</button>
      </div>`

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })

    expect(snapshot.inStockEuSizes).toEqual([41, 43])
  })

  it('US etiketli bedenleri EU karşılığına çevirir', () => {
    document.body.innerHTML = `
      <div id="sizes">
        <button>8</button><button>8.5</button><button>9</button>
      </div>`

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes', systemHint: 'US' })

    expect(snapshot.detectedSystem).toBe('US')
    // US 9 ≈ EU 42–43 aralığı; ham değerin kendisi geri dönmemeli.
    snapshot.offeredEuSizes.forEach(eu => {
      expect(eu).toBeGreaterThan(38)
      expect(eu).toBeLessThan(46)
    })
  })

  it('beden ızgarası yoksa boş sonuç döner', () => {
    document.body.innerHTML = '<div><p>Ürün açıklaması</p></div>'
    const snapshot = readInventory({ ...options })
    expect(snapshot.source).toBe('none')
    expect(snapshot.offeredEuSizes).toHaveLength(0)
  })

  it('geçersiz seçici hata fırlatmaz', () => {
    document.body.innerHTML = '<div id="sizes"><button>42</button></div>'
    expect(() => readInventory({ ...options, sizeSelector: ':::' })).not.toThrow()
  })
})

describe('platform verisi', () => {
  it('Shopify varyantları DOM taramasının önüne geçer', () => {
    document.body.innerHTML = '<div id="sizes"><button>36</button><button>37</button><button>38</button></div>'
    ;(window as any).ShopifyAnalytics = {
      meta: {
        product: {
          variants: [
            { public_title: '42', available: true },
            { public_title: '43', available: false },
            { public_title: '44', available: true }
          ]
        }
      }
    }

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })

    expect(snapshot.source).toBe('shopify')
    expect(snapshot.offeredEuSizes).toEqual([42, 43, 44])
    expect(snapshot.inStockEuSizes).toEqual([42, 44])
  })

  it('WooCommerce varyasyon formunu okur', () => {
    const variations = JSON.stringify([
      { attributes: { attribute_pa_beden: '41' }, is_in_stock: true },
      { attributes: { attribute_pa_beden: '42' }, is_in_stock: false }
    ])
    document.body.innerHTML = `<form class="variations_form" data-product_variations='${variations}'></form>`

    const snapshot = readInventory({ ...options })

    expect(snapshot.source).toBe('woocommerce')
    expect(snapshot.offeredEuSizes).toEqual([41, 42])
    expect(snapshot.inStockEuSizes).toEqual([41])
  })
})
