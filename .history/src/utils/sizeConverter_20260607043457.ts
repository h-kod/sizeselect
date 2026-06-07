import { brandSizeProfiles } from '../data/brandSizeProfiles'

export type SizeSystem = 'EU' | 'US' | 'UK' | 'CM'

export function toCm(brand: string, value: number, system: SizeSystem) {
  const profile: any = (brandSizeProfiles as any)[brand]
  if (!profile) return null
  if (system === 'CM') return value
  const sizes = profile.sizes
  // find closest in given system
  const key = system.toLowerCase()
  let closest = sizes[0]
  let min = Infinity
  for (const s of sizes) {
    const v = (s as any)[key === 'us' ? 'us_m' : key === 'uk' ? 'uk_m' : 'eu']
    if (v == null) continue
    const diff = Math.abs(v - value)
    if (diff < min) {
      min = diff
      closest = s
    }
  }
  return closest.cm
}

export function findNearestSizeByCm(brand: string, cm: number) {
  const profile: any = (brandSizeProfiles as any)[brand]
  if (!profile) return null
  let best = profile.sizes[0]
  let min = Math.abs(best.cm - cm)
  for (const s of profile.sizes) {
    const d = Math.abs(s.cm - cm)
    if (d < min) {
      min = d
      best = s
    }
  }
  return best
}

export function applyFitPreference(euSize:number, pref:string){
  if(pref === 'dar') return euSize - 0.5
  if(pref === 'rahat' || pref==='tarakli') return euSize + 0.5
  return euSize
}
