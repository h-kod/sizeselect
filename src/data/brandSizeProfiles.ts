export interface SizeEntry {
  eu: number
  us_m: number
  uk_m: number
  cm: number
}

export interface BrandProfile {
  fitNote: string
  offsetFromStandard: number
  sizes: SizeEntry[]
}

export const brandSizeProfiles: Record<string, BrandProfile> = {
  Nike: {
    fitNote: 'Genellikle dar/standart kalıp. Bazı modellerde yarım numara büyük tercih edilebilir.',
    offsetFromStandard: 0.5,
    sizes: [
      { eu: 36, us_m: 4, uk_m: 3.5, cm: 22.5 },
      { eu: 37, us_m: 4.5, uk_m: 4, cm: 23 },
      { eu: 38, us_m: 5.5, uk_m: 5, cm: 24 },
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
  },
  Adidas: {
    fitNote: 'Genellikle standart kalıp. Nike’a göre bazı modellerde biraz daha geniş hissedilebilir.',
    offsetFromStandard: 0,
    sizes: [
      { eu: 36, us_m: 4.5, uk_m: 4, cm: 22.1 },
      { eu: 37, us_m: 5, uk_m: 4.5, cm: 22.9 },
      { eu: 38, us_m: 6, uk_m: 5.5, cm: 23.8 },
      { eu: 39, us_m: 6.5, uk_m: 6, cm: 24.2 },
      { eu: 40, us_m: 7, uk_m: 6.5, cm: 24.6 },
      { eu: 41, us_m: 8, uk_m: 7.5, cm: 25.5 },
      { eu: 42, us_m: 8.5, uk_m: 8, cm: 25.9 },
      { eu: 42.5, us_m: 9, uk_m: 8.5, cm: 26.3 },
      { eu: 43, us_m: 9.5, uk_m: 9, cm: 26.7 },
      { eu: 44, us_m: 10, uk_m: 9.5, cm: 27.6 },
      { eu: 45, us_m: 11, uk_m: 10.5, cm: 28.4 },
      { eu: 46, us_m: 12, uk_m: 11.5, cm: 29.2 }
    ]
  },
  Puma: {
    fitNote: 'Sportif modelleri hafif sıkı. Performans ayakkabıları için yarım numara büyütmeyi düşünebilirsin.',
    offsetFromStandard: 0.1,
    sizes: [
      { eu: 36, us_m: 4.5, uk_m: 3.5, cm: 22.5 },
      { eu: 37, us_m: 5, uk_m: 4, cm: 23 },
      { eu: 38, us_m: 6, uk_m: 5, cm: 24 },
      { eu: 39, us_m: 7, uk_m: 6, cm: 25 },
      { eu: 40, us_m: 7.5, uk_m: 6.5, cm: 25.5 },
      { eu: 41, us_m: 8.5, uk_m: 7.5, cm: 26.5 },
      { eu: 42, us_m: 9, uk_m: 8, cm: 27 },
      { eu: 42.5, us_m: 9.5, uk_m: 8.5, cm: 27.5 },
      { eu: 43, us_m: 10, uk_m: 9, cm: 28 },
      { eu: 44, us_m: 10.5, uk_m: 9.5, cm: 28.5 },
      { eu: 45, us_m: 11.5, uk_m: 10.5, cm: 29.5 },
      { eu: 46, us_m: 12, uk_m: 11, cm: 30 }
    ]
  },
  'New Balance': {
    fitNote: 'Rahat kalıp. Genellikle günlük kullanımda konforlu bir his verir.',
    offsetFromStandard: 0,
    sizes: [
      { eu: 36, us_m: 4, uk_m: 3.5, cm: 22.0 },
      { eu: 37, us_m: 4.5, uk_m: 4, cm: 22.5 },
      { eu: 38, us_m: 5.5, uk_m: 5, cm: 23.5 },
      { eu: 39, us_m: 6.5, uk_m: 5.5, cm: 24.5 },
      { eu: 40, us_m: 7, uk_m: 6.5, cm: 25.0 },
      { eu: 41, us_m: 8, uk_m: 7.5, cm: 26.0 },
      { eu: 42, us_m: 8.5, uk_m: 8, cm: 26.5 },
      { eu: 42.5, us_m: 9, uk_m: 8.5, cm: 27.0 },
      { eu: 43, us_m: 9.5, uk_m: 9, cm: 27.5 },
      { eu: 44, us_m: 10, uk_m: 9.5, cm: 28.0 },
      { eu: 45, us_m: 11, uk_m: 10.5, cm: 29.0 },
      { eu: 46, us_m: 12, uk_m: 11.5, cm: 30.0 }
    ]
  },
  Converse: {
    fitNote: 'Daha düz tabanlı bir kalıp. Sneaker’larda tipik olarak standarttan biraz dar hissedilir.',
    offsetFromStandard: -0.2,
    sizes: [
      { eu: 36, us_m: 4, uk_m: 3.5, cm: 22.8 },
      { eu: 37, us_m: 4.5, uk_m: 4, cm: 23.6 },
      { eu: 38, us_m: 5.5, uk_m: 5, cm: 24.5 },
      { eu: 39, us_m: 6, uk_m: 5.5, cm: 24.8 },
      { eu: 40, us_m: 7, uk_m: 6, cm: 25.4 },
      { eu: 41, us_m: 8, uk_m: 7, cm: 26.2 },
      { eu: 42, us_m: 8.5, uk_m: 7.5, cm: 26.6 },
      { eu: 42.5, us_m: 9, uk_m: 8, cm: 27.1 },
      { eu: 43, us_m: 9.5, uk_m: 8.5, cm: 27.5 },
      { eu: 44, us_m: 10, uk_m: 9, cm: 28.4 },
      { eu: 45, us_m: 11, uk_m: 10, cm: 29.2 },
      { eu: 46, us_m: 12, uk_m: 11, cm: 30.0 }
    ]
  },
  Vans: {
    fitNote: 'Kaykay stilleri rahat ama biraz dar olabilir; yarım numara büyük almak iyi bir tercih.',
    offsetFromStandard: 0.2,
    sizes: [
      { eu: 36, us_m: 4.5, uk_m: 3.5, cm: 22.5 },
      { eu: 37, us_m: 5, uk_m: 4, cm: 23 },
      { eu: 38, us_m: 6, uk_m: 5, cm: 24 },
      { eu: 39, us_m: 7, uk_m: 6, cm: 25 },
      { eu: 40, us_m: 7.5, uk_m: 6.5, cm: 25.5 },
      { eu: 41, us_m: 8.5, uk_m: 7.5, cm: 26.5 },
      { eu: 42, us_m: 9, uk_m: 8, cm: 27 },
      { eu: 42.5, us_m: 9.5, uk_m: 8.5, cm: 27.5 },
      { eu: 43, us_m: 10, uk_m: 9, cm: 28 },
      { eu: 44, us_m: 10.5, uk_m: 9.5, cm: 28.5 },
      { eu: 45, us_m: 11.5, uk_m: 10.5, cm: 29.5 },
      { eu: 46, us_m: 12, uk_m: 11, cm: 30.0 }
    ]
  }
}
