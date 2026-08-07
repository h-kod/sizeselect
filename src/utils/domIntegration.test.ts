// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addToCart, findAddToCartButton, selectSizeByEu } from './domIntegration'
import { readInventory } from './inventory'
import { recommendSize } from './recommendationEngine'

const options = { brand: 'Adidas', gender: 'men' as const }

/** jsdem'de offsetParent hep null olduğu için görünürlük kontrolünü taklit et. */
function makeVisible() {
  Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
    configurable: true,
    get() {
      return document.body
    }
  })
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ width: 100, height: 40, top: 0, left: 0, right: 100, bottom: 40, x: 0, y: 0, toJSON: () => ({}) })
  })
}

beforeEach(() => {
  document.body.innerHTML = ''
  makeVisible()
})

describe('varyant seçimi', () => {
  it('radio varyantını işaretler ve change olayı yayar', () => {
    document.body.innerHTML = `
      <div id="sizes">
        <input type="radio" id="s-42" name="size" value="42" /><label for="s-42">42</label>
        <input type="radio" id="s-43" name="size" value="43" /><label for="s-43">43</label>
      </div>`

    const changes: string[] = []
    document.getElementById('sizes')!.addEventListener('change', event => {
      changes.push((event.target as HTMLInputElement).value)
    })

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })
    const ok = selectSizeByEu(snapshot, 43)

    expect(ok).toBe(true)
    expect((document.getElementById('s-43') as HTMLInputElement).checked).toBe(true)
    expect(changes).toContain('43')
  })

  it('select varyantını seçer', () => {
    document.body.innerHTML = `
      <select id="sizes" name="size"><option>41</option><option>42</option><option>43</option></select>`

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })
    const ok = selectSizeByEu(snapshot, 42)

    expect(ok).toBe(true)
    expect((document.getElementById('sizes') as HTMLSelectElement).value).toBe('42')
  })

  it('tükenmiş varyantı seçmeye çalışmaz', () => {
    document.body.innerHTML = `
      <div id="sizes">
        <input type="radio" id="s-42" name="size" value="42" disabled /><label for="s-42">42</label>
      </div>`

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })
    expect(selectSizeByEu(snapshot, 42)).toBe(false)
  })

  it('envanterde olmayan numara için hiçbir şeye dokunmaz', () => {
    document.body.innerHTML = `
      <div id="sizes"><button>41</button><button>42</button></div>
      <button id="unrelated">42</button>`

    const clicked = vi.fn()
    document.getElementById('unrelated')!.addEventListener('click', clicked)

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })
    selectSizeByEu(snapshot, 46)

    // Eski sürüm burada sayfadaki "42" yazan herhangi bir butona tıklıyordu.
    expect(clicked).not.toHaveBeenCalled()
  })
})

describe('sepete ekleme', () => {
  it('özel seçiciyle verilen butonu bulur', () => {
    document.body.innerHTML = '<button class="buy-now">Satın al</button>'
    expect(findAddToCartButton('.buy-now')).not.toBeNull()
  })

  it('metinden sepet butonunu tanır', () => {
    document.body.innerHTML = '<button id="c">Sepete Ekle</button>'
    expect(findAddToCartButton()?.id).toBe('c')
  })

  it('buton yoksa null döner ve tıklama denemez', () => {
    document.body.innerHTML = '<div><p>Ürün</p></div>'
    expect(findAddToCartButton()).toBeNull()
    expect(addToCart()).toBe(false)
  })

  it('yalnızca açıkça çağrıldığında tıklar', () => {
    document.body.innerHTML = '<button class="single_add_to_cart_button">Sepete ekle</button>'
    const clicked = vi.fn()
    document.querySelector('.single_add_to_cart_button')!.addEventListener('click', clicked)

    expect(clicked).not.toHaveBeenCalled()
    expect(addToCart()).toBe(true)
    expect(clicked).toHaveBeenCalledTimes(1)
  })
})

describe('uçtan uca: sayfa → öneri → seçim', () => {
  it('tükenmiş ideal numarada stoktaki en yakın varyantı seçer', () => {
    document.body.innerHTML = `
      <div id="brand">Adidas</div>
      <h1 id="title">Adidas Samba OG</h1>
      <div id="sizes">
        <input type="radio" id="z-41" name="size" value="41" /><label for="z-41">41</label>
        <input type="radio" id="z-42" name="size" value="42" disabled /><label for="z-42">42</label>
        <input type="radio" id="z-43" name="size" value="43" /><label for="z-43">43</label>
        <input type="radio" id="z-44" name="size" value="44" /><label for="z-44">44</label>
      </div>
      <button class="add-to-cart">Sepete ekle</button>`

    const snapshot = readInventory({ ...options, sizeSelector: '#sizes' })
    expect(snapshot.inStockEuSizes).toEqual([41, 43, 44])

    const result = recommendSize({
      targetBrand: 'Adidas',
      targetModelId: 'adidas-samba',
      gender: 'men',
      refBrand: 'Nike',
      refSize: '42',
      refSystem: 'EU',
      refFit: 'perfect',
      offeredEuSizes: snapshot.offeredEuSizes,
      inStockEuSizes: snapshot.inStockEuSizes
    })

    // Öneri her zaman stokta olan bir numara olmalı.
    expect(snapshot.inStockEuSizes).toContain(result.recommendedEu)

    const selected = selectSizeByEu(snapshot, result.recommendedEu)
    expect(selected).toBe(true)

    const checked = document.querySelector('input[name="size"]:checked') as HTMLInputElement
    expect(Number(checked.value)).toBe(result.recommendedEu)
  })
})
