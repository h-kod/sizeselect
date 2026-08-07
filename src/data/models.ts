import { WidthProfile } from './sizeSystem'

/**
 * Model seviyesi kalıp verisi.
 *
 * Ayakkabıda beden varyansının büyük kısmı marka değil model seviyesindedir:
 * Samba dar, RS-X geniş, Chuck Taylor büyük kalır. Marka ortalaması bu farkı
 * göremez, bu yüzden her model kendi cm sapmasını taşır.
 */
export interface ShoeModel {
  id: string
  brand: string
  name: string
  /** Ürün başlığında bu modeli tanımaya yarayan alternatif yazımlar */
  aliases: string[]
  /**
   * Modelin iç uzunluğunun marka ortalamasından sapması (cm).
   * Negatif = model küçük kalıyor (kullanıcıya daha büyük numara önerilir).
   */
  lastOffsetCm: number
  widthProfile: WidthProfile
  fitNoteTr: string
  fitNoteEn: string
}

export const shoeModels: ShoeModel[] = [
  // ---- Nike ----
  {
    id: 'nike-af1',
    brand: 'Nike',
    name: 'Air Force 1',
    aliases: ['air force 1', 'air force one', 'af1', 'af-1'],
    lastOffsetCm: 0.2,
    widthProfile: 'wide',
    fitNoteTr: 'Geniş ve rahat kalıptır. Tam numaranız çoğu ayakta doğru sonucu verir.',
    fitNoteEn: 'Relaxed and wide. Your true size works for most feet.'
  },
  {
    id: 'nike-pegasus',
    brand: 'Nike',
    name: 'Pegasus',
    aliases: ['pegasus', 'air zoom pegasus'],
    lastOffsetCm: -0.3,
    widthProfile: 'standard',
    fitNoteTr: 'Sarmalayan koşu kalıbı. Uzun mesafede yarım numara büyük daha rahattır.',
    fitNoteEn: 'Snug running fit. Half a size up is more comfortable over distance.'
  },
  {
    id: 'nike-airmax90',
    brand: 'Nike',
    name: 'Air Max 90',
    aliases: ['air max 90', 'airmax 90', 'am90'],
    lastOffsetCm: -0.3,
    widthProfile: 'narrow',
    fitNoteTr: 'Ön kısmı dar kalıptır. Taraklı ayaklar için yarım numara büyük önerilir.',
    fitNoteEn: 'Narrow toe box. Half a size up is recommended for wider feet.'
  },
  {
    id: 'nike-dunk',
    brand: 'Nike',
    name: 'Dunk Low',
    aliases: ['dunk low', 'dunk', 'sb dunk'],
    lastOffsetCm: -0.2,
    widthProfile: 'narrow',
    fitNoteTr: 'Dar ve sert bir kalıp. Kalın çorapla kullanacaksanız yarım numara büyük alın.',
    fitNoteEn: 'Narrow and stiff. Go half a size up if you wear thick socks.'
  },
  {
    id: 'nike-blazer',
    brand: 'Nike',
    name: 'Blazer Mid',
    aliases: ['blazer', 'blazer mid'],
    lastOffsetCm: -0.3,
    widthProfile: 'narrow',
    fitNoteTr: 'Bilekli yapısı giymeyi zorlaştırır. Yarım numara büyük tercih edin.',
    fitNoteEn: 'The mid-top makes it hard to slip on. Prefer half a size up.'
  },

  // ---- Adidas ----
  {
    id: 'adidas-samba',
    brand: 'Adidas',
    name: 'Samba OG',
    aliases: ['samba', 'samba og'],
    lastOffsetCm: -0.4,
    widthProfile: 'narrow',
    fitNoteTr: 'Klasik retro dar kalıp. Taraklı ayaklarda yarım numara büyük neredeyse zorunludur.',
    fitNoteEn: 'Classic narrow retro last. Half a size up is near-essential for wide feet.'
  },
  {
    id: 'adidas-gazelle',
    brand: 'Adidas',
    name: 'Gazelle',
    aliases: ['gazelle'],
    lastOffsetCm: -0.3,
    widthProfile: 'narrow',
    fitNoteTr: 'Samba ile aynı aileden, ince süet yapısı nedeniyle dar hissettirir.',
    fitNoteEn: 'Same family as the Samba; the thin suede upper feels narrow.'
  },
  {
    id: 'adidas-superstar',
    brand: 'Adidas',
    name: 'Superstar',
    aliases: ['superstar', 'super star'],
    lastOffsetCm: 0,
    widthProfile: 'standard',
    fitNoteTr: 'Adidas ölçeğinde standart kalıptır.',
    fitNoteEn: 'Standard fit on the Adidas scale.'
  },
  {
    id: 'adidas-stansmith',
    brand: 'Adidas',
    name: 'Stan Smith',
    aliases: ['stan smith', 'stansmith'],
    lastOffsetCm: 0,
    widthProfile: 'standard',
    fitNoteTr: 'Klasik düz taban kalıbı. Günlük kullanımda rahattır.',
    fitNoteEn: 'Classic flat-sole fit, comfortable for daily wear.'
  },
  {
    id: 'adidas-ultraboost',
    brand: 'Adidas',
    name: 'Ultraboost',
    aliases: ['ultraboost', 'ultra boost'],
    lastOffsetCm: -0.4,
    widthProfile: 'narrow',
    fitNoteTr: 'Çorap gibi saran örgü yapı. Yarım numara büyük güçlü şekilde önerilir.',
    fitNoteEn: 'Sock-like knit upper. Half a size up is strongly recommended.'
  },
  {
    id: 'adidas-campus',
    brand: 'Adidas',
    name: 'Campus',
    aliases: ['campus', 'campus 00s'],
    lastOffsetCm: -0.2,
    widthProfile: 'standard',
    fitNoteTr: 'Süet yapı zamanla esner ama başlangıçta sıkı durabilir.',
    fitNoteEn: 'The suede relaxes over time but feels tight at first.'
  },

  // ---- Puma ----
  {
    id: 'puma-suede',
    brand: 'Puma',
    name: 'Suede Classic',
    aliases: ['suede classic', 'suede xl', 'suede'],
    lastOffsetCm: -0.2,
    widthProfile: 'narrow',
    fitNoteTr: 'Süet malzeme esner ancak kalıbı başlangıçta dar hissettirir.',
    fitNoteEn: 'The suede stretches, but the fit is narrow at first.'
  },
  {
    id: 'puma-rsx',
    brand: 'Puma',
    name: 'RS-X',
    aliases: ['rs-x', 'rsx', 'rs x'],
    lastOffsetCm: 0.3,
    widthProfile: 'wide',
    fitNoteTr: 'Hacimli ve geniş retro yapı. Rahat oturur.',
    fitNoteEn: 'Bulky and roomy retro build. Fits comfortably.'
  },
  {
    id: 'puma-palermo',
    brand: 'Puma',
    name: 'Palermo',
    aliases: ['palermo'],
    lastOffsetCm: -0.2,
    widthProfile: 'standard',
    fitNoteTr: 'Terrace stili düşük profilli kalıp; hafif dar hissettirir.',
    fitNoteEn: 'Low-profile terrace silhouette; feels slightly narrow.'
  },

  // ---- New Balance ----
  {
    id: 'nb-574',
    brand: 'New Balance',
    name: '574',
    aliases: ['574'],
    lastOffsetCm: 0.2,
    widthProfile: 'wide',
    fitNoteTr: 'Geniş ön ayak yapısıyla oldukça rahat bir kalıptır.',
    fitNoteEn: 'Very comfortable thanks to the wide toe box.'
  },
  {
    id: 'nb-990',
    brand: 'New Balance',
    name: '990',
    aliases: ['990', '990v5', '990v6'],
    lastOffsetCm: 0.2,
    widthProfile: 'wide',
    fitNoteTr: 'Üst düzey destek ve geniş kalıp. Tam numaranızı seçebilirsiniz.',
    fitNoteEn: 'Premium support with a roomy last. Your true size works.'
  },
  {
    id: 'nb-550',
    brand: 'New Balance',
    name: '550',
    aliases: ['550', 'bb550'],
    lastOffsetCm: -0.1,
    widthProfile: 'standard',
    fitNoteTr: 'Basketbol kökenli kalıp; diğer New Balance modellerinden biraz daha dardır.',
    fitNoteEn: 'Basketball-derived last; slightly narrower than other New Balance models.'
  },
  {
    id: 'nb-9060',
    brand: 'New Balance',
    name: '9060',
    aliases: ['9060'],
    lastOffsetCm: 0.1,
    widthProfile: 'wide',
    fitNoteTr: 'Hacimli taban ve geniş kalıp. Dar ayaklarda bağcık desteği gerekebilir.',
    fitNoteEn: 'Chunky sole with a roomy last. Narrow feet may need extra lacing.'
  },

  // ---- Converse ----
  {
    id: 'converse-chuck',
    brand: 'Converse',
    name: 'Chuck Taylor All Star',
    aliases: ['chuck taylor', 'all star', 'chuck 70', 'chuck'],
    lastOffsetCm: 0.4,
    widthProfile: 'standard',
    fitNoteTr: 'Büyük kalır. Genelde yarım numara küçük tercih edilir.',
    fitNoteEn: 'Runs large. Half a size down is the usual choice.'
  },
  {
    id: 'converse-onestar',
    brand: 'Converse',
    name: 'One Star',
    aliases: ['one star', 'onestar'],
    lastOffsetCm: 0.2,
    widthProfile: 'standard',
    fitNoteTr: 'Chuck Taylor kadar olmasa da hafif büyük kalır.',
    fitNoteEn: 'Runs slightly large, though less so than the Chuck Taylor.'
  },

  // ---- Vans ----
  {
    id: 'vans-oldskool',
    brand: 'Vans',
    name: 'Old Skool',
    aliases: ['old skool', 'oldskool'],
    lastOffsetCm: 0,
    widthProfile: 'standard',
    fitNoteTr: 'Klasik kaykay kalıbı. Tam numaranızı alabilirsiniz.',
    fitNoteEn: 'Classic skate fit. Your true size works.'
  },
  {
    id: 'vans-slipon',
    brand: 'Vans',
    name: 'Slip-On',
    aliases: ['slip-on', 'slip on', 'slipon'],
    lastOffsetCm: -0.2,
    widthProfile: 'narrow',
    fitNoteTr: 'Bağcıksız yapı başlangıçta dar hissettirir; esneyene kadar sıkı olabilir.',
    fitNoteEn: 'The laceless build feels tight until it breaks in.'
  },
  {
    id: 'vans-knu',
    brand: 'Vans',
    name: 'Knu Skool',
    aliases: ['knu skool', 'knu'],
    lastOffsetCm: 0.2,
    widthProfile: 'wide',
    fitNoteTr: 'Hacimli ve geniş yapı; kalın dil nedeniyle rahat oturur.',
    fitNoteEn: 'Chunky and roomy; the padded tongue makes it comfortable.'
  },

  // ---- ASICS ----
  {
    id: 'asics-gel1130',
    brand: 'ASICS',
    name: 'GEL-1130',
    aliases: ['gel-1130', 'gel 1130', '1130'],
    lastOffsetCm: -0.2,
    widthProfile: 'standard',
    fitNoteTr: 'Koşu kökenli kalıp; parmak payı için yarım numara büyük yaygındır.',
    fitNoteEn: 'Running-derived last; half a size up is common for toe room.'
  },
  {
    id: 'asics-kayano',
    brand: 'ASICS',
    name: 'GEL-Kayano',
    aliases: ['kayano', 'gel-kayano'],
    lastOffsetCm: -0.2,
    widthProfile: 'standard',
    fitNoteTr: 'Destekli koşu modeli; uzun mesafede yarım numara büyük önerilir.',
    fitNoteEn: 'Supportive running model; half a size up is advised for distance.'
  },

  // ---- Salomon ----
  {
    id: 'salomon-xt6',
    brand: 'Salomon',
    name: 'XT-6',
    aliases: ['xt-6', 'xt6'],
    lastOffsetCm: -0.4,
    widthProfile: 'narrow',
    fitNoteTr: 'Teknik patika kalıbı, dar ve küçük kalır. Yarım numara büyük önerilir.',
    fitNoteEn: 'Technical trail last, narrow and small. Half a size up is advised.'
  },
  {
    id: 'salomon-speedcross',
    brand: 'Salomon',
    name: 'Speedcross',
    aliases: ['speedcross'],
    lastOffsetCm: -0.4,
    widthProfile: 'narrow',
    fitNoteTr: 'Ayağı sıkıca saran patika modeli; taraklı ayaklarda dar gelir.',
    fitNoteEn: 'Trail model that locks the foot down; tight for wide feet.'
  }
]

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Ürün başlığından model tespiti.
 * Marka biliniyorsa önce o markanın modellerine bakar; bulamazsa tüm katalogda
 * arar. En uzun eşleşen alias kazanır ("air max 90" > "air max").
 */
export function matchModel(text: string, brand?: string): ShoeModel | null {
  const haystack = normalize(text)
  if (!haystack) return null

  const pools = brand
    ? [shoeModels.filter(m => m.brand === brand), shoeModels]
    : [shoeModels]

  for (const pool of pools) {
    let best: ShoeModel | null = null
    let bestLength = 0

    for (const model of pool) {
      for (const alias of [...model.aliases, normalize(model.name)]) {
        const needle = normalize(alias)
        if (needle.length > bestLength && haystack.includes(needle)) {
          best = model
          bestLength = needle.length
        }
      }
    }

    if (best) return best
  }

  return null
}

export function getModelsByBrand(brand: string): ShoeModel[] {
  return shoeModels.filter(model => model.brand === brand)
}

export function getModelById(id: string): ShoeModel | null {
  return shoeModels.find(model => model.id === id) || null
}
