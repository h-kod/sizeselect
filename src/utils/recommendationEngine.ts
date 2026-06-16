import { brandSizeProfiles, SizeEntry } from '../data/brandSizeProfiles'

export type SizeSystem = 'EU' | 'US' | 'UK' | 'CM'
export type FitFeedback = 'kucuk' | 'tam' | 'buyuk' // Too small, Fits well, Too large
export type FootWidth = 'dar' | 'normal' | 'genis'   // Narrow, Normal, Wide

export interface RecommendationInput {
  targetBrand: string
  refBrand: string
  refSize: string
  refSystem: SizeSystem
  refFitFeedback: FitFeedback
  refFootWidth: FootWidth
  measuredCm?: number
}

export interface RecommendationResult {
  recommendedSizeEu: number
  alternativeSizeEu: number
  confidenceScore: number
  riskLevel: 'low' | 'medium' | 'high'
  explanationTr: string
  explanationEn: string
  warningsTr: string[]
  warningsEn: string[]
}

const standardSizes: SizeEntry[] = [
  { eu: 36, us_m: 4, uk_m: 3.5, cm: 22.5 },
  { eu: 37, us_m: 5, uk_m: 4, cm: 23.5 },
  { eu: 38, us_m: 6, uk_m: 5, cm: 24 },
  { eu: 39, us_m: 6.5, uk_m: 5.5, cm: 24.5 },
  { eu: 40, us_m: 7, uk_m: 6, cm: 25 },
  { eu: 41, us_m: 8, uk_m: 7, cm: 26 },
  { eu: 42, us_m: 8.5, uk_m: 7.5, cm: 26.5 },
  { eu: 42.5, us_m: 9, uk_m: 8, cm: 27 },
  { eu: 43, us_m: 9.5, uk_m: 8.5, cm: 27.5 },
  { eu: 44, us_m: 10, uk_m: 9, cm: 28 },
  { eu: 45, us_m: 11, uk_m: 10, cm: 29 },
  { eu: 46, us_m: 12, uk_m: 11, cm: 30 }
]

export function getBrandSizes(brand: string): SizeEntry[] {
  const profile = brandSizeProfiles[brand]
  return profile ? profile.sizes : standardSizes
}

export function recommendSize(input: RecommendationInput): RecommendationResult {
  const {
    targetBrand,
    refBrand,
    refSize,
    refSystem,
    refFitFeedback,
    refFootWidth,
    measuredCm
  } = input

  let footCm = 0
  let confidenceScore = 80
  const warningsTr: string[] = []
  const warningsEn: string[] = []

  // 1. Calculate Foot CM length
  if (measuredCm && measuredCm > 0) {
    footCm = measuredCm
    confidenceScore = 95 // Higher confidence with direct measurement
  } else {
    const refSizes = getBrandSizes(refBrand)
    const numericRefSize = parseFloat(refSize)

    let closestRef: SizeEntry | null = null
    let minDiff = Infinity
    const sysKey = refSystem.toLowerCase()

    for (const sizeEntry of refSizes) {
      let sizeVal: number
      if (sysKey === 'us') {
        sizeVal = sizeEntry.us_m
      } else if (sysKey === 'uk') {
        sizeVal = sizeEntry.uk_m
      } else if (sysKey === 'cm') {
        sizeVal = sizeEntry.cm
      } else {
        sizeVal = sizeEntry.eu
      }

      const diff = Math.abs(sizeVal - numericRefSize)
      if (diff < minDiff) {
        minDiff = diff
        closestRef = sizeEntry
      }
    }

    let baseCm = closestRef ? closestRef.cm : 26.5
    
    // Adjust CM length based on reference feedback
    if (refFitFeedback === 'kucuk') {
      baseCm += 0.5
      warningsTr.push(`Referans ayakkabınız sıktığı için yarım numara pay eklenmiştir.`)
      warningsEn.push(`Added half a size because your reference shoe feels too tight.`)
    } else if (refFitFeedback === 'buyuk') {
      baseCm -= 0.5
      warningsTr.push(`Referans ayakkabınız bol geldiği için yarım numara pay düşülmüştür.`)
      warningsEn.push(`Subtracted half a size because your reference shoe feels too loose.`)
    }

    footCm = baseCm
  }

  // 2. Find closest EU size for target brand matching footCm
  const targetSizes = getBrandSizes(targetBrand)
  let closestTarget: SizeEntry = targetSizes[0]
  let minDiff = Infinity

  for (const sizeEntry of targetSizes) {
    const diff = Math.abs(sizeEntry.cm - footCm)
    if (diff < minDiff) {
      minDiff = diff
      closestTarget = sizeEntry
    }
  }

  let recommendedEu = closestTarget.eu

  // 3. Apply general brand-level offsets if target brand has special fit profiles
  const targetProfile = brandSizeProfiles[targetBrand]
  const refProfile = brandSizeProfiles[refBrand]

  // If user has wide feet and target brand runs narrow
  if (refFootWidth === 'genis' && targetProfile && targetProfile.offsetFromStandard > 0) {
    recommendedEu += 0.5
    warningsTr.push(`Taraklı ayağa sahip olduğunuz ve bu marka dar kalıp ürettiği için yarım beden büyük önerilir.`)
    warningsEn.push(`Since you have wide feet and this brand runs narrow, half a size larger is recommended.`)
  }

  // Cap recommended size to half sizes
  recommendedEu = Math.round(recommendedEu * 2) / 2

  // 4. Alternative size logic
  let alternativeEu = recommendedEu
  if (refFootWidth === 'genis') {
    alternativeEu = recommendedEu + 0.5
  } else if (refFootWidth === 'dar') {
    alternativeEu = recommendedEu - 0.5
  } else {
    alternativeEu = recommendedEu - 0.5
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low'
  if (refFitFeedback !== 'tam' || (targetProfile && targetProfile.offsetFromStandard !== 0)) {
    riskLevel = 'medium'
  }

  // 5. Generate explanations
  let explanationTr = ''
  let explanationEn = ''

  if (measuredCm && measuredCm > 0) {
    explanationTr = `Ayağınızın ${measuredCm} cm ölçüsüne göre ${targetBrand} markasında en uygun bedeniniz EU ${recommendedEu} olarak belirlenmiştir.`
    explanationEn = `Based on your foot length of ${measuredCm} cm, your recommended size for ${targetBrand} is EU ${recommendedEu}.`
  } else {
    explanationTr = `${refBrand} markasındaki EU ${refSize} beden uyumunuza göre, ${targetBrand} markasında EU ${recommendedEu} almanız önerilir.`
    explanationEn = `Based on your EU ${refSize} fit in ${refBrand}, we recommend EU ${recommendedEu} in ${targetBrand}.`
  }

  if (targetProfile && targetProfile.offsetFromStandard > 0) {
    explanationTr += ` Bu markanın kalıpları nispeten dar olduğundan yarım numara büyük tercih etmeniz daha konforludur.`
    explanationEn += ` Since this brand runs slightly narrow, choosing a half size larger provides a more comfortable fit.`
  }

  return {
    recommendedSizeEu: recommendedEu,
    alternativeSizeEu: alternativeEu,
    confidenceScore,
    riskLevel,
    explanationTr,
    explanationEn,
    warningsTr,
    warningsEn
  }
}
