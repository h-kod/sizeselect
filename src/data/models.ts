export interface ShoeModel {
  id: string
  brand: string
  name: string
  fitType: 'dar' | 'normal' | 'bol' | 'kucuk' | 'buyuk'
  widthType: 'dar' | 'normal' | 'genis'
  sizeOffset: number // Offset to apply (e.g., +0.5 for narrow/small kalıp, -0.5 for large kalıp)
  fitNoteTr: string
  fitNoteEn: string
}

export const shoeModels: ShoeModel[] = [
  // Nike
  {
    id: 'nike-af1',
    brand: 'Nike',
    name: 'Air Force 1',
    fitType: 'normal',
    widthType: 'genis',
    sizeOffset: 0,
    fitNoteTr: 'Genellikle geniş ve rahat kalıptır. Normal numaranızı veya buçuklu numara tercih edebilirsiniz.',
    fitNoteEn: 'Generally relaxed and wide fit. You can select your normal size or half a size down if you prefer snug.'
  },
  {
    id: 'nike-pegasus',
    brand: 'Nike',
    name: 'Pegasus 40',
    fitType: 'dar',
    widthType: 'normal',
    sizeOffset: 0.5,
    fitNoteTr: 'Sportif ve sarmalayan kalıptır. Yarım numara büyük almak daha rahat bir kullanım sunar.',
    fitNoteEn: 'Sporty and snug fit. Going half a size up is recommended for extra comfort.'
  },
  {
    id: 'nike-airmax',
    brand: 'Nike',
    name: 'Air Max 90',
    fitType: 'dar',
    widthType: 'dar',
    sizeOffset: 0.5,
    fitNoteTr: 'Ön kısmı dar kalıptır. Taraklı ayaklar için yarım veya bir numara büyük önerilir.',
    fitNoteEn: 'Narrow toe box. For wider feet, going half or a full size up is recommended.'
  },
  {
    id: 'nike-blazer',
    brand: 'Nike',
    name: 'Blazer Mid',
    fitType: 'dar',
    widthType: 'dar',
    sizeOffset: 0.5,
    fitNoteTr: 'Bilekli yapısı ve dar kalıbı nedeniyle giymesi zor olabilir. Yarım numara büyük tercih edin.',
    fitNoteEn: 'Hard to slip on due to mid-top design and narrow build. Go half a size up.'
  },

  // Adidas
  {
    id: 'adidas-samba',
    brand: 'Adidas',
    name: 'Samba OG',
    fitType: 'dar',
    widthType: 'dar',
    sizeOffset: 0.5,
    fitNoteTr: 'Klasik retro dar kalıp. Taraklı ayaklar için kesinlikle yarım numara büyük önerilir.',
    fitNoteEn: 'Classic retro narrow fit. For wider feet, definitely go half a size up.'
  },
  {
    id: 'adidas-superstar',
    brand: 'Adidas',
    name: 'Superstar',
    fitType: 'normal',
    widthType: 'normal',
    sizeOffset: 0,
    fitNoteTr: 'Tam standart kalıptır. Kendi numaranızı almanız önerilir.',
    fitNoteEn: 'Standard true-to-size fit. Choosing your normal size is recommended.'
  },
  {
    id: 'adidas-stan-smith',
    brand: 'Adidas',
    name: 'Stan Smith',
    fitType: 'normal',
    widthType: 'normal',
    sizeOffset: 0,
    fitNoteTr: 'Standart ve klasik düz taban kalıptır. Günlük rahat bir kullanım sunar.',
    fitNoteEn: 'Standard flat-sole fit. Classic clean style and comfortable for daily use.'
  },
  {
    id: 'adidas-ultraboost',
    brand: 'Adidas',
    name: 'Ultraboost',
    fitType: 'dar',
    widthType: 'normal',
    sizeOffset: 0.5,
    fitNoteTr: 'Çorap gibi saran sıkı örgü yapı. Yarım numara büyük tercih edilmesi önerilir.',
    fitNoteEn: 'Sock-like snug knit fit. Choosing half a size up is highly recommended.'
  },

  // Puma
  {
    id: 'puma-suede',
    brand: 'Puma',
    name: 'Suede Classic',
    fitType: 'normal',
    widthType: 'dar',
    sizeOffset: 0,
    fitNoteTr: 'Süet malzeme esneyebilir ancak kalıbı başlangıçta dar hissettirebilir.',
    fitNoteEn: 'Suede material stretches slightly over time, but fits narrow initially.'
  },
  {
    id: 'puma-rsx',
    brand: 'Puma',
    name: 'RS-X',
    fitType: 'bol',
    widthType: 'genis',
    sizeOffset: 0,
    fitNoteTr: 'Hacimli ve geniş retro sneaker yapısı. Konforlu ve geniştir.',
    fitNoteEn: 'Bulky and spacious retro sneaker build. Extremely comfortable and roomy.'
  },

  // New Balance
  {
    id: 'nb-574',
    brand: 'New Balance',
    name: '574 Classic',
    fitType: 'normal',
    widthType: 'genis',
    sizeOffset: 0,
    fitNoteTr: 'Geniş ön ayak yapısı sayesinde son derece rahat bir standart kalıptır.',
    fitNoteEn: 'Extremely comfortable standard fit with a wide toe box.'
  },
  {
    id: 'nb-990',
    brand: 'New Balance',
    name: '990v5',
    fitType: 'normal',
    widthType: 'genis',
    sizeOffset: 0,
    fitNoteTr: 'Üst düzey konfor ve destek sağlayan geniş kalıp. Tam bedeninizi seçebilirsiniz.',
    fitNoteEn: 'Premium comfort and support with a roomy design. Select your true size.'
  },

  // Converse
  {
    id: 'converse-chuck',
    brand: 'Converse',
    name: 'Chuck Taylor All Star',
    fitType: 'buyuk',
    widthType: 'normal',
    sizeOffset: -0.5,
    fitNoteTr: 'Büyük kalıptır. Normal numaranızdan yarım numara küçük almanız önerilir.',
    fitNoteEn: 'Runs large. We recommend buying half a size smaller than your standard size.'
  },

  // Vans
  {
    id: 'vans-oldskool',
    brand: 'Vans',
    name: 'Old Skool',
    fitType: 'normal',
    widthType: 'normal',
    sizeOffset: 0,
    fitNoteTr: 'Klasik kaykay kalıbıdır. Tam bedeninizi almanız önerilir.',
    fitNoteEn: 'Classic skate shoe fit. Recommended to choose your true size.'
  },
  {
    id: 'vans-slipon',
    brand: 'Vans',
    name: 'Slip-On',
    fitType: 'dar',
    widthType: 'dar',
    sizeOffset: 0.5,
    fitNoteTr: 'Bağcıksız yapısı nedeniyle başlangıçta dar olabilir. Yarım numara büyük önerilir.',
    fitNoteEn: 'Snug fit due to laceless design. Going half a size up is recommended.'
  }
]
