// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import {
  PROFILE_KEY,
  emptyProfile,
  isProfileComplete,
  loadProfile,
  removeReference,
  saveProfile,
  upsertReference
} from './profile'
import { clearFeedback, getCalibration, recordOutcome, recordRecommendation } from './feedback'

beforeEach(() => {
  localStorage.clear()
})

describe('profil kalıcılığı', () => {
  it('kayıt yoksa null döner', () => {
    expect(loadProfile()).toBeNull()
  })

  it('kaydedip geri okur', () => {
    saveProfile({ ...emptyProfile, gender: 'women', footCm: 24.5, measured: true })
    const loaded = loadProfile()

    expect(loaded?.gender).toBe('women')
    expect(loaded?.footCm).toBe(24.5)
    expect(loaded?.updatedAt).toBeTruthy()
  })

  it('bozuk veriyi çökmeden yutar', () => {
    localStorage.setItem(PROFILE_KEY, '{ bozuk json')
    expect(() => loadProfile()).not.toThrow()
    expect(loadProfile()).toBeNull()
  })

  it('eski dolap verisini yeni şemaya taşır', () => {
    localStorage.setItem(
      'shoefit-cabinet',
      JSON.stringify([{ id: '1', brand: 'Nike', size: '42', system: 'EU', fit: 'kucuk', width: 'genis' }])
    )

    const migrated = loadProfile()

    expect(migrated?.references[0].brand).toBe('Nike')
    expect(migrated?.references[0].fit).toBe('tight')
    expect(migrated?.footWidth).toBe('wide')
    // Taşıma sonrası eski anahtar temizlenmeli, iki kez taşınmamalı.
    expect(localStorage.getItem('shoefit-cabinet')).toBeNull()
  })
})

describe('profil bütünlüğü', () => {
  it('ölçüm veya referans varsa tamamdır', () => {
    expect(isProfileComplete(null)).toBe(false)
    expect(isProfileComplete({ ...emptyProfile })).toBe(false)
    expect(isProfileComplete({ ...emptyProfile, footCm: 26.5 })).toBe(true)
  })
})

describe('referans yönetimi', () => {
  it('aynı marka için tek kayıt tutar', () => {
    let profile = { ...emptyProfile }
    profile = upsertReference(profile, { brand: 'Nike', size: '42', system: 'EU', fit: 'perfect' })
    profile = upsertReference(profile, { brand: 'Nike', size: '43', system: 'EU', fit: 'tight' })

    expect(profile.references).toHaveLength(1)
    expect(profile.references[0].size).toBe('43')
  })

  it('en fazla altı referans saklar', () => {
    let profile = { ...emptyProfile }
    for (let i = 0; i < 10; i++) {
      profile = upsertReference(profile, { brand: `Marka${i}`, size: '42', system: 'EU', fit: 'perfect' })
    }
    expect(profile.references).toHaveLength(6)
  })

  it('referans silinebilir', () => {
    let profile = upsertReference({ ...emptyProfile }, { brand: 'Vans', size: '42', system: 'EU', fit: 'perfect' })
    const id = profile.references[0].id
    profile = removeReference(profile, id)
    expect(profile.references).toHaveLength(0)
  })
})

describe('geri bildirim kalibrasyonu', () => {
  beforeEach(() => clearFeedback())

  const record = () =>
    recordRecommendation({
      brand: 'Nike',
      gender: 'men',
      recommendedEu: 42,
      storeId: 'S',
      productId: 'P'
    })

  it('eşiğin altında kalibrasyon üretmez', () => {
    recordOutcome(record(), 'too_small')
    recordOutcome(record(), 'too_small')
    expect(getCalibration('Nike', 'men')).toBe(0)
  })

  it('"küçük geldi" yanıtları öneriyi büyütür', () => {
    for (let i = 0; i < 4; i++) recordOutcome(record(), 'too_small')
    expect(getCalibration('Nike', 'men')).toBeGreaterThan(0)
  })

  it('"büyük geldi" yanıtları öneriyi küçültür', () => {
    for (let i = 0; i < 4; i++) recordOutcome(record(), 'too_large')
    expect(getCalibration('Nike', 'men')).toBeLessThan(0)
  })

  it('tam oturan yanıtlar düzeltme üretmez', () => {
    for (let i = 0; i < 4; i++) recordOutcome(record(), 'perfect')
    expect(getCalibration('Nike', 'men')).toBe(0)
  })

  it('kalibrasyon marka ve cinsiyete özeldir', () => {
    for (let i = 0; i < 4; i++) recordOutcome(record(), 'too_small')
    expect(getCalibration('Adidas', 'men')).toBe(0)
    expect(getCalibration('Nike', 'women')).toBe(0)
  })

  it('düzeltme yarım numaranın ötesine geçemez', () => {
    for (let i = 0; i < 20; i++) recordOutcome(record(), 'too_small')
    expect(Math.abs(getCalibration('Nike', 'men'))).toBeLessThanOrEqual(0.5)
  })
})
