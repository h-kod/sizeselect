import { useCallback, useEffect, useMemo, useState } from 'react'
import { Gender, SizeSystem, formatSize } from '../data/sizeSystem'
import { brandNames, getBrandProfile } from '../data/brandProfiles'
import { matchModel } from '../data/models'
import {
  FitFeedback,
  FootWidth,
  RecommendationResult,
  recommendSize
} from '../utils/recommendationEngine'
import { InventorySnapshot, findVariant, readInventory } from '../utils/inventory'
import { addToCart, findAddToCartButton, selectVariant } from '../utils/domIntegration'
import {
  ShoeFitProfile,
  emptyProfile,
  isProfileComplete,
  loadProfile,
  saveProfile,
  upsertReference
} from '../utils/profile'
import {
  FitOutcome,
  getCalibration,
  getPendingRecommendations,
  recordOutcome,
  recordRecommendation
} from '../utils/feedback'
import { createTranslator, resolveLang } from './i18n'
import { widgetBus } from './bus'
import { Drawer, StepBar, useAnnouncer } from './ui'
import { BrandStep, DetailStep, FeedbackPrompt, MeasureStep, MethodStep, ResultStep } from './steps'

export interface ShoeSizeWidgetProps {
  storeId: string
  productId: string
  targetBrand: string
  targetModel?: string
  gender?: string
  languageMode: string
  sizeSelector?: string
  cartSelector?: string
  brandSelector?: string
  modelSelector?: string
  storeSizeSystem?: string
  allowAddToCart?: boolean
  embedded?: boolean
  triggerLabel?: string
}

type Method = 'reference' | 'measure' | 'profile'
type Screen = 'method' | 'brand' | 'detail' | 'result'

const DEFAULT_BRAND = 'Nike'

function readSelectorText(selector?: string): string {
  if (!selector) return ''
  try {
    const element = document.querySelector(selector)
    return (element?.textContent || '').trim()
  } catch (error) {
    console.warn('[ShoeFit] Geçersiz seçici:', selector, error)
    return ''
  }
}

/** Sayfadan okunan serbest metni bilinen bir markaya eşler. */
function matchBrand(text: string): string | null {
  const haystack = text.toLowerCase()
  if (!haystack.trim()) return null

  let best: string | null = null
  for (const brand of brandNames) {
    const needle = brand.toLowerCase()
    if (haystack.includes(needle) && (!best || needle.length > best.length)) {
      best = brand
    }
  }
  return best
}

/** Merchant'ın verdiği kategori; "auto" veya tanımsızsa sayfadan algılanır. */
function parseGender(value: string | undefined): Gender | null {
  return value === 'men' || value === 'women' || value === 'kids' ? value : null
}

/**
 * Kelime sınırı kontrolü. `\b` yalnızca ASCII harflerini tanıdığı için
 * "çocuk" gibi Türkçe harfle başlayan kelimelerde eşleşmiyordu.
 */
function containsWord(haystack: string, words: string[]): boolean {
  return words.some(word =>
    new RegExp(`(?:^|[^\\p{L}\\p{N}])${word}(?:[^\\p{L}\\p{N}]|$)`, 'u').test(haystack)
  )
}

function guessGenderFromPage(): Gender | null {
  const haystack = `${document.title} ${location.pathname}`.toLowerCase()
  if (containsWord(haystack, ['kids?', 'child', 'çocuk', 'cocuk', 'junior', 'bebek'])) return 'kids'
  if (containsWord(haystack, ['women', 'woman', 'female', 'kadın', 'kadin', 'wmns'])) return 'women'
  if (containsWord(haystack, ['men', 'man', 'male', 'erkek'])) return 'men'
  return null
}

export default function ShoeSizeWidget({
  storeId,
  productId,
  targetBrand,
  targetModel,
  gender: genderProp,
  languageMode,
  sizeSelector,
  cartSelector,
  brandSelector,
  modelSelector,
  storeSizeSystem,
  allowAddToCart = true,
  embedded = false,
  triggerLabel
}: ShoeSizeWidgetProps) {
  const lang = useMemo(() => resolveLang(languageMode), [languageMode])
  const t = useMemo(() => createTranslator(lang), [lang])
  const { announce, node: announcerNode } = useAnnouncer()

  const [open, setOpen] = useState(embedded)
  const [screen, setScreen] = useState<Screen>('method')
  const [method, setMethod] = useState<Method>('reference')

  const [profile, setProfile] = useState<ShoeFitProfile | null>(null)
  const explicitGender = useMemo(() => parseGender(genderProp), [genderProp])
  const [gender, setGender] = useState<Gender>(explicitGender ?? 'men')

  const [refBrand, setRefBrand] = useState(DEFAULT_BRAND)
  const [refModelId, setRefModelId] = useState('')
  const [refSystem, setRefSystem] = useState<SizeSystem>('EU')
  const [refSize, setRefSize] = useState('42')
  const [refFit, setRefFit] = useState<FitFeedback>('perfect')
  const [footWidth, setFootWidth] = useState<FootWidth>('normal')
  const [measuredInput, setMeasuredInput] = useState('')

  const [inventory, setInventory] = useState<InventorySnapshot>({
    options: [],
    offeredEuSizes: [],
    inStockEuSizes: [],
    detectedSystem: 'EU',
    source: 'none'
  })

  const [overrideEu, setOverrideEu] = useState<number | null>(null)
  const [toast, setToast] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [pendingFeedback, setPendingFeedback] = useState<{ id: string; brand: string; eu: number } | null>(null)
  const [canAddToCart, setCanAddToCart] = useState(false)

  /* ---------------------------------------------------------------------- */
  /* Sayfa bağlamını çöz                                                     */
  /* ---------------------------------------------------------------------- */

  const resolvedTargetBrand = useMemo(() => {
    const scraped = readSelectorText(brandSelector)
    return matchBrand(scraped) || targetBrand || DEFAULT_BRAND
  }, [brandSelector, targetBrand])

  const resolvedTargetModel = useMemo(() => {
    const explicit = targetModel ? matchModel(targetModel, resolvedTargetBrand) : null
    if (explicit) return explicit

    const scraped = readSelectorText(modelSelector)
    if (scraped) {
      const matched = matchModel(scraped, resolvedTargetBrand)
      if (matched) return matched
    }

    return matchModel(document.title || '', resolvedTargetBrand)
  }, [targetModel, modelSelector, resolvedTargetBrand])

  const productLabel = useMemo(() => {
    const title = (document.title || '').split(/[-|·]/)[0].trim()
    return title || resolvedTargetBrand
  }, [resolvedTargetBrand])

  /* ---------------------------------------------------------------------- */
  /* Başlangıç: profil, cinsiyet, envanter, bekleyen geri bildirim           */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const stored = loadProfile()
    if (stored) {
      setProfile(stored)
      // Merchant kategoriyi açıkça verdiyse o kazanır: ziyaretçinin kayıtlı
      // profili erkek olsa da kadın ürünü sayfasında kadın ölçeği kullanılmalı.
      setGender(explicitGender ?? stored.gender)
      setFootWidth(stored.footWidth)
      if (stored.references[0]) {
        const reference = stored.references[0]
        setRefBrand(reference.brand)
        setRefModelId(reference.modelId || '')
        setRefSystem(reference.system)
        setRefSize(reference.size)
        setRefFit(reference.fit)
      }
      if (typeof stored.footCm === 'number') {
        setMeasuredInput(String(stored.footCm))
      }
    } else if (explicitGender) {
      setGender(explicitGender)
    } else {
      const guessed = guessGenderFromPage()
      if (guessed) setGender(guessed)
    }

    const pending = getPendingRecommendations()[0]
    if (pending) {
      setPendingFeedback({ id: pending.id, brand: pending.brand, eu: pending.recommendedEu })
    }
    // Yalnızca ilk bağlanmada çalışır: yeniden çalışırsa kullanıcının akış
    // içinde yaptığı seçimleri kayıtlı profille ezerdi. Yapılandırma değişince
    // embed katmanı bileşeni zaten baştan kurar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refreshInventory = useCallback(() => {
    const snapshot = readInventory({
      sizeSelector,
      systemHint: storeSizeSystem,
      brand: resolvedTargetBrand,
      gender
    })
    setInventory(snapshot)
    setCanAddToCart(allowAddToCart && findAddToCartButton(cartSelector) !== null)
  }, [sizeSelector, storeSizeSystem, resolvedTargetBrand, gender, allowAddToCart, cartSelector])

  useEffect(() => {
    refreshInventory()
  }, [refreshInventory])

  // Tema varyantları geç yüklüyor olabilir; panel her açıldığında yeniden oku.
  useEffect(() => {
    if (open) refreshInventory()
  }, [open, refreshInventory])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    const onClose = () => setOpen(false)

    // Hem programatik API (bus) hem de merchant'ın kendi yayabileceği
    // pencere olayları desteklenir.
    const unsubscribe = widgetBus.subscribe(command => {
      if (command === 'open') onOpen()
      else onClose()
    })

    window.addEventListener('shoefit_open_widget', onOpen)
    window.addEventListener('shoefit_close_widget', onClose)

    return () => {
      unsubscribe()
      window.removeEventListener('shoefit_open_widget', onOpen)
      window.removeEventListener('shoefit_close_widget', onClose)
    }
  }, [])

  useEffect(() => {
    if (embedded) return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, embedded])

  /* ---------------------------------------------------------------------- */
  /* Öneri                                                                   */
  /* ---------------------------------------------------------------------- */

  const measuredCm = useMemo(() => {
    const value = parseFloat(measuredInput.replace(',', '.'))
    return isNaN(value) ? undefined : value
  }, [measuredInput])

  const measureInvalid = measuredInput !== '' && (measuredCm === undefined || measuredCm < 18 || measuredCm > 35)

  const buildResult = useCallback(
    (useMeasurement: boolean): RecommendationResult =>
      recommendSize({
        targetBrand: resolvedTargetBrand,
        targetModelId: resolvedTargetModel?.id,
        gender,
        refBrand,
        refModelId: refModelId || undefined,
        refSize,
        refSystem,
        refFit,
        measuredCm: useMeasurement ? measuredCm : undefined,
        footWidth,
        offeredEuSizes: inventory.offeredEuSizes,
        inStockEuSizes: inventory.inStockEuSizes,
        calibrationCm: getCalibration(resolvedTargetBrand, gender)
      }),
    [
      resolvedTargetBrand,
      resolvedTargetModel,
      gender,
      refBrand,
      refModelId,
      refSize,
      refSystem,
      refFit,
      measuredCm,
      footWidth,
      inventory
    ]
  )

  const result = useMemo(() => {
    const useMeasurement = method === 'measure' || (method === 'profile' && profile?.measured === true)
    if (useMeasurement && (measuredCm === undefined || measureInvalid)) return null
    return buildResult(useMeasurement)
  }, [method, profile, measuredCm, measureInvalid, buildResult])

  /** Tetikleyici butonda gösterilecek hazır öneri (profil varsa). */
  const previewEu = useMemo(() => {
    if (!isProfileComplete(profile)) return null
    const useMeasurement = profile?.measured === true && typeof profile.footCm === 'number'
    if (useMeasurement && (measuredCm === undefined || measureInvalid)) return null
    try {
      return buildResult(useMeasurement).recommendedEu
    } catch {
      return null
    }
  }, [profile, measuredCm, measureInvalid, buildResult])

  const displayedResult = useMemo(() => {
    if (!result) return null
    if (overrideEu === null) return result
    return { ...result, recommendedEu: overrideEu, substituted: false }
  }, [result, overrideEu])

  /* ---------------------------------------------------------------------- */
  /* Aksiyonlar                                                              */
  /* ---------------------------------------------------------------------- */

  const showToast = useCallback(
    (message: string) => {
      setToast(message)
      announce(message)
      window.setTimeout(() => setToast(''), 2600)
    },
    [announce]
  )

  const emit = useCallback(
    (event: string, payload: Record<string, unknown> = {}) => {
      const detail = { event, storeId, productId, ...payload }
      window.dispatchEvent(new CustomEvent('shoefit_widget_event', { detail }))

      const dataLayer = (window as any).dataLayer
      if (Array.isArray(dataLayer)) {
        try {
          dataLayer.push({ event: `shoefit_${event}`, shoefit_data: detail })
        } catch {
          /* GTM hatası akışı durdurmamalı */
        }
      }
    },
    [storeId, productId]
  )

  const openPanel = useCallback(() => {
    setOpen(true)
    emit('widget_opened', { hasProfile: isProfileComplete(profile) })

    // Profil hazırsa kullanıcıyı doğrudan sonuca götür — sıfır tık.
    if (isProfileComplete(profile)) {
      setMethod(profile?.measured ? 'measure' : 'reference')
      setScreen('result')
    }
  }, [emit, profile])

  const closePanel = useCallback(() => {
    setOpen(false)
    emit('widget_closed')
  }, [emit])

  const handleMethod = useCallback(
    (chosen: Method) => {
      setMethod(chosen)
      if (chosen === 'profile') {
        setScreen('result')
      } else if (chosen === 'measure') {
        setScreen('detail')
      } else {
        setScreen('brand')
      }
      emit('method_selected', { method: chosen })
    },
    [emit]
  )

  const persistProfile = useCallback(() => {
    const base = profile || { ...emptyProfile }
    let next: ShoeFitProfile = {
      ...base,
      gender,
      footWidth,
      footCm: result?.footCm,
      measured: method === 'measure'
    }

    if (method !== 'measure') {
      next = upsertReference(next, {
        brand: refBrand,
        modelId: refModelId || undefined,
        size: refSize,
        system: refSystem,
        fit: refFit
      })
    }

    const saved = saveProfile(next)
    setProfile(saved)
    setProfileSaved(true)
    showToast(t('profileSaved'))
    emit('profile_saved', { gender, measured: next.measured })
  }, [profile, gender, footWidth, result, method, refBrand, refModelId, refSize, refSystem, refFit, showToast, t, emit])

  const trackRecommendation = useCallback(
    (eu: number) => {
      recordRecommendation({
        brand: resolvedTargetBrand,
        modelId: resolvedTargetModel?.id,
        gender,
        recommendedEu: eu,
        storeId,
        productId
      })
    },
    [resolvedTargetBrand, resolvedTargetModel, gender, storeId, productId]
  )

  const handleSelectSize = useCallback(
    (alsoAddToCart: boolean) => {
      if (!displayedResult) return
      const eu = displayedResult.recommendedEu
      const variant = findVariant(inventory, eu)
      const selected = variant ? selectVariant(variant) : false

      trackRecommendation(eu)
      emit('size_selected', {
        recommendedEu: eu,
        autoSelected: selected,
        availability: displayedResult.availability,
        confidence: displayedResult.confidence
      })

      if (!selected) {
        showToast(t('manualHint', { size: formatSize(eu, lang) }))
        return
      }

      if (alsoAddToCart) {
        const added = addToCart(cartSelector)
        emit('add_to_cart', { recommendedEu: eu, success: added })
        showToast(added ? t('addedToCart') : t('sizeSelected'))
        if (added) window.setTimeout(() => setOpen(false), 1400)
        return
      }

      showToast(t('sizeSelected'))
      window.setTimeout(() => setOpen(false), 1200)
    },
    [displayedResult, inventory, trackRecommendation, emit, showToast, t, lang, cartSelector]
  )

  const handleFeedback = useCallback(
    (outcome: FitOutcome) => {
      if (!pendingFeedback) return
      recordOutcome(pendingFeedback.id, outcome)
      emit('feedback_recorded', { outcome, brand: pendingFeedback.brand })
      setPendingFeedback(null)
      showToast(t('feedbackThanks'))
    },
    [pendingFeedback, emit, showToast, t]
  )

  const restart = useCallback(() => {
    setScreen('method')
    setOverrideEu(null)
    setProfileSaved(false)
  }, [])

  /* ---------------------------------------------------------------------- */
  /* Görünüm                                                                 */
  /* ---------------------------------------------------------------------- */

  const steps = [t('stepMethod'), method === 'measure' ? t('stepDetails') : t('stepReference'), t('stepResult')]
  const stepIndex = screen === 'method' ? 0 : screen === 'result' ? 2 : 1

  const profileSummary = useMemo(() => {
    if (!isProfileComplete(profile) || !profile) return null
    if (profile.measured && typeof profile.footCm === 'number') {
      return t('savedProfileFoot', { cm: formatSize(profile.footCm, lang) })
    }
    const reference = profile.references[0]
    return reference ? t('savedProfileRef', { brand: reference.brand, size: reference.size }) : null
  }, [profile, t, lang])

  const recentBrands = useMemo(
    () => (profile?.references || []).map(reference => reference.brand).slice(0, 4),
    [profile]
  )

  const canContinueFromDetail =
    method === 'measure' ? measuredCm !== undefined && !measureInvalid : true

  const subtitle =
    screen === 'result'
      ? `${resolvedTargetBrand}${resolvedTargetModel ? ` · ${resolvedTargetModel.name}` : ''}`
      : productLabel

  const footer =
    screen === 'result' && displayedResult ? (
      <div className="sf-actions">
        {canAddToCart ? (
          <>
            <button type="button" className="sf-btn sf-btn--primary" onClick={() => handleSelectSize(true)}>
              {t('selectAndCart')}
            </button>
            <button type="button" className="sf-btn sf-btn--secondary" onClick={() => handleSelectSize(false)}>
              {t('selectSize')}
            </button>
          </>
        ) : (
          <button type="button" className="sf-btn sf-btn--primary" onClick={() => handleSelectSize(false)}>
            {t('selectSize')}
          </button>
        )}

        <div className="sf-actions__row">
          <button
            type="button"
            className="sf-btn sf-btn--ghost"
            onClick={persistProfile}
            disabled={profileSaved}
          >
            {profileSaved ? t('profileSaved') : t('saveProfile')}
          </button>
          <button type="button" className="sf-btn sf-btn--ghost" onClick={restart}>
            {t('restart')}
          </button>
        </div>

        <p className="sf-privacy">{t('privacyNote')}</p>
      </div>
    ) : screen === 'detail' ? (
      <div className="sf-actions sf-actions__row">
        <button
          type="button"
          className="sf-btn sf-btn--secondary"
          onClick={() => setScreen(method === 'measure' ? 'method' : 'brand')}
        >
          {t('back')}
        </button>
        <button
          type="button"
          className="sf-btn sf-btn--primary"
          disabled={!canContinueFromDetail}
          onClick={() => {
            setOverrideEu(null)
            setScreen('result')
            emit('recommendation_viewed', { method })
          }}
        >
          {t('showResult')}
        </button>
      </div>
    ) : screen === 'brand' ? (
      <div className="sf-actions sf-actions__row">
        <button type="button" className="sf-btn sf-btn--secondary" onClick={() => setScreen('method')}>
          {t('back')}
        </button>
      </div>
    ) : null

  return (
    <div className="sf-root">
      {announcerNode}

      {!embedded && (
        <button type="button" className="sf-trigger" onClick={openPanel}>
          <span className="sf-trigger__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M3 17h18M5 17l1.5-6h11L19 17M8 11V7h8v4" />
            </svg>
          </span>
          {previewEu !== null
            ? t('triggerWithSize', { size: formatSize(previewEu, lang) })
            : triggerLabel || t('triggerDefault')}
        </button>
      )}

      {!embedded && open && <div className="sf-scrim" onClick={closePanel} aria-hidden="true" />}

      {(open || embedded) && (
        <Drawer
          open={open}
          onClose={closePanel}
          title={t('title')}
          subtitle={subtitle}
          closeLabel={t('close')}
          embedded={embedded}
          footer={footer}
        >
          {pendingFeedback && (
            <FeedbackPrompt
              t={t}
              lang={lang}
              brand={pendingFeedback.brand}
              eu={pendingFeedback.eu}
              onAnswer={handleFeedback}
              onDismiss={() => setPendingFeedback(null)}
            />
          )}

          <StepBar steps={steps} current={stepIndex} />

          {screen === 'method' && (
            <MethodStep
              t={t}
              gender={gender}
              onGenderChange={setGender}
              profile={profile}
              profileSummary={profileSummary}
              onSelect={handleMethod}
            />
          )}

          {screen === 'brand' && (
            <BrandStep
              t={t}
              lang={lang}
              selected={refBrand}
              recentBrands={recentBrands}
              onSelect={brand => {
                setRefBrand(brand)
                setRefModelId('')
                setScreen('detail')
                emit('brand_selected', { brand, known: getBrandProfile(brand).dataQuality !== 'generic' })
              }}
            />
          )}

          {screen === 'detail' &&
            (method === 'measure' ? (
              <MeasureStep
                t={t}
                value={measuredInput}
                onChange={setMeasuredInput}
                width={footWidth}
                onWidthChange={setFootWidth}
                invalid={measureInvalid}
              />
            ) : (
              <DetailStep
                t={t}
                lang={lang}
                gender={gender}
                refBrand={refBrand}
                refModelId={refModelId}
                onModelChange={setRefModelId}
                system={refSystem}
                onSystemChange={setRefSystem}
                size={refSize}
                onSizeChange={setRefSize}
                fit={refFit}
                onFitChange={setRefFit}
                width={footWidth}
                onWidthChange={setFootWidth}
              />
            ))}

          {screen === 'result' &&
            (displayedResult ? (
              <ResultStep
                t={t}
                lang={lang}
                result={displayedResult}
                targetBrand={resolvedTargetBrand}
                gender={gender}
                inventory={inventory}
                onPickAlternative={eu => {
                  setOverrideEu(eu)
                  emit('alternative_selected', { recommendedEu: eu })
                }}
              />
            ) : (
              <div className="sf-empty">
                <p>{t('measureInvalid')}</p>
                <button type="button" className="sf-btn sf-btn--ghost" onClick={restart}>
                  {t('restart')}
                </button>
              </div>
            ))}

          {toast && <div className="sf-toast">{toast}</div>}
        </Drawer>
      )}
    </div>
  )
}
