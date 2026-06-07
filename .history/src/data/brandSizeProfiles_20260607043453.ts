export const brandSizeProfiles = {
  Nike: {
    fitNote: 'Genellikle dar/standart kalıp. Bazı modellerde yarım numara büyük tercih edilebilir.',
    offsetFromStandard: 0.5,
    sizes: [
      { eu: 40, us_m: 7, uk_m: 6, cm: 25 },
      { eu: 41, us_m: 8, uk_m: 7, cm: 26 },
      { eu: 42, us_m: 8.5, uk_m: 7.5, cm: 26.5 },
      { eu: 42.5, us_m: 9, uk_m: 8, cm: 27 },
      { eu: 43, us_m: 9.5, uk_m: 8.5, cm: 27.5 }
    ]
  },
  Adidas: {
    fitNote: 'Genellikle standart kalıp. Nike’a göre bazı modellerde biraz daha geniş hissedilebilir.',
    offsetFromStandard: 0,
    sizes: [
      { eu: 40, us_m: 7, uk_m: 6, cm: 25.2 },
      { eu: 41, us_m: 8, uk_m: 7, cm: 26.1 },
      { eu: 42, us_m: 8.5, uk_m: 7.5, cm: 26.6 },
      { eu: 42.5, us_m: 9, uk_m: 8, cm: 27.1 },
      { eu: 43, us_m: 9.5, uk_m: 8.5, cm: 27.6 }
    ]
  }
} as const
