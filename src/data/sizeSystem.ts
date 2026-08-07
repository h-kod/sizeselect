/**
 * Beden sistemi çekirdeği.
 *
 * Ayakkabı bedeni fiziksel olarak tek bir şeydir: iç kalıp uzunluğu (cm).
 * EU / US / UK bunun farklı numaralandırmalarıdır. Bu dosya tek yönlü bir
 * doğruluk kaynağı sunar: her marka için "EU 42 kaç cm" çapası verilir,
 * tüm tablolar bundan türetilir.
 *
 * Kritik nokta: US ve UK ölçekleri cinsiyete göre kayar (US kadın ≈ US erkek + 1.5).
 * Eski sürümde yalnızca erkek ölçeği vardı ve kadın kullanıcılara ~1.5 beden
 * sistematik hata üretiliyordu.
 */

export type Gender = 'men' | 'women' | 'kids'
export type SizeSystem = 'EU' | 'US' | 'UK' | 'CM'
export type WidthProfile = 'narrow' | 'standard' | 'wide'

export interface SizeRow {
  /** EU (Paris point) numarası */
  eu: number
  /** Bu cinsiyet ölçeğindeki US numarası */
  us: number
  /** Bu cinsiyet ölçeğindeki UK numarası */
  uk: number
  /** Kalıbın iç uzunluğu (cm) — tüm karşılaştırmaların temeli */
  cm: number
}

/** 1 EU numarası = 2/3 cm (Paris point) */
export const CM_PER_EU = 2 / 3

/** EU 42'nin cm karşılığı — sektör ortalaması, markasız fallback için */
export const GENERIC_CM_AT_EU42 = 26.5

const EU_SCALE_ADULT = [
  35, 35.5, 36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5, 40, 40.5,
  41, 41.5, 42, 42.5, 43, 43.5, 44, 44.5, 45, 45.5, 46, 47, 48
]

const EU_SCALE_WOMEN = [
  34, 34.5, 35, 35.5, 36, 36.5, 37, 37.5, 38, 38.5, 39, 39.5,
  40, 40.5, 41, 41.5, 42, 42.5, 43
]

const EU_SCALE_KIDS = [
  27, 27.5, 28, 28.5, 29, 30, 30.5, 31, 31.5, 32, 32.5, 33,
  33.5, 34, 34.5, 35, 35.5, 36, 37, 38
]

function round(value: number, step: number): number {
  return Math.round(value / step) * step
}

/**
 * Verilen çapaya göre bir cinsiyet için tam beden tablosu üretir.
 *
 * @param cmAtEu42 Markanın EU 42 numarasındaki iç uzunluğu (cm).
 *                 Küçük değer = marka küçük kalıyor demektir.
 */
export function buildSizeTable(cmAtEu42: number, gender: Gender): SizeRow[] {
  const scale =
    gender === 'women' ? EU_SCALE_WOMEN : gender === 'kids' ? EU_SCALE_KIDS : EU_SCALE_ADULT

  // US erkek ölçeği: cm - 18 (US 9 ≈ 27 cm). Kadın ölçeği 1.5 yukarıda,
  // çocuk ölçeği ise ayrı bir taban kullanır (US kids 1 ≈ 19.7 cm).
  const usShift = gender === 'women' ? 1.5 : gender === 'kids' ? -11.5 : 0
  // UK, US'in 0.5 altındadır; kadınlarda ölçek farkı 2.5'e çıkar.
  const ukGap = gender === 'women' ? 2.5 : 0.5

  return scale.map(eu => {
    const cm = round(cmAtEu42 + (eu - 42) * CM_PER_EU, 0.1)
    const us = round(cm - 18 + usShift, 0.5)
    return {
      eu,
      us,
      uk: round(us - ukGap, 0.5),
      cm: round(cm, 0.1)
    }
  })
}

/** Bir satırdaki, istenen sisteme karşılık gelen değeri döndürür. */
export function readSystemValue(row: SizeRow, system: SizeSystem): number {
  switch (system) {
    case 'US':
      return row.us
    case 'UK':
      return row.uk
    case 'CM':
      return row.cm
    default:
      return row.eu
  }
}

/**
 * Kullanıcının girdiği bedeni cm'ye çevirir.
 * Tablodaki en yakın satırı bulur; iki satır arasında kalıyorsa doğrusal
 * olarak ara değer üretir (yarım beden hassasiyeti için gerekli).
 */
export function sizeToCm(table: SizeRow[], value: number, system: SizeSystem): number {
  if (system === 'CM') return value
  if (table.length === 0) return GENERIC_CM_AT_EU42

  const sorted = [...table].sort(
    (a, b) => readSystemValue(a, system) - readSystemValue(b, system)
  )

  let lower: SizeRow | null = null
  let upper: SizeRow | null = null

  for (const row of sorted) {
    const rowValue = readSystemValue(row, system)
    if (rowValue <= value) lower = row
    if (rowValue >= value && upper === null) upper = row
  }

  if (lower && upper && lower !== upper) {
    const lowerValue = readSystemValue(lower, system)
    const upperValue = readSystemValue(upper, system)
    const span = upperValue - lowerValue
    const ratio = span === 0 ? 0 : (value - lowerValue) / span
    return round(lower.cm + (upper.cm - lower.cm) * ratio, 0.1)
  }

  // Tablonun dışına taşan girdi: en yakın uca göre ekstrapole et.
  const edge = lower || upper || sorted[0]
  const edgeValue = readSystemValue(edge, system)
  const perStep = system === 'EU' ? CM_PER_EU : 0.85
  return round(edge.cm + (value - edgeValue) * perStep, 0.1)
}

/** Verilen cm uzunluğuna en yakın tablo satırını döndürür. */
export function cmToRow(table: SizeRow[], cm: number): SizeRow {
  let best = table[0]
  let bestDiff = Infinity
  for (const row of table) {
    const diff = Math.abs(row.cm - cm)
    if (diff < bestDiff) {
      bestDiff = diff
      best = row
    }
  }
  return best
}

/** Bir EU numarasının tablodaki satırını döndürür (yoksa null). */
export function rowByEu(table: SizeRow[], eu: number): SizeRow | null {
  return table.find(row => Math.abs(row.eu - eu) < 0.01) || null
}

/** Numarayı gösterim için biçimler: 42 → "42", 42.5 → "42,5" (tr) / "42.5" (en) */
export function formatSize(value: number, lang: 'tr' | 'en' = 'tr'): string {
  const text = Number.isInteger(value) ? String(value) : value.toFixed(1)
  return lang === 'tr' ? text.replace('.', ',') : text
}
