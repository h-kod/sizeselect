import { Gender } from '../data/sizeSystem'
import { FitFeedback, FootWidth, SizeSystem } from './recommendationEngine'

/**
 * Kalıcı beden profili.
 *
 * Eski sürümde yalnızca referans ayakkabı saklanıyordu ve kullanıcı her ürün
 * sayfasında dört adımı baştan yapıyordu. Profil, ikinci ziyaretten itibaren
 * akışı sıfır tıka indirir.
 *
 * Veri yalnızca tarayıcıda tutulur, kişisel veri içermez: ayak ölçüsü, genişlik
 * ve referans ayakkabılar.
 */

export const PROFILE_KEY = 'shoefit.profile.v2'
const LEGACY_CABINET_KEY = 'shoefit-cabinet'

export interface ReferenceShoe {
  id: string
  brand: string
  modelId?: string
  size: string
  system: SizeSystem
  fit: FitFeedback
  addedAt: string
}

export interface ShoeFitProfile {
  version: 2
  gender: Gender
  footWidth: FootWidth
  /** Doğrudan ölçüm veya referanstan türetilmiş ayak uzunluğu */
  footCm?: number
  /** footCm doğrudan ölçümle mi elde edildi */
  measured: boolean
  references: ReferenceShoe[]
  updatedAt: string
}

export const emptyProfile: ShoeFitProfile = {
  version: 2,
  gender: 'men',
  footWidth: 'normal',
  measured: false,
  references: [],
  updatedAt: ''
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

/** v1 dolap verisini yeni şemaya taşır; kullanıcı geçmişini kaybetmez. */
function migrateLegacy(): ShoeFitProfile | null {
  const legacy = safeParse<any[]>(localStorage.getItem(LEGACY_CABINET_KEY))
  if (!Array.isArray(legacy) || legacy.length === 0) return null

  const fitMap: Record<string, FitFeedback> = {
    kucuk: 'tight',
    tam: 'perfect',
    buyuk: 'loose'
  }
  const widthMap: Record<string, FootWidth> = {
    dar: 'narrow',
    normal: 'normal',
    genis: 'wide'
  }

  const references: ReferenceShoe[] = legacy
    .filter(item => item && item.brand)
    .map(item => ({
      id: String(item.id || `${item.brand}-${Date.now()}`),
      brand: String(item.brand),
      size: String(item.size ?? '42'),
      system: (item.system || 'EU') as SizeSystem,
      fit: fitMap[item.fit] || 'perfect',
      addedAt: new Date().toISOString()
    }))

  if (references.length === 0) return null

  const first = legacy[0]
  return {
    ...emptyProfile,
    footWidth: widthMap[first?.width] || 'normal',
    references,
    updatedAt: new Date().toISOString()
  }
}

export function loadProfile(): ShoeFitProfile | null {
  if (typeof localStorage === 'undefined') return null

  const stored = safeParse<ShoeFitProfile>(localStorage.getItem(PROFILE_KEY))
  if (stored && stored.version === 2) return stored

  const migrated = migrateLegacy()
  if (migrated) {
    saveProfile(migrated)
    try {
      localStorage.removeItem(LEGACY_CABINET_KEY)
    } catch {
      /* yok say */
    }
    return migrated
  }

  return null
}

export function saveProfile(profile: ShoeFitProfile): ShoeFitProfile {
  const next: ShoeFitProfile = { ...profile, version: 2, updatedAt: new Date().toISOString() }
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(next))
  } catch (error) {
    console.warn('[ShoeFit] Profil kaydedilemedi:', error)
  }
  return next
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(PROFILE_KEY)
  } catch {
    /* yok say */
  }
}

/** Profil, öneri üretmeye yetecek kadar bilgi içeriyor mu? */
export function isProfileComplete(profile: ShoeFitProfile | null): boolean {
  if (!profile) return false
  if (typeof profile.footCm === 'number' && profile.footCm > 0) return true
  return profile.references.length > 0
}

export function upsertReference(
  profile: ShoeFitProfile,
  reference: Omit<ReferenceShoe, 'id' | 'addedAt'>
): ShoeFitProfile {
  const others = profile.references.filter(
    item => !(item.brand === reference.brand && item.modelId === reference.modelId)
  )
  const entry: ReferenceShoe = {
    ...reference,
    id: `${reference.brand}-${reference.size}-${Date.now()}`,
    addedAt: new Date().toISOString()
  }
  return { ...profile, references: [entry, ...others].slice(0, 6) }
}

export function removeReference(profile: ShoeFitProfile, id: string): ShoeFitProfile {
  return { ...profile, references: profile.references.filter(item => item.id !== id) }
}
