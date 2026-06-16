import { describe, it, expect } from 'vitest'
import { recommendSize } from './recommendationEngine'

describe('ShoeFit Sizing Recommendation Engine (Brand-Only)', () => {
  
  it('should calculate standard size match correctly', () => {
    // Nike size 42.5 (27.0 cm) -> Adidas
    // Adidas size table: 42.5 is 26.3 cm, 43 is 26.7 cm, 44 is 27.6 cm.
    // 27.0 cm is closest to 26.7 cm (EU 43).
    const result = recommendSize({
      targetBrand: 'Adidas',
      refBrand: 'Nike',
      refSize: '42.5',
      refSystem: 'EU',
      refFitFeedback: 'tam',
      refFootWidth: 'normal'
    })

    expect(result.recommendedSizeEu).toBe(43)
    expect(result.confidenceScore).toBe(80)
    expect(result.riskLevel).toBe('low')
  })

  it('should adjust for too tight reference feedback by adding size allowance', () => {
    // Nike size 42 (26.5 cm, but too tight) -> Adidas
    // Reference 42 too small -> foot CM adjusted: 26.5 + 0.5 = 27.0 cm
    // Closest in Adidas for 27.0 cm is EU 43 (26.7 cm).
    const result = recommendSize({
      targetBrand: 'Adidas',
      refBrand: 'Nike',
      refSize: '42',
      refSystem: 'EU',
      refFitFeedback: 'kucuk', // small / tight
      refFootWidth: 'normal'
    })

    expect(result.recommendedSizeEu).toBe(43)
  })

  it('should adjust for too loose reference feedback by subtracting size allowance', () => {
    // Nike size 42.5 (27.0 cm, but too loose) -> Adidas
    // Reference 42.5 too loose -> foot CM adjusted: 27.0 - 0.5 = 26.5 cm
    // Closest in Adidas for 26.5 cm is EU 42.5 (26.3 cm, diff 0.2) or EU 43 (26.7 cm, diff 0.2)
    // Closest is EU 42.5 (first matched).
    const result = recommendSize({
      targetBrand: 'Adidas',
      refBrand: 'Nike',
      refSize: '42.5',
      refSystem: 'EU',
      refFitFeedback: 'buyuk', // large / loose
      refFootWidth: 'normal'
    })

    expect(result.recommendedSizeEu).toBe(42.5)
  })

  it('should add half a size for wide feet if target brand runs narrow', () => {
    // Nike size 42 (26.5 cm) -> Vans (Vans offsetFromStandard: 0.2 > 0 -> narrow)
    // Closest in Vans for 26.5 cm is EU 41 (26.5 cm).
    // User has wide feet, target runs narrow -> add +0.5 -> EU 41 + 0.5 = EU 41.5
    const result = recommendSize({
      targetBrand: 'Vans',
      refBrand: 'Nike',
      refSize: '42',
      refSystem: 'EU',
      refFitFeedback: 'tam',
      refFootWidth: 'genis' // wide foot
    })

    expect(result.recommendedSizeEu).toBe(41.5)
    expect(result.warningsTr.length).toBeGreaterThan(0)
  })

  it('should calculate size directly from CM foot length if provided', () => {
    // Measured foot length: 27.5 cm -> Adidas
    // Adidas closest for 27.5 cm is EU 44 (27.6 cm).
    const result = recommendSize({
      targetBrand: 'Adidas',
      refBrand: 'Nike',
      refSize: '42',
      refSystem: 'EU',
      refFitFeedback: 'tam',
      refFootWidth: 'normal',
      measuredCm: 27.5
    })

    expect(result.recommendedSizeEu).toBe(44)
    expect(result.confidenceScore).toBe(95)
  })
})
