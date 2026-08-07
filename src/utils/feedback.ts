import { Gender } from '../data/sizeSystem'

/**
 * Kapalı geri bildirim döngüsü.
 *
 * Öneri motoru statik bir tablo olduğu sürece aynı hatayı sonsuz kez tekrar
 * eder. Burada her öneri kaydedilir, kullanıcı "nasıl geldi?" sorusunu
 * yanıtladığında sonuç eşleştirilir ve marka bazlı bir cm düzeltmesi üretilir.
 *
 * Backend opsiyoneldir: endpoint verilmezse veri tarayıcıda kalır ve
 * kalibrasyon yalnızca o kullanıcı için çalışır. Endpoint verilirse aynı olay
 * sunucuya da gönderilir ve mağaza genelinde toplanabilir.
 */

const OUTCOME_KEY = 'shoefit.outcomes.v1'
const MAX_RECORDS = 60
/** Kalibrasyonun devreye girmesi için gereken en az geri bildirim sayısı */
const MIN_SAMPLES = 3
/** Kalibrasyon bu aralığın dışına çıkamaz (cm) */
const CALIBRATION_LIMIT = 0.5
/** Tek bir geri bildirimin ürettiği düzeltme (cm) — yarım EU numarasının yarısı */
const STEP_CM = 0.33

export type FitOutcome = 'too_small' | 'perfect' | 'too_large'

export interface OutcomeRecord {
  id: string
  brand: string
  modelId?: string
  gender: Gender
  recommendedEu: number
  /** Kullanıcının gerçekten aldığı numara (biliniyorsa) */
  purchasedEu?: number
  outcome: FitOutcome | null
  storeId: string
  productId: string
  createdAt: string
  answeredAt?: string
}

let endpoint = ''

export function configureFeedback(url: string): void {
  endpoint = url || ''
}

function readRecords(): OutcomeRecord[] {
  try {
    const raw = localStorage.getItem(OUTCOME_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeRecords(records: OutcomeRecord[]): void {
  try {
    localStorage.setItem(OUTCOME_KEY, JSON.stringify(records.slice(0, MAX_RECORDS)))
  } catch (error) {
    console.warn('[ShoeFit] Geri bildirim kaydı yazılamadı:', error)
  }
}

function transmit(payload: Record<string, unknown>): void {
  const enriched = { source: 'shoefit-widget', ...payload }

  const dataLayer = (window as any).dataLayer
  if (Array.isArray(dataLayer)) {
    try {
      dataLayer.push({ event: 'shoefit_feedback', shoefit_data: enriched })
    } catch {
      /* GTM hatası akışı durdurmamalı */
    }
  }

  if (!endpoint) return
  try {
    const body = JSON.stringify(enriched)
    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }))
    } else {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true
      }).catch(() => undefined)
    }
  } catch (error) {
    console.warn('[ShoeFit] Geri bildirim gönderilemedi:', error)
  }
}

/** Kullanıcı bir öneriyle sepete gittiğinde çağrılır; sonuç henüz bilinmiyor. */
export function recordRecommendation(record: Omit<OutcomeRecord, 'id' | 'createdAt' | 'outcome'>): string {
  const id = `${record.brand}-${record.recommendedEu}-${Date.now()}`
  const entry: OutcomeRecord = {
    ...record,
    id,
    outcome: null,
    createdAt: new Date().toISOString()
  }
  writeRecords([entry, ...readRecords()])
  transmit({ type: 'recommendation', ...entry })
  return id
}

/** Kullanıcı "nasıl geldi?" sorusunu yanıtladığında çağrılır. */
export function recordOutcome(id: string, outcome: FitOutcome): void {
  const records = readRecords()
  const index = records.findIndex(record => record.id === id)
  if (index === -1) return

  records[index] = {
    ...records[index],
    outcome,
    answeredAt: new Date().toISOString()
  }
  writeRecords(records)
  transmit({ type: 'outcome', ...records[index] })
}

/** Henüz yanıtlanmamış, en az bir gün önce yapılmış öneriler. */
export function getPendingRecommendations(): OutcomeRecord[] {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  return readRecords().filter(
    record => record.outcome === null && new Date(record.createdAt).getTime() < dayAgo
  )
}

/**
 * Marka + cinsiyet için biriken geri bildirimlerden cm düzeltmesi üretir.
 *
 * "Küçük geldi" öneriyi büyütmeli (pozitif cm), "büyük geldi" küçültmeli.
 * MIN_SAMPLES altındaki veri gürültüdür, kullanılmaz.
 */
export function getCalibration(brand: string, gender: Gender): number {
  const relevant = readRecords().filter(
    record => record.brand === brand && record.gender === gender && record.outcome !== null
  )

  if (relevant.length < MIN_SAMPLES) return 0

  const total = relevant.reduce((sum, record) => {
    if (record.outcome === 'too_small') return sum + STEP_CM
    if (record.outcome === 'too_large') return sum - STEP_CM
    return sum
  }, 0)

  const average = total / relevant.length
  return Math.max(-CALIBRATION_LIMIT, Math.min(CALIBRATION_LIMIT, Math.round(average * 100) / 100))
}

/** Panel için özet istatistik. */
export function getFeedbackStats(): {
  total: number
  answered: number
  accuracy: number
  byOutcome: Record<FitOutcome, number>
} {
  const records = readRecords()
  const answered = records.filter(record => record.outcome !== null)
  const byOutcome: Record<FitOutcome, number> = { too_small: 0, perfect: 0, too_large: 0 }

  for (const record of answered) {
    if (record.outcome) byOutcome[record.outcome] += 1
  }

  return {
    total: records.length,
    answered: answered.length,
    accuracy: answered.length === 0 ? 0 : Math.round((byOutcome.perfect / answered.length) * 100),
    byOutcome
  }
}

export function clearFeedback(): void {
  try {
    localStorage.removeItem(OUTCOME_KEY)
  } catch {
    /* yok say */
  }
}
