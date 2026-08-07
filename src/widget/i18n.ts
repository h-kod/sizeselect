export type Lang = 'tr' | 'en'

const tr = {
  triggerDefault: 'Bedenimi bul',
  triggerWithSize: 'Senin bedenin: EU {size}',

  title: 'Beden asistanı',
  close: 'Kapat',
  back: 'Geri',

  stepMethod: 'Başlangıç',
  stepReference: 'Referans',
  stepDetails: 'Detay',
  stepResult: 'Sonuç',

  // Adım 1 — yöntem
  whoFor: 'Kimin için?',
  genderMen: 'Erkek',
  genderWomen: 'Kadın',
  genderKids: 'Çocuk',
  methodTitle: 'Bedenini nasıl bulalım?',
  methodReferenceTitle: 'Giydiğim bir ayakkabıdan',
  methodReferenceDesc: 'Şu an kullandığın bir modelin markası ve numarası yeter.',
  methodMeasureTitle: 'Ayağımı ölçerek',
  methodMeasureDesc: 'Bir cetvelle topuktan en uzun parmağa ölç.',
  methodProfileTitle: 'Kayıtlı profilimden',
  methodProfileDesc: 'Daha önce kaydettiğin ölçüyü kullan.',

  // Adım 2 — referans marka
  brandTitle: 'Hangi markayı giyiyorsun?',
  brandSearch: 'Marka ara',
  brandNotFound: 'Bu isimde bir marka bulamadık.',
  brandUseAnyway: '"{query}" markasını yine de kullan',

  // Adım 3 — model, numara, uyum
  modelTitle: 'Model (isteğe bağlı)',
  modelHelp: 'Modeli seçersen öneri belirgin şekilde isabetli olur.',
  modelNone: 'Bilmiyorum',
  sizeTitle: 'Bu ayakkabıdaki numaran',
  sizeSystem: 'Beden sistemi',
  fitTitle: 'Ayağına nasıl oturuyor?',
  fitTight: 'Dar geliyor',
  fitPerfect: 'Tam oturuyor',
  fitLoose: 'Bol geliyor',
  widthTitle: 'Ayak yapın',
  widthNarrow: 'Dar',
  widthNormal: 'Normal',
  widthWide: 'Geniş / taraklı',
  showResult: 'Bedenimi göster',

  // Ölçüm
  measureTitle: 'Ayak uzunluğun',
  measureHelp:
    'Topuğunu duvara yasla, en uzun parmağının ucuna kadar ölç. Akşam saatlerinde ölçmek daha doğru sonuç verir.',
  measureUnit: 'cm',
  measureInvalid: '18 ile 35 cm arasında bir değer gir.',

  // Sonuç
  resultTitle: 'Önerilen numaran',
  confidence: 'Güven',
  confidenceHigh: 'Yüksek',
  confidenceMedium: 'Orta',
  confidenceLow: 'Düşük',
  whyTitle: 'Bu numara nasıl hesaplandı?',
  whyBase: 'Ayak ölçün {cm} cm olarak hesaplandı',
  whyShow: 'Detayları göster',
  whyHide: 'Detayları gizle',
  alternativeTitle: 'Alternatif',
  inStock: 'Stokta',
  outOfStock: 'Stokta yok',
  notOffered: 'Bu üründe yok',
  substitutedTitle: 'İdeal numaran {ideal}, ancak stokta değil',
  selectSize: 'Bu numarayı seç',
  selectAndCart: 'Seç ve sepete ekle',
  addToCart: 'Sepete ekle',
  sizeSelected: 'Numara seçildi',
  addedToCart: 'Sepete eklendi',
  manualHint: 'Numarayı sayfadan kendin seçmen gerekiyor: EU {size}',
  saveProfile: 'Profilime kaydet',
  profileSaved: 'Profiline kaydedildi',
  restart: 'Baştan hesapla',
  dataQualityGeneric:
    'Bu marka için doğrulanmış beden tablomuz yok; sonuç sektör ortalamasına dayanıyor.',
  privacyNote: 'Ölçülerin yalnızca bu tarayıcıda saklanır, kimlik bilgisi toplanmaz.',

  // Geri bildirim
  feedbackQuestion: '{brand} EU {size} nasıl geldi?',
  feedbackSmall: 'Küçük geldi',
  feedbackPerfect: 'Tam oldu',
  feedbackLarge: 'Büyük geldi',
  feedbackThanks: 'Teşekkürler, önerilerimiz buna göre düzeltilecek.',
  feedbackDismiss: 'Şimdi değil',

  // Profil özeti
  savedProfileFoot: '{cm} cm ayak uzunluğu',
  savedProfileRef: '{brand} {size}'
}

const en: typeof tr = {
  triggerDefault: 'Find my size',
  triggerWithSize: 'Your size: EU {size}',

  title: 'Size assistant',
  close: 'Close',
  back: 'Back',

  stepMethod: 'Start',
  stepReference: 'Reference',
  stepDetails: 'Details',
  stepResult: 'Result',

  whoFor: 'Who is it for?',
  genderMen: 'Men',
  genderWomen: 'Women',
  genderKids: 'Kids',
  methodTitle: 'How should we find your size?',
  methodReferenceTitle: 'From a shoe I own',
  methodReferenceDesc: 'Just the brand and size of a pair you wear now.',
  methodMeasureTitle: 'By measuring my foot',
  methodMeasureDesc: 'Measure from heel to longest toe with a ruler.',
  methodProfileTitle: 'From my saved profile',
  methodProfileDesc: 'Use the measurements you saved earlier.',

  brandTitle: 'Which brand do you wear?',
  brandSearch: 'Search brands',
  brandNotFound: 'No brand found with that name.',
  brandUseAnyway: 'Use "{query}" anyway',

  modelTitle: 'Model (optional)',
  modelHelp: 'Picking the model makes the recommendation noticeably more accurate.',
  modelNone: "I don't know",
  sizeTitle: 'Your size in that shoe',
  sizeSystem: 'Size system',
  fitTitle: 'How does it fit?',
  fitTight: 'Too tight',
  fitPerfect: 'Just right',
  fitLoose: 'Too loose',
  widthTitle: 'Your foot width',
  widthNarrow: 'Narrow',
  widthNormal: 'Normal',
  widthWide: 'Wide',
  showResult: 'Show my size',

  measureTitle: 'Your foot length',
  measureHelp:
    'Put your heel against a wall and measure to the tip of your longest toe. Measuring in the evening is more accurate.',
  measureUnit: 'cm',
  measureInvalid: 'Enter a value between 18 and 35 cm.',

  resultTitle: 'Your recommended size',
  confidence: 'Confidence',
  confidenceHigh: 'High',
  confidenceMedium: 'Medium',
  confidenceLow: 'Low',
  whyTitle: 'How was this calculated?',
  whyBase: 'Your foot length was estimated at {cm} cm',
  whyShow: 'Show details',
  whyHide: 'Hide details',
  alternativeTitle: 'Alternative',
  inStock: 'In stock',
  outOfStock: 'Out of stock',
  notOffered: 'Not offered here',
  substitutedTitle: 'Your ideal size is {ideal}, but it is out of stock',
  selectSize: 'Select this size',
  selectAndCart: 'Select and add to cart',
  addToCart: 'Add to cart',
  sizeSelected: 'Size selected',
  addedToCart: 'Added to cart',
  manualHint: 'Please select the size on the page yourself: EU {size}',
  saveProfile: 'Save to my profile',
  profileSaved: 'Saved to your profile',
  restart: 'Start over',
  dataQualityGeneric:
    'We have no verified size chart for this brand; the result uses an industry average.',
  privacyNote: 'Your measurements stay in this browser. No personal data is collected.',

  feedbackQuestion: 'How did {brand} EU {size} fit?',
  feedbackSmall: 'Too small',
  feedbackPerfect: 'Just right',
  feedbackLarge: 'Too large',
  feedbackThanks: 'Thanks — we will adjust future recommendations.',
  feedbackDismiss: 'Not now',

  savedProfileFoot: '{cm} cm foot length',
  savedProfileRef: '{brand} {size}'
}

const dictionaries: Record<Lang, typeof tr> = { tr, en }

export type TranslationKey = keyof typeof tr

export function createTranslator(lang: Lang) {
  const dictionary = dictionaries[lang] || dictionaries.en

  return (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text: string = dictionary[key] ?? key
    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value))
      }
    }
    return text
  }
}

export type Translator = ReturnType<typeof createTranslator>

export function resolveLang(mode: string): Lang {
  if (mode === 'tr' || mode === 'en') return mode
  const navigatorLang = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return navigatorLang.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}
