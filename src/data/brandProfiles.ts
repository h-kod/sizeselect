import {
  Gender,
  SizeRow,
  WidthProfile,
  buildSizeTable,
  GENERIC_CM_AT_EU42
} from './sizeSystem'

/**
 * Marka verisinin ne kadar güvenilir olduğu. Güven skoru buna göre düşer;
 * kullanıcıya "bu marka için doğrulanmış tablomuz yok" demek, sessizce
 * jenerik tabloya düşüp %80 güven göstermekten iyidir.
 */
export type DataQuality = 'calibrated' | 'derived' | 'generic'

export interface BrandProfile {
  /** Arayüzde gösterilen ad */
  display: string
  /** Logo çözümlemesi için alan adı */
  domain: string
  /** EU 42'nin iç uzunluğu (cm). Düşük değer = marka küçük kalıyor. */
  cmAtEu42: number
  widthProfile: WidthProfile
  dataQuality: DataQuality
  captionTr: string
  captionEn: string
  fitNoteTr: string
  fitNoteEn: string
  /** Marka bu kategorilerde beden tablosu sunuyor */
  genders: Gender[]
}

export const brandProfiles: Record<string, BrandProfile> = {
  Nike: {
    display: 'Nike',
    domain: 'nike.com',
    cmAtEu42: 26.4,
    widthProfile: 'narrow',
    dataQuality: 'calibrated',
    captionTr: 'Hafif dar kalıp',
    captionEn: 'Runs slightly narrow',
    fitNoteTr: 'Nike kalıpları genelde dar ve sarmalayıcıdır. Taraklı ayaklarda yarım numara büyük daha rahattır.',
    fitNoteEn: 'Nike lasts run narrow and snug. Half a size up is more comfortable for wider feet.',
    genders: ['men', 'women', 'kids']
  },
  Jordan: {
    display: 'Jordan',
    domain: 'nike.com',
    cmAtEu42: 26.4,
    widthProfile: 'narrow',
    dataQuality: 'derived',
    captionTr: 'Nike kalıbıyla aynı aile',
    captionEn: 'Shares the Nike last',
    fitNoteTr: 'Jordan modelleri Nike kalıbını paylaşır; bilekli modellerde giyim zor olabilir.',
    fitNoteEn: 'Jordan uses the Nike last; mid and high tops can be hard to slip on.',
    genders: ['men', 'women', 'kids']
  },
  Adidas: {
    display: 'Adidas',
    domain: 'adidas.com',
    cmAtEu42: 26.0,
    widthProfile: 'standard',
    dataQuality: 'calibrated',
    captionTr: 'Numaralandırması küçük kalır',
    captionEn: 'Numbering runs small',
    fitNoteTr: 'Adidas EU numaralandırması diğer markalara göre küçük kalır. Aynı numarada daha kısa bir kalıp beklemelisiniz.',
    fitNoteEn: 'Adidas EU numbering runs small compared to other brands. Expect a shorter last at the same number.',
    genders: ['men', 'women', 'kids']
  },
  Puma: {
    display: 'Puma',
    domain: 'puma.com',
    cmAtEu42: 26.6,
    widthProfile: 'narrow',
    dataQuality: 'calibrated',
    captionTr: 'Sportif ve sıkı',
    captionEn: 'Sporty and snug',
    fitNoteTr: 'Puma performans modelleri ön ayakta sıkı durur; günlük modeller daha rahattır.',
    fitNoteEn: 'Puma performance models are snug at the forefoot; lifestyle models feel roomier.',
    genders: ['men', 'women', 'kids']
  },
  'New Balance': {
    display: 'New Balance',
    domain: 'newbalance.com',
    cmAtEu42: 26.9,
    widthProfile: 'wide',
    dataQuality: 'calibrated',
    captionTr: 'Geniş ve konforlu',
    captionEn: 'Roomy and comfortable',
    fitNoteTr: 'New Balance geniş ön ayak yapısıyla bilinir. Dar ayaklarda bağcık sıkılığı gerekebilir.',
    fitNoteEn: 'New Balance is known for a wide toe box. Narrow feet may need tighter lacing.',
    genders: ['men', 'women', 'kids']
  },
  Converse: {
    display: 'Converse',
    domain: 'converse.com',
    cmAtEu42: 27.1,
    widthProfile: 'standard',
    dataQuality: 'calibrated',
    captionTr: 'Büyük kalıp',
    captionEn: 'Runs large',
    fitNoteTr: 'Chuck Taylor ailesi büyük kalır; genelde yarım numara küçük tercih edilir.',
    fitNoteEn: 'The Chuck Taylor family runs large; half a size down is the usual choice.',
    genders: ['men', 'women', 'kids']
  },
  Vans: {
    display: 'Vans',
    domain: 'vans.com',
    cmAtEu42: 26.5,
    widthProfile: 'standard',
    dataQuality: 'calibrated',
    captionTr: 'Klasik kaykay kalıbı',
    captionEn: 'Classic skate fit',
    fitNoteTr: 'Vans genelde tam numara oturur; bağcıksız modeller başta dar hissettirir.',
    fitNoteEn: 'Vans is generally true to size; laceless models feel tight at first.',
    genders: ['men', 'women', 'kids']
  },
  Reebok: {
    display: 'Reebok',
    domain: 'reebok.com',
    cmAtEu42: 26.6,
    widthProfile: 'standard',
    dataQuality: 'derived',
    captionTr: 'Aktif spor kalıbı',
    captionEn: 'Athletic fit',
    fitNoteTr: 'Reebok antrenman modelleri sabit bir taban sunar; klasik modeller biraz daha dardır.',
    fitNoteEn: 'Reebok training models offer a stable platform; classics feel slightly narrower.',
    genders: ['men', 'women', 'kids']
  },
  Skechers: {
    display: 'Skechers',
    domain: 'skechers.com',
    cmAtEu42: 27.0,
    widthProfile: 'wide',
    dataQuality: 'derived',
    captionTr: 'Konfor odaklı, geniş',
    captionEn: 'Comfort focused, roomy',
    fitNoteTr: 'Skechers konfor serileri bol kalıplıdır; memory foam tabanlık iç hacmi biraz daraltır.',
    fitNoteEn: 'Skechers comfort lines run roomy; memory foam insoles take up some volume.',
    genders: ['men', 'women', 'kids']
  },
  ASICS: {
    display: 'ASICS',
    domain: 'asics.com',
    cmAtEu42: 26.5,
    widthProfile: 'standard',
    dataQuality: 'derived',
    captionTr: 'Koşu odaklı standart kalıp',
    captionEn: 'Standard running fit',
    fitNoteTr: 'ASICS koşu modellerinde parmak payı bırakmanız önerilir; yarım numara büyük yaygın tercihtir.',
    fitNoteEn: 'ASICS running models want some toe room; half a size up is the common choice.',
    genders: ['men', 'women', 'kids']
  },
  Fila: {
    display: 'Fila',
    domain: 'fila.com',
    cmAtEu42: 26.3,
    widthProfile: 'standard',
    dataQuality: 'derived',
    captionTr: 'Retro konfor',
    captionEn: 'Retro comfort',
    fitNoteTr: 'Fila retro modelleri hacimli görünse de iç kalıp standarttır.',
    fitNoteEn: 'Fila retro models look bulky but the internal last is standard.',
    genders: ['men', 'women', 'kids']
  },
  Brooks: {
    display: 'Brooks',
    domain: 'brooksrunning.com',
    cmAtEu42: 26.8,
    widthProfile: 'standard',
    dataQuality: 'derived',
    captionTr: 'Koşu desteği',
    captionEn: 'Running support',
    fitNoteTr: 'Brooks çoklu genişlik seçeneği sunar; standart genişlik çoğu ayağa uyar.',
    fitNoteEn: 'Brooks offers multiple width options; the standard width suits most feet.',
    genders: ['men', 'women']
  },
  Merrell: {
    display: 'Merrell',
    domain: 'merrell.com',
    cmAtEu42: 26.8,
    widthProfile: 'wide',
    dataQuality: 'derived',
    captionTr: 'Outdoor rahatlığı',
    captionEn: 'Outdoor comfort',
    fitNoteTr: 'Merrell outdoor modelleri kalın çorapla kullanım için biraz geniş tasarlanır.',
    fitNoteEn: 'Merrell outdoor models are cut slightly roomy for thicker socks.',
    genders: ['men', 'women', 'kids']
  },
  Salomon: {
    display: 'Salomon',
    domain: 'salomon.com',
    cmAtEu42: 26.2,
    widthProfile: 'narrow',
    dataQuality: 'derived',
    captionTr: 'Dar, teknik kalıp',
    captionEn: 'Narrow technical fit',
    fitNoteTr: 'Salomon patika modelleri ayağı sıkıca sarar ve küçük kalır; yarım numara büyük yaygın tercihtir.',
    fitNoteEn: 'Salomon trail models hold the foot tightly and run small; half a size up is common.',
    genders: ['men', 'women']
  }
}

export const brandNames = Object.keys(brandProfiles)

/** Profili olmayan markalar için jenerik, açıkça işaretlenmiş fallback. */
export const genericProfile: BrandProfile = {
  display: 'Diğer',
  domain: '',
  cmAtEu42: GENERIC_CM_AT_EU42,
  widthProfile: 'standard',
  dataQuality: 'generic',
  captionTr: 'Sektör ortalaması kalıp',
  captionEn: 'Industry average fit',
  fitNoteTr: 'Bu marka için doğrulanmış beden tablomuz yok; sektör ortalaması kullanıldı.',
  fitNoteEn: 'We have no verified size chart for this brand; an industry average was used.',
  genders: ['men', 'women', 'kids']
}

export function getBrandProfile(brand: string): BrandProfile {
  return brandProfiles[brand] || { ...genericProfile, display: brand || 'Diğer' }
}

/** Marka + cinsiyet için beden tablosu. Sonuçlar önbelleklenir. */
const tableCache = new Map<string, SizeRow[]>()

export function getBrandTable(brand: string, gender: Gender): SizeRow[] {
  const key = `${brand}::${gender}`
  const cached = tableCache.get(key)
  if (cached) return cached

  const profile = getBrandProfile(brand)
  const effectiveGender = profile.genders.includes(gender) ? gender : 'men'
  const table = buildSizeTable(profile.cmAtEu42, effectiveGender)
  tableCache.set(key, table)
  return table
}

export function getBrandDomain(brand: string): string {
  const profile = brandProfiles[brand]
  if (profile?.domain) return profile.domain
  const clean = brand.toLowerCase().replace(/[^a-z0-9]/g, '')
  return clean ? `${clean}.com` : ''
}
