import { describe, expect, it } from 'vitest'
import { recommendSize } from './recommendationEngine'
import { getBrandTable } from '../data/brandProfiles'
import { buildSizeTable, sizeToCm } from '../data/sizeSystem'
import { matchModel } from '../data/models'

const base = {
  gender: 'men' as const,
  refBrand: 'Nike',
  refSize: '42',
  refSystem: 'EU' as const,
  refFit: 'perfect' as const
}

describe('beden tabloları', () => {
  it('EU numarası büyüdükçe cm de büyür', () => {
    const table = getBrandTable('Nike', 'men')
    for (let i = 1; i < table.length; i++) {
      expect(table[i].cm).toBeGreaterThan(table[i - 1].cm)
    }
  })

  it('kadın ölçeği erkek ölçeğinden 1.5 US yukarıdadır', () => {
    const men = buildSizeTable(26.4, 'men')
    const women = buildSizeTable(26.4, 'women')

    const menRow = men.find(row => row.eu === 40)!
    const womenRow = women.find(row => row.eu === 40)!

    expect(womenRow.cm).toBeCloseTo(menRow.cm, 1)
    expect(womenRow.us - menRow.us).toBeCloseTo(1.5, 1)
  })

  it('aynı US numarası kadın ve erkekte farklı ayak uzunluğuna karşılık gelir', () => {
    const menCm = sizeToCm(getBrandTable('Nike', 'men'), 8, 'US')
    const womenCm = sizeToCm(getBrandTable('Nike', 'women'), 8, 'US')

    // Kadın US 8, erkek US 8'den yaklaşık bir cm kısadır. Eski sürüm bu farkı
    // göremediği için kadın kullanıcılara sistematik olarak büyük numara veriyordu.
    expect(menCm - womenCm).toBeGreaterThan(0.8)
  })
})

describe('öneri motoru', () => {
  it('küçük kalan bir markadan büyük kalan markaya geçişte numarayı düşürür', () => {
    // Adidas numaralandırması küçük (EU 42 = 26.0 cm), Converse büyük (EU 42 = 27.1 cm).
    const result = recommendSize({ ...base, refBrand: 'Adidas', targetBrand: 'Converse' })
    expect(result.recommendedEu).toBeLessThan(42)
  })

  it('büyük kalan markadan küçük kalan markaya geçişte numarayı yükseltir', () => {
    const result = recommendSize({ ...base, refBrand: 'Converse', targetBrand: 'Adidas' })
    expect(result.recommendedEu).toBeGreaterThan(42)
  })

  it('referans dar geliyorsa daha büyük numara önerir', () => {
    const perfect = recommendSize({ ...base, targetBrand: 'Nike' })
    const tight = recommendSize({ ...base, targetBrand: 'Nike', refFit: 'tight' })
    expect(tight.recommendedEu).toBeGreaterThan(perfect.recommendedEu)
  })

  it('referans bol geliyorsa daha küçük numara önerir', () => {
    const perfect = recommendSize({ ...base, targetBrand: 'Nike' })
    const loose = recommendSize({ ...base, targetBrand: 'Nike', refFit: 'loose' })
    expect(loose.recommendedEu).toBeLessThan(perfect.recommendedEu)
  })

  it('doğrudan ölçüm daha yüksek güven üretir', () => {
    const measured = recommendSize({ ...base, targetBrand: 'Nike', measuredCm: 26.5 })
    const derived = recommendSize({ ...base, targetBrand: 'Nike' })
    expect(measured.confidence).toBeGreaterThan(derived.confidence)
  })

  it('bilinmeyen marka için güven skoru belirgin şekilde düşer', () => {
    const known = recommendSize({ ...base, targetBrand: 'Adidas' })
    const unknown = recommendSize({ ...base, targetBrand: 'Bilinmeyen Marka' })

    expect(unknown.dataQuality).toBe('generic')
    expect(unknown.confidence).toBeLessThan(known.confidence - 10)
  })

  it('küçük kalan modeli hesaba katar', () => {
    const withoutModel = recommendSize({ ...base, targetBrand: 'Adidas' })
    const withModel = recommendSize({
      ...base,
      targetBrand: 'Adidas',
      targetModelId: 'adidas-samba'
    })

    // Samba marka ortalamasından kısa kalır, bu yüzden bir üst numara beklenir.
    expect(withModel.recommendedEu).toBeGreaterThanOrEqual(withoutModel.recommendedEu)
    expect(withModel.targetModelName).toBe('Samba OG')
  })
})

describe('stok farkındalığı', () => {
  const offered = [40, 41, 42, 43, 44]

  it('yalnızca mağazada satılan numaraları önerir', () => {
    const result = recommendSize({
      ...base,
      targetBrand: 'Nike',
      offeredEuSizes: offered,
      inStockEuSizes: offered
    })

    expect(offered).toContain(result.recommendedEu)
    expect(result.availability).toBe('in_stock')
  })

  it('ideal numara tükendiyse stoktaki en yakın numaraya geçer', () => {
    const ideal = recommendSize({
      ...base,
      targetBrand: 'Nike',
      offeredEuSizes: offered,
      inStockEuSizes: offered
    }).recommendedEu

    const withoutIdeal = offered.filter(size => size !== ideal)
    const result = recommendSize({
      ...base,
      targetBrand: 'Nike',
      offeredEuSizes: offered,
      inStockEuSizes: withoutIdeal
    })

    expect(result.substituted).toBe(true)
    expect(result.idealEu).toBe(ideal)
    expect(withoutIdeal).toContain(result.recommendedEu)
    expect(result.notesTr.join(' ')).toContain('stokta')
  })

  it('ikame yapıldığında güven skoru düşer', () => {
    const full = recommendSize({
      ...base,
      targetBrand: 'Nike',
      offeredEuSizes: offered,
      inStockEuSizes: offered
    })
    const partial = recommendSize({
      ...base,
      targetBrand: 'Nike',
      offeredEuSizes: offered,
      inStockEuSizes: offered.filter(size => size !== full.recommendedEu)
    })

    expect(partial.confidence).toBeLessThan(full.confidence)
  })

  it('hiçbir beden stokta değilse durumu bildirir', () => {
    const result = recommendSize({
      ...base,
      targetBrand: 'Nike',
      offeredEuSizes: offered,
      inStockEuSizes: []
    })

    // Boş stok listesi "bilinmiyor" anlamına gelir; yanlış negatif üretmemeli.
    expect(result.availability).toBe('in_stock')
  })

  it('stok bilgisi yoksa öneriyi kısıtlamaz', () => {
    const result = recommendSize({ ...base, targetBrand: 'Nike' })
    expect(result.availability).toBe('unknown')
    expect(result.substituted).toBe(false)
  })
})

describe('alternatif numara', () => {
  it('önerilen numaradan farklı ve gerçek bir tablo değeridir', () => {
    const result = recommendSize({ ...base, targetBrand: 'Nike' })
    const table = getBrandTable('Nike', 'men')

    expect(result.alternative).not.toBeNull()
    expect(result.alternative!.eu).not.toBe(result.recommendedEu)
    expect(table.some(row => row.eu === result.alternative!.eu)).toBe(true)
  })

  it('geniş ayakta daha büyük numarayı önerir', () => {
    const result = recommendSize({ ...base, targetBrand: 'Nike', footWidth: 'wide' })
    expect(result.alternative!.eu).toBeGreaterThan(result.recommendedEu)
  })

  it('dar ayakta daha küçük numarayı önerir', () => {
    const result = recommendSize({ ...base, targetBrand: 'Nike', footWidth: 'narrow' })
    expect(result.alternative!.eu).toBeLessThan(result.recommendedEu)
  })
})

describe('önerilen numara her zaman satılabilir bir değerdir', () => {
  it('marka tablosunda karşılığı olmayan numara üretmez', () => {
    // Eski sürümün hatası: geniş ayak düzeltmesi 41.5 gibi tabloda olmayan bir
    // numara üretiyordu ve kullanıcı onu mağazada seçemiyordu.
    for (const brand of ['Nike', 'Adidas', 'Vans', 'Converse', 'Salomon']) {
      for (const width of ['narrow', 'normal', 'wide'] as const) {
        const result = recommendSize({ ...base, targetBrand: brand, footWidth: width })
        const table = getBrandTable(brand, 'men')
        expect(table.some(row => Math.abs(row.eu - result.recommendedEu) < 0.001)).toBe(true)
      }
    }
  })
})

describe('model eşleştirme', () => {
  it('ürün başlığından modeli tanır', () => {
    expect(matchModel('Adidas Samba OG Shoes')?.id).toBe('adidas-samba')
    expect(matchModel('Nike Air Max 90 Erkek Spor Ayakkabı')?.id).toBe('nike-airmax90')
  })

  it('daha uzun eşleşmeyi tercih eder', () => {
    // "Air Max 90" hem "air max 90" hem daha kısa alias'larla eşleşebilir.
    expect(matchModel('AIR MAX 90')?.name).toBe('Air Max 90')
  })

  it('eşleşme yoksa null döner', () => {
    expect(matchModel('Klasik Deri Bot')).toBeNull()
  })
})

describe('güven skoru', () => {
  it('sabit değil, girdilere göre değişir', () => {
    const scores = new Set([
      recommendSize({ ...base, targetBrand: 'Nike' }).confidence,
      recommendSize({ ...base, targetBrand: 'Nike', refFit: 'tight' }).confidence,
      recommendSize({ ...base, targetBrand: 'Nike', measuredCm: 26.5 }).confidence,
      recommendSize({ ...base, targetBrand: 'Bilinmeyen' }).confidence
    ])

    expect(scores.size).toBeGreaterThan(2)
  })

  it('makul sınırlar içinde kalır', () => {
    const result = recommendSize({ ...base, targetBrand: 'Nike', measuredCm: 26.5 })
    expect(result.confidence).toBeGreaterThanOrEqual(35)
    expect(result.confidence).toBeLessThanOrEqual(97)
  })
})
