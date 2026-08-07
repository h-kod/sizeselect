import { Gender, SizeRow, SizeSystem, cmToRow, sizeToCm } from '../data/sizeSystem'
import { getBrandProfile, getBrandTable } from '../data/brandProfiles'
import { getModelById, ShoeModel } from '../data/models'

export type { Gender, SizeSystem }
export type FitFeedback = 'tight' | 'perfect' | 'loose'
export type FootWidth = 'narrow' | 'normal' | 'wide'
export type Availability = 'in_stock' | 'out_of_stock' | 'not_offered' | 'unknown'

export interface RecommendationInput {
  targetBrand: string
  targetModelId?: string
  gender: Gender

  /** Yol A — referans ayakkabı */
  refBrand?: string
  refModelId?: string
  refSize?: string
  refSystem?: SizeSystem
  refFit?: FitFeedback

  /** Yol B — doğrudan ölçüm (cm). Verilirse referans yolu yok sayılır. */
  measuredCm?: number

  footWidth?: FootWidth

  /** Mağazada satılan bedenler (EU). Boşsa stok kısıtı uygulanmaz. */
  offeredEuSizes?: number[]
  /** Bunlardan hangileri stokta. Boşsa hepsi stokta varsayılır. */
  inStockEuSizes?: number[]

  /** Geri bildirim döngüsünden gelen cm düzeltmesi */
  calibrationCm?: number
}

export interface RecommendationFactor {
  labelTr: string
  labelEn: string
  /** Bu etkenin öneriye kattığı EU numarası kayması */
  deltaEu: number
}

export interface AlternativeSize {
  eu: number
  availability: Availability
  reasonTr: string
  reasonEn: string
}

export interface RecommendationResult {
  /** Hesaplanan ayak uzunluğu (cm) */
  footCm: number
  /** Stok kısıtı uygulanmadan önceki ideal numara */
  idealEu: number
  /** Kullanıcıya sunulan numara */
  recommendedEu: number
  /** Stok yüzünden ideal numaradan sapıldı mı */
  substituted: boolean
  availability: Availability
  alternative: AlternativeSize | null
  confidence: number
  riskLevel: 'low' | 'medium' | 'high'
  dataQuality: 'calibrated' | 'derived' | 'generic'
  explanationTr: string
  explanationEn: string
  notesTr: string[]
  notesEn: string[]
  factors: RecommendationFactor[]
  targetModelName: string | null
}

const CM_PER_EU = 2 / 3
const FIT_ADJUST_CM = 0.4

const round1 = (value: number) => Math.round(value * 10) / 10

function resolveModel(id: string | undefined): ShoeModel | null {
  return id ? getModelById(id) : null
}

/**
 * Mağazanın gerçekten sattığı bedenler içinden hedefe en yakın olanı seçer.
 * Stoktakiler her zaman önceliklidir: stokta olmayan bir numarayı önermek,
 * kullanıcıyı sepete ekleyemeyeceği bir yola sokmak demektir.
 */
function snapToOffered(
  targetEu: number,
  offered: number[],
  inStock: number[]
): { eu: number; availability: Availability; substituted: boolean } {
  if (offered.length === 0) {
    return { eu: targetEu, availability: 'unknown', substituted: false }
  }

  const stockSet = new Set(inStock)
  const isOffered = offered.some(eu => Math.abs(eu - targetEu) < 0.01)
  const isInStock = stockSet.has(targetEu)

  if (isOffered && (isInStock || inStock.length === 0)) {
    return { eu: targetEu, availability: 'in_stock', substituted: false }
  }

  const pickNearest = (pool: number[]) =>
    pool.reduce(
      (best, eu) =>
        Math.abs(eu - targetEu) < Math.abs(best - targetEu) ? eu : best,
      pool[0]
    )

  const stocked = offered.filter(eu => stockSet.has(eu))
  if (stocked.length > 0) {
    return { eu: pickNearest(stocked), availability: 'in_stock', substituted: true }
  }

  if (isOffered) {
    return { eu: targetEu, availability: 'out_of_stock', substituted: false }
  }

  return { eu: pickNearest(offered), availability: 'not_offered', substituted: true }
}

function availabilityOf(eu: number, offered: number[], inStock: number[]): Availability {
  if (offered.length === 0) return 'unknown'
  if (!offered.some(o => Math.abs(o - eu) < 0.01)) return 'not_offered'
  if (inStock.length === 0) return 'in_stock'
  return inStock.some(s => Math.abs(s - eu) < 0.01) ? 'in_stock' : 'out_of_stock'
}

/** İdeal cm'ye ikinci en yakın tablo satırını gerçek alternatif olarak seçer. */
function pickAlternative(
  table: SizeRow[],
  footCm: number,
  recommendedEu: number,
  footWidth: FootWidth,
  offered: number[],
  inStock: number[]
): AlternativeSize | null {
  const candidates = table
    .filter(row => Math.abs(row.eu - recommendedEu) > 0.01)
    .sort((a, b) => Math.abs(a.cm - footCm) - Math.abs(b.cm - footCm))

  // Geniş ayakta büyük komşuyu, dar ayakta küçük komşuyu tercih et.
  const preferLarger = footWidth === 'wide'
  const preferSmaller = footWidth === 'narrow'

  const directional = candidates.find(row =>
    preferLarger ? row.eu > recommendedEu : preferSmaller ? row.eu < recommendedEu : false
  )

  const chosen = directional || candidates[0]
  if (!chosen) return null

  const larger = chosen.eu > recommendedEu
  return {
    eu: chosen.eu,
    availability: availabilityOf(chosen.eu, offered, inStock),
    reasonTr: larger
      ? 'Daha bol bir oturuş veya kalın çorap kullanımı için.'
      : 'Daha sıkı, ayağı saran bir oturuş için.',
    reasonEn: larger
      ? 'For a roomier fit or thicker socks.'
      : 'For a tighter, more locked-in fit.'
  }
}

export function recommendSize(input: RecommendationInput): RecommendationResult {
  const {
    targetBrand,
    targetModelId,
    gender,
    refBrand,
    refModelId,
    refSize,
    refSystem = 'EU',
    refFit = 'perfect',
    measuredCm,
    footWidth = 'normal',
    offeredEuSizes = [],
    inStockEuSizes = [],
    calibrationCm = 0
  } = input

  const notesTr: string[] = []
  const notesEn: string[] = []
  const factors: RecommendationFactor[] = []

  const targetProfile = getBrandProfile(targetBrand)
  const targetTable = getBrandTable(targetBrand, gender)
  const targetModel = resolveModel(targetModelId)

  const measured = typeof measuredCm === 'number' && measuredCm > 0
  let footCm: number
  let baseConfidence: number

  if (measured) {
    footCm = measuredCm as number
    baseConfidence = 92
  } else {
    const brand = refBrand || targetBrand
    const refTable = getBrandTable(brand, gender)
    const refModel = resolveModel(refModelId)
    const numericRefSize = parseFloat(String(refSize ?? '42').replace(',', '.'))

    const rawCm = sizeToCm(refTable, isNaN(numericRefSize) ? 42 : numericRefSize, refSystem)

    // Referans model kendi markasının ortalamasından sapıyorsa, kullanıcının
    // ayağı o numaranın nominal değerinden farklıdır.
    footCm = rawCm - (refModel?.lastOffsetCm ?? 0)
    if (refModel && refModel.lastOffsetCm !== 0) {
      factors.push({
        labelTr: `${refModel.name} kalıbı`,
        labelEn: `${refModel.name} last`,
        deltaEu: round1(-refModel.lastOffsetCm / CM_PER_EU)
      })
    }

    if (refFit === 'tight') {
      footCm += FIT_ADJUST_CM
      notesTr.push('Referans ayakkabınız sıktığı için ayak ölçünüz yukarı düzeltildi.')
      notesEn.push('Your reference shoe felt tight, so the estimate was adjusted upward.')
      factors.push({
        labelTr: 'Referans dar geliyordu',
        labelEn: 'Reference felt tight',
        deltaEu: round1(FIT_ADJUST_CM / CM_PER_EU)
      })
    } else if (refFit === 'loose') {
      footCm -= FIT_ADJUST_CM
      notesTr.push('Referans ayakkabınız bol geldiği için ayak ölçünüz aşağı düzeltildi.')
      notesEn.push('Your reference shoe felt loose, so the estimate was adjusted downward.')
      factors.push({
        labelTr: 'Referans bol geliyordu',
        labelEn: 'Reference felt loose',
        deltaEu: round1(-FIT_ADJUST_CM / CM_PER_EU)
      })
    }

    baseConfidence = 78

    const refProfile = getBrandProfile(brand)
    if (refProfile.dataQuality === 'generic') {
      notesTr.push(`${brand} için doğrulanmış beden tablomuz yok; sektör ortalaması kullanıldı.`)
      notesEn.push(`No verified size chart for ${brand}; an industry average was used.`)
    }
  }

  if (calibrationCm !== 0) {
    footCm += calibrationCm
    factors.push({
      labelTr: 'Müşteri geri bildirimi düzeltmesi',
      labelEn: 'Customer feedback correction',
      deltaEu: round1(calibrationCm / CM_PER_EU)
    })
    notesTr.push('Bu marka için gelen müşteri geri bildirimleri öneriye yansıtıldı.')
    notesEn.push('Customer feedback for this brand was folded into the recommendation.')
  }

  footCm = round1(footCm)

  // Hedef modelin kalıp sapması: model küçük kalıyorsa daha uzun bir kalıp aranır.
  const targetOffset = targetModel?.lastOffsetCm ?? 0
  const searchCm = round1(footCm - targetOffset)
  if (targetModel && targetOffset !== 0) {
    factors.push({
      labelTr: `${targetModel.name} kalıbı`,
      labelEn: `${targetModel.name} last`,
      deltaEu: round1(-targetOffset / CM_PER_EU)
    })
  }

  const idealRow = cmToRow(targetTable, searchCm)
  let idealEu = idealRow.eu
  const residualCm = Math.abs(idealRow.cm - searchCm)

  // Genişlik: cm'yi değil, komşu numaraya geçiş eşiğini etkiler.
  const effectiveWidth = targetModel?.widthProfile ?? targetProfile.widthProfile
  if (footWidth === 'wide' && effectiveWidth === 'narrow') {
    const upgraded = targetTable.find(row => row.eu > idealEu)
    if (upgraded) {
      idealEu = upgraded.eu
      factors.push({
        labelTr: 'Geniş ayak + dar kalıp',
        labelEn: 'Wide foot + narrow last',
        deltaEu: round1(upgraded.eu - idealRow.eu)
      })
      notesTr.push('Taraklı ayak yapınız ve bu modelin dar kalıbı nedeniyle bir üst numara önerildi.')
      notesEn.push('A size up was recommended for your wide feet on this narrow last.')
    }
  } else if (footWidth === 'narrow' && effectiveWidth === 'wide') {
    notesTr.push('Bu model geniş kalıplıdır; dar ayak yapınızda bağcıkları sıkı bağlamanız gerekebilir.')
    notesEn.push('This model runs wide; with narrow feet you may need to lace it tightly.')
  }

  const snapped = snapToOffered(idealEu, offeredEuSizes, inStockEuSizes)
  const recommendedEu = snapped.eu

  if (snapped.substituted) {
    if (snapped.availability === 'in_stock' && offeredEuSizes.length > 0) {
      notesTr.push(
        `İdeal numaranız ${formatEu(idealEu)} ancak bu üründe stokta yok. Stoktaki en yakın numara gösteriliyor.`
      )
      notesEn.push(
        `Your ideal size is ${formatEu(idealEu)}, but it is out of stock for this product. Showing the closest available size.`
      )
    } else {
      notesTr.push(`Bu ürün ${formatEu(idealEu)} numarada satılmıyor; en yakın numara gösteriliyor.`)
      notesEn.push(`This product is not offered in ${formatEu(idealEu)}; showing the closest size.`)
    }
  } else if (snapped.availability === 'out_of_stock') {
    notesTr.push('Önerilen numara şu anda stokta görünmüyor.')
    notesEn.push('The recommended size appears to be out of stock.')
  }

  const alternative = pickAlternative(
    targetTable,
    searchCm,
    recommendedEu,
    footWidth,
    offeredEuSizes,
    inStockEuSizes
  )

  // ---- Güven skoru: gerçek değişkenlere bağlı ----
  let confidence = baseConfidence

  confidence += targetProfile.dataQuality === 'calibrated' ? 6 : targetProfile.dataQuality === 'generic' ? -14 : 0
  if (!measured) {
    const refQuality = getBrandProfile(refBrand || targetBrand).dataQuality
    confidence += refQuality === 'calibrated' ? 4 : refQuality === 'generic' ? -10 : 0
    confidence += refFit === 'perfect' ? 3 : -5
  }
  confidence += targetModel ? 5 : -2
  if (residualCm > 0.25) confidence -= 6
  if (calibrationCm !== 0) confidence += 4
  if (footWidth !== 'normal' && effectiveWidth !== 'standard') confidence -= 4
  if (snapped.substituted) confidence -= 15
  if (snapped.availability === 'out_of_stock') confidence -= 5

  confidence = Math.max(35, Math.min(97, Math.round(confidence)))

  const riskLevel: 'low' | 'medium' | 'high' =
    confidence >= 80 ? 'low' : confidence >= 62 ? 'medium' : 'high'

  // ---- Açıklama ----
  const modelSuffix = targetModel ? ` ${targetModel.name}` : ''
  const explanationTr = measured
    ? `${footCm} cm ayak ölçünüze göre ${targetBrand}${modelSuffix} için en uygun numara EU ${formatEu(recommendedEu)}.`
    : `${refBrand || targetBrand} ${refSize} ${refSystem} bedeninizin karşılığı ${footCm} cm; ${targetBrand}${modelSuffix} için EU ${formatEu(recommendedEu)} öneriyoruz.`

  const explanationEn = measured
    ? `Based on your ${footCm} cm foot length, EU ${formatEu(recommendedEu)} is the best fit for ${targetBrand}${modelSuffix}.`
    : `Your ${refBrand || targetBrand} ${refSize} ${refSystem} maps to ${footCm} cm; we recommend EU ${formatEu(recommendedEu)} for ${targetBrand}${modelSuffix}.`

  if (targetModel) {
    notesTr.push(targetModel.fitNoteTr)
    notesEn.push(targetModel.fitNoteEn)
  } else if (targetProfile.dataQuality !== 'generic') {
    notesTr.push(targetProfile.fitNoteTr)
    notesEn.push(targetProfile.fitNoteEn)
  } else {
    notesTr.push(targetProfile.fitNoteTr)
    notesEn.push(targetProfile.fitNoteEn)
  }

  return {
    footCm,
    idealEu,
    recommendedEu,
    substituted: snapped.substituted,
    availability: snapped.availability,
    alternative,
    confidence,
    riskLevel,
    dataQuality: targetProfile.dataQuality,
    explanationTr,
    explanationEn,
    notesTr,
    notesEn,
    factors,
    targetModelName: targetModel?.name ?? null
  }
}

function formatEu(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}
