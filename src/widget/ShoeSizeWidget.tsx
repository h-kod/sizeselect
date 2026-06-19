import React, { useEffect, useMemo, useState } from 'react'
import Drawer from './drawer'
import { recommendSize, SizeSystem, FitFeedback, FootWidth } from '../utils/recommendationEngine'
import { brandMeta } from '../data/brandMeta'
import { trySelectSize, tryAddToCart, canSelectSize, canAddToCart } from '../utils/domIntegration'

interface ShoeSizeWidgetProps {
  storeId: string
  productId: string
  targetBrand: string
  targetModel: string
  targetSizeSystem: string
  languageMode: string
  stylePreset: string
  sizeSelector?: string
  cartSelector?: string
  brandSelector?: string
  showAddToCart?: string
  showSelectSize?: string
  initialOpen?: boolean
  initialStep?: number
}

interface SavedShoe {
  id: string
  brand: string
  size: string
  system: SizeSystem
  fit: FitFeedback
  width: FootWidth
}

const TRANSLATIONS = {
  tr: {
    title: 'Beden Asistanı',
    subtitle: 'Doğru ayakkabı numaranızı kolayca bulun.',
    back: 'Geri',
    next: 'Devam Et',
    close: 'Kapat',
    start: 'Bedenimi Bul',
    stepBrand: 'Marka',
    stepSize: 'Numara',
    stepFit: 'Kalıp',
    stepResult: 'Sonuç',
    selectBrand: 'Daha önce giydiğiniz markayı seçin:',
    searchBrand: 'Marka ara...',
    selectSize: 'Mevcut numaranızı seçin:',
    sizeSystem: 'Beden Sistemi:',
    orMeasure: 'Veya ayak uzunluğunuzu ölçün:',
    measureOption: 'Ayağımı ölçerek bulmak istiyorum',
    measureCmLabel: 'Ayak Uzunluğu (cm):',
    measureInstruction: 'Topuğunuzu duvara yaslayıp en uzun parmağınıza kadar olan mesafeyi ölçün.',
    measureBtn: 'Hesapla',
    howItFits: 'Bu ayakkabı ayağınıza nasıl oluyordu?',
    fitTight: 'Dar / Sıkıyordu',
    fitPerfect: 'Tam / Rahat oluyordu',
    fitLoose: 'Bol / Büyük geliyordu',
    footWidth: 'Ayak yapınız nasıl?',
    widthNarrow: 'Dar / İnce',
    widthNormal: 'Normal',
    widthWide: 'Geniş / Taraklı',
    recommendedTitle: 'Sana Önerimiz',
    alternativeTitle: 'Alternatif Numara',
    confidenceScore: 'Güven Skoru',
    fitNote: 'Kalıp Notu',
    warnings: 'Uyarılar',
    selectSizeBtn: 'Bu Numarayı Sepete Ekle',
    selectOnlySizeBtn: 'Numarayı Seç',
    saveShoesBtn: 'Dolabıma Kaydet',
    savedCabinetTitle: 'Dolabım:',
    noSavedShoes: 'Kayıtlı ayakkabı yok.',
    targetProduct: 'Aradığınız model:',
    successSelect: 'Beden seçildi ve sepete eklendi!',
    successSelectOnly: 'Beden seçildi!',
    successSave: 'Ayakkabı dolabınıza kaydedildi!',
    resetBtn: 'Yeniden Hesapla',
    targetBrandConfirmTitle: 'Hedef Markayı Doğrula',
    targetBrandConfirmDesc: 'Beden hesaplaması yapılacak hedef ayakkabı markasını seçin:',
    showResultBtn: 'Bedenimi Göster',
    changeTargetBrand: 'Değiştir',
    selectTargetBrandPlaceholder: 'Hedef marka ara/seç...'
  },
  en: {
    title: 'Size Assistant',
    subtitle: 'Find your perfect shoe size easily.',
    back: 'Back',
    next: 'Continue',
    close: 'Close',
    start: 'Find My Size',
    stepBrand: 'Brand',
    stepSize: 'Size',
    stepFit: 'Fit Feedback',
    stepResult: 'Result',
    selectBrand: 'Select a brand you already wear:',
    searchBrand: 'Search brand...',
    selectSize: 'Select your current size:',
    sizeSystem: 'Size System:',
    orMeasure: 'Or measure your foot length:',
    measureOption: 'I want to measure my foot',
    measureCmLabel: 'Foot Length (cm):',
    measureInstruction: 'Place your heel against a wall and measure to the tip of your longest toe.',
    measureBtn: 'Calculate',
    howItFits: 'How did that shoe fit you?',
    fitTight: 'Too Tight / Small',
    fitPerfect: 'Fits Well / Perfect',
    fitLoose: 'Too Loose / Large',
    footWidth: 'What is your foot width?',
    widthNarrow: 'Narrow / Thin',
    widthNormal: 'Normal',
    widthWide: 'Wide / Roomy',
    recommendedTitle: 'Recommended Size',
    alternativeTitle: 'Alternative Size',
    confidenceScore: 'Confidence Score',
    fitNote: 'Fit Note',
    warnings: 'Warnings',
    selectSizeBtn: 'Add This Size to Cart',
    selectOnlySizeBtn: 'Select Size',
    saveShoesBtn: 'Save to Cabinet',
    savedCabinetTitle: 'Cabinet:',
    noSavedShoes: 'No saved shoes yet.',
    targetProduct: 'Looking at model:',
    successSelect: 'Size selected and added to cart!',
    successSelectOnly: 'Size selected!',
    successSave: 'Shoe saved to cabinet!',
    resetBtn: 'Recalculate',
    targetBrandConfirmTitle: 'Verify Target Brand',
    targetBrandConfirmDesc: 'Select the target shoe brand for size calculation:',
    showResultBtn: 'Show My Size',
    changeTargetBrand: 'Change',
    selectTargetBrandPlaceholder: 'Search/select target brand...'
  }
}

const LOCAL_BRANDS = Object.keys(brandMeta)

const SYSTEM_SIZES = {
  EU: ['36', '37', '38', '39', '40', '41', '42', '42.5', '43', '44', '45', '46'],
  US: ['4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
  UK: ['3.5', '4', '4.5', '5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'],
  CM: ['22.5', '23', '23.5', '24', '24.5', '25', '25.5', '26', '26.5', '27', '27.5', '28', '28.5', '29', '29.5', '30']
}

const BRAND_DOMAINS: Record<string, string> = {
  Nike: 'nike.com',
  Adidas: 'adidas.com',
  Puma: 'puma.com',
  'New Balance': 'newbalance.com',
  Converse: 'converse.com',
  Vans: 'vans.com',
  Reebok: 'reebok.com',
  Skechers: 'skechers.com',
  ASICS: 'asics.com',
  Jordan: 'jordan.com',
  Fila: 'fila.com',
  Brooks: 'brooksrunning.com',
  Merrell: 'merrell.com',
  Salomon: 'salomon.com'
}

function getBrandDomain(brand: string): string {
  if (BRAND_DOMAINS[brand]) return BRAND_DOMAINS[brand]
  const clean = brand.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${clean}.com`
}

function calculateSimilarity(s1: string, s2: string): number {
  const m = s1.length
  const n = s2.length
  if (m === 0) return n === 0 ? 1 : 0
  if (n === 0) return 0

  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
      }
    }
  }

  const distance = dp[m][n]
  const maxLen = Math.max(m, n)
  return 1 - distance / maxLen
}

function getBrandMatch(scrapedText: string, brands: string[]): string | null {
  const cleanScraped = scrapedText.trim().toLowerCase()
  if (!cleanScraped) return null

  // 1. Direct word-level matching
  const words = cleanScraped.split(/\s+/)
  for (const brand of brands) {
    const cleanBrand = brand.toLowerCase()
    if (words.includes(cleanBrand) || cleanScraped.includes(cleanBrand)) {
      return brand
    }
  }

  // 2. Fuzzy similarity check
  let bestMatch: string | null = null
  let bestScore = 0

  for (const brand of brands) {
    const cleanBrand = brand.toLowerCase()
    
    const wholeScore = calculateSimilarity(cleanScraped, cleanBrand)
    if (wholeScore > bestScore) {
      bestScore = wholeScore
      bestMatch = brand
    }

    for (const word of words) {
      const wordScore = calculateSimilarity(word, cleanBrand)
      if (wordScore > bestScore) {
        bestScore = wordScore
        bestMatch = brand
      }
    }
  }

  if (bestScore >= 0.70) {
    return bestMatch
  }

  return null
}

export default function ShoeSizeWidget({
  storeId,
  productId,
  targetBrand,
  targetModel,
  targetSizeSystem,
  languageMode,
  stylePreset,
  sizeSelector,
  cartSelector,
  brandSelector,
  showAddToCart = 'true',
  showSelectSize = 'true',
  initialStep = 1
}: ShoeSizeWidgetProps) {
  const isDemo = storeId === 'STORE_DEMO'
  const [open, setOpen] = useState(isDemo)
  const [currentStep, setCurrentStep] = useState(initialStep)

  const [resolvedTargetBrand, setResolvedTargetBrand] = useState(targetBrand)
  const [targetBrandConfirmed, setTargetBrandConfirmed] = useState(false)

  // Sayfa başlığından ürün adını öğren: - veya | öncesi, ilk 4 kelime
  const pageTitle = useMemo(() => {
    const raw = document.title || ''
    const trimmed = raw.split(/[-|]/)[0].trim()
    const words = trimmed.split(/\s+/).slice(0, 4).join(' ')
    return words || targetBrand
  }, [])

  useEffect(() => {
    const handleOpen = () => setOpen(true)
    const handleClose = () => setOpen(false)
    window.addEventListener('shoefit_open_widget', handleOpen)
    window.addEventListener('shoefit_close_widget', handleClose)
    return () => {
      window.removeEventListener('shoefit_open_widget', handleOpen)
      window.removeEventListener('shoefit_close_widget', handleClose)
    }
  }, [])

  // Drawer açıkken body scroll'u kilitle (mobil için kritik)
  useEffect(() => {
    if (isDemo) return
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, isDemo])

  // Language setup
  const lang = useMemo(() => {
    if (languageMode === 'tr') return 'tr'
    if (languageMode === 'en') return 'en'
    return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
  }, [languageMode])

  const t = TRANSLATIONS[lang]

  // Form States
  const [refBrand, setRefBrand] = useState('Nike')
  const [refSizeSystem, setRefSizeSystem] = useState<SizeSystem>('EU')
  const [refSizeValue, setRefSizeValue] = useState('42')
  const [measuredCm, setMeasuredCm] = useState<number | undefined>(undefined)
  const [isMeasuring, setIsMeasuring] = useState(false)
  const [refFitFeedback, setRefFitFeedback] = useState<FitFeedback>('tam')
  const [refFootWidth, setRefFootWidth] = useState<FootWidth>('normal')

  // Search Filters
  const [brandSearch, setBrandSearch] = useState('')

  // Brands list dynamically updated via redundant APIs
  const [dynamicBrands, setDynamicBrands] = useState<string[]>(LOCAL_BRANDS)
  const [cabinetImgErrors, setCabinetImgErrors] = useState<Record<string, boolean>>({})

  // Target elements detection
  const [showSelectSizeBtn, setShowSelectSizeBtn] = useState(true)
  const [showAddToCartBtn, setShowAddToCartBtn] = useState(true)

  // CSS for button details
  const ctaBehavior = showAddToCart === 'true' ? 'add_to_cart' : 'select_size'

  // Resolve Target Brand using similarity check
  useEffect(() => {
    if (brandSelector && brandSelector.trim() !== '') {
      try {
        const el = document.querySelector(brandSelector)
        if (el && el.textContent) {
          const text = el.textContent
          const matched = getBrandMatch(text, dynamicBrands)
          if (matched) {
            setResolvedTargetBrand(matched)
            console.log(`[ShoeFit] Auto-detected brand "${matched}" via selector "${brandSelector}" (Scraped: "${text.trim()}")`)
            return
          }
        }
      } catch (e) {
        console.warn('[ShoeFit] Brand selector evaluation failed:', e)
      }
    }
    // Fallback/Default
    setResolvedTargetBrand(targetBrand)
  }, [brandSelector, targetBrand, dynamicBrands])

  useEffect(() => {
    if (open) {
      const isSizeSelectorSet = sizeSelector && sizeSelector.trim() !== '';
      const isCartSelectorSet = cartSelector && cartSelector.trim() !== '';

      setShowSelectSizeBtn(showSelectSize === 'true' && isSizeSelectorSet ? canSelectSize(sizeSelector) : false)
      setShowAddToCartBtn(showAddToCart === 'true' && isCartSelectorSet ? canAddToCart(cartSelector) : false)
    }
  }, [open, sizeSelector, cartSelector, showSelectSize, showAddToCart])

  // Fetch unique brands from remote repositories redundantly (fallback execution)
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch('https://raw.githubusercontent.com/iffi96/Shoe-store-data-json/master/data004.json')
        if (!res.ok) throw new Error('API 1 load failed')
        const data = await res.json()
        
        const extracted = new Set<string>()
        Object.values(data).forEach((item: any) => {
          if (item && item.brand) {
            const rawBrand = item.brand.trim()
            const formatted = rawBrand.substring(0, 1).toUpperCase() + rawBrand.substring(1).toLowerCase()
            extracted.add(formatted)
          }
        })
        
        if (extracted.size > 0) {
          const combined = Array.from(new Set([...LOCAL_BRANDS, ...extracted])).sort()
          setDynamicBrands(combined)
          console.log('[ShoeFit] Brand list updated via API 1.')
          return
        }
      } catch (err) {
        console.warn('[ShoeFit] API 1 failed. Trying API 2...', err)
      }

      try {
        const res = await fetch('https://raw.githubusercontent.com/brainmentorspvtltd/hmr/master/shoes.json')
        if (!res.ok) throw new Error('API 2 load failed')
        const data = await res.json()
        
        const extracted = new Set<string>()
        if (data && Array.isArray(data.shoesdata)) {
          data.shoesdata.forEach((item: any) => {
            if (item && item.name) {
              const rawBrand = item.name.trim()
              const formatted = rawBrand.substring(0, 1).toUpperCase() + rawBrand.substring(1).toLowerCase()
              extracted.add(formatted)
            }
          })
        }

        if (extracted.size > 0) {
          const combined = Array.from(new Set([...LOCAL_BRANDS, ...extracted])).sort()
          setDynamicBrands(combined)
          console.log('[ShoeFit] Brand list updated via API 2.')
        }
      } catch (err) {
        console.warn('[ShoeFit] All remote brand APIs failed. Using local brand metadata registry.', err)
      }
    }

    fetchBrands()
  }, [])

  // Cabinet State
  const [savedShoes, setSavedShoes] = useState<SavedShoe[]>([])

  // Load Saved Cabinet
  useEffect(() => {
    const stored = localStorage.getItem('shoefit-cabinet')
    if (stored) {
      try {
        setSavedShoes(JSON.parse(stored))
      } catch {}
    }
  }, [])

  // Dynamic lists filter
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return dynamicBrands
    return dynamicBrands.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()))
  }, [dynamicBrands, brandSearch])

  // Calculate recommendation results
  const recommendation = useMemo(() => {
    if (currentStep < 4) return null
    return recommendSize({
      targetBrand: resolvedTargetBrand,
      refBrand,
      refSize: refSizeValue,
      refSystem: refSizeSystem,
      refFitFeedback,
      refFootWidth,
      measuredCm: isMeasuring ? measuredCm : undefined
    })
  }, [
    currentStep,
    resolvedTargetBrand,
    refBrand,
    refSizeValue,
    refSizeSystem,
    refFitFeedback,
    refFootWidth,
    isMeasuring,
    measuredCm
  ])

  const dynamicSubtitle = useMemo(() => {
    if (currentStep === 1) return t.subtitle

    const parts: string[] = []
    if (refBrand) parts.push(`🏷️ ${refBrand}`)
    if (currentStep > 2) {
      parts.push(`📏 ${isMeasuring ? `${measuredCm} cm` : `${refSizeValue} ${refSizeSystem}`}`)
    }
    if (currentStep > 3 && !isMeasuring && refFitFeedback) {
      const fitLabel = refFitFeedback === 'kucuk' ? t.fitTight : refFitFeedback === 'tam' ? t.fitPerfect : t.fitLoose
      parts.push(`✨ ${fitLabel}`)
    }

    if (parts.length === 0) return t.subtitle
    return `${lang === 'tr' ? 'Seçimleriniz' : 'Selections'}: ${parts.join(' • ')}`
  }, [currentStep, refBrand, refSizeValue, refSizeSystem, isMeasuring, measuredCm, refFitFeedback, lang, t])

  const dispatchEvent = (eventName: string, payload: any = {}) => {
    console.log(`[ShoeFit Event] ${eventName}`, payload)
    const customEvent = new CustomEvent('shoefit_widget_event', {
      detail: { event: eventName, storeId, productId, ...payload }
    })
    window.dispatchEvent(customEvent)
  }

  const handleOpenDrawer = () => {
    setOpen(true)
    dispatchEvent('widget_opened')
  }

  const handleCloseDrawer = () => {
    setOpen(false)
    dispatchEvent('widget_closed')
  }

  const [successMsg, setSuccessMsg] = useState('')
  
  const handleSelectSize = () => {
    if (!recommendation) return
    const recStr = `${recommendation.recommendedSizeEu}`
    
    const isSuccess = trySelectSize(recStr, sizeSelector)
    const addedToCart = tryAddToCart(cartSelector)
    
    const payload = {
      recommendedSize: recStr,
      autoSelected: isSuccess,
      addedToCart,
      ctaBehavior,
      targetBrand,
      targetModel,
      refBrand,
      refSize: refSizeValue,
      refSystem: refSizeSystem,
      refFitFeedback,
      refFootWidth,
      timestamp: new Date().toISOString()
    }

    dispatchEvent('cta_clicked', payload)

    if ((window as any).dataLayer) {
      try {
        (window as any).dataLayer.push({
          event: 'shoefit_cta_click',
          shoefit_data: payload
        })
      } catch (e) {
        console.warn('[ShoeFit Analytics] GTM dataLayer error:', e)
      }
    }

    if (isSuccess || addedToCart) {
      setSuccessMsg(t.successSelect)
      setTimeout(() => {
        setSuccessMsg('')
        setOpen(false)
      }, 1500)
    } else {
      alert(`${t.recommendedTitle}: EU ${recStr}`)
    }
  }

  const handleSelectSizeOnly = () => {
    if (!recommendation) return
    const recStr = `${recommendation.recommendedSizeEu}`
    
    const isSuccess = trySelectSize(recStr, sizeSelector)
    
    const payload = {
      recommendedSize: recStr,
      autoSelected: isSuccess,
      addedToCart: false,
      ctaBehavior,
      targetBrand,
      targetModel,
      refBrand,
      refSize: refSizeValue,
      refSystem: refSizeSystem,
      refFitFeedback,
      refFootWidth,
      timestamp: new Date().toISOString()
    }

    dispatchEvent('cta_clicked', payload)

    if ((window as any).dataLayer) {
      try {
        (window as any).dataLayer.push({
          event: 'shoefit_cta_click',
          shoefit_data: payload
        })
      } catch (e) {
        console.warn('[ShoeFit Analytics] GTM dataLayer error:', e)
      }
    }

    if (isSuccess) {
      setSuccessMsg(t.successSelectOnly)
      setTimeout(() => {
        setSuccessMsg('')
        setOpen(false)
      }, 1500)
    } else {
      alert(`${t.recommendedTitle}: EU ${recStr}`)
    }
  }

  const handleSaveToCabinet = () => {
    const newShoe: SavedShoe = {
      id: `${Date.now()}`,
      brand: refBrand,
      size: refSizeValue,
      system: refSizeSystem,
      fit: refFitFeedback,
      width: refFootWidth
    }

    const updated = [newShoe, ...savedShoes.filter(s => s.brand !== refBrand)]
    setSavedShoes(updated)
    localStorage.setItem('shoefit-cabinet', JSON.stringify(updated))
    dispatchEvent('shoe_saved', { brand: refBrand })
    
    setSuccessMsg(t.successSave)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleUseCabinetShoe = (shoe: SavedShoe) => {
    setRefBrand(shoe.brand)
    setRefSizeSystem(shoe.system)
    setRefSizeValue(shoe.size)
    setRefFitFeedback(shoe.fit)
    setRefFootWidth(shoe.width)
    setIsMeasuring(false)
    
    setCurrentStep(4)
    dispatchEvent('cabinet_used', { brand: shoe.brand, size: shoe.size })
  }

  const handleReset = () => {
    setCurrentStep(1)
    setBrandSearch('')
    setIsMeasuring(false)
    setMeasuredCm(undefined)
    setTargetBrandConfirmed(false)
  }

  const showCloseBtn = !showSelectSizeBtn && !showAddToCartBtn

  return (
    <div className="ssw-widget">
      {!isDemo && (
        <div className="ssw-trigger-container">
          <button
            type="button"
            className="ssw-trigger"
            onClick={() => {
              setOpen(true)
              dispatchEvent('widget_opened')
            }}
          >
            👟 {t.start}
          </button>
        </div>
      )}

      {!isDemo && open && (
        <div
          className="ssw-overlay"
          onClick={() => {
            setOpen(false)
            dispatchEvent('widget_closed')
          }}
        />
      )}

      {/* Slide-out Drawer */}
      <Drawer
        open={open}
        onClose={() => {
          setOpen(false)
          dispatchEvent('widget_closed')
        }}
        title={t.title}
        subtitle={dynamicSubtitle}
        stylePreset={stylePreset}
      >
        {/* Stepper Header */}
        <div className="ssw-stepper">
          <span className={`ssw-step ${currentStep === 1 ? 'active' : ''}`}>{t.stepBrand}</span>
          <span className={`ssw-step ${currentStep === 2 ? 'active' : ''}`}>{t.stepSize}</span>
          {!isMeasuring && (
            <span className={`ssw-step ${currentStep === 3 ? 'active' : ''}`}>{t.stepFit}</span>
          )}
          <span className={`ssw-step ${currentStep === 4 ? 'active' : ''}`}>{t.stepResult}</span>
        </div>

        {/* STEP 1: Reference Brand Selection */}
        {currentStep === 1 && (
          <div className="ssw-fade-in">
            {/* SPACE-SAVING INLINE CABINET CHIPS */}
            {savedShoes.length > 0 && (
              <div className="ssw-cabinet-inline-container">
                <span className="ssw-cabinet-inline-label">{t.savedCabinetTitle}</span>
                <div className="ssw-cabinet-chips-row">
                  {savedShoes.map(shoe => {
                    const domain = getBrandDomain(shoe.brand)
                    const errorKey = `${shoe.id}_logo`
                    const hasError = cabinetImgErrors[errorKey]
                    const logoSrc = hasError 
                      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
                      : `https://logo.clearbit.com/${domain}`

                    return (
                      <button
                        key={shoe.id}
                        type="button"
                        className="ssw-cabinet-chip"
                        onClick={() => handleUseCabinetShoe(shoe)}
                      >
                        <img
                          src={logoSrc}
                          alt={shoe.brand}
                          className="ssw-cabinet-chip-logo"
                          onError={() => {
                            setCabinetImgErrors(prev => ({ ...prev, [errorKey]: true }))
                          }}
                        />
                        <span>{shoe.brand} ({shoe.size})</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Target Model Notice */}
            <div className="ssw-target-notice" style={{ marginTop: '8px' }}>
              <span className="ssw-target-badge">{t.targetProduct}</span>
              <strong>{pageTitle}</strong>
            </div>

            {/* Vertical Brand list selection */}
            <div className="ssw-card ssw-card-brand-list" style={{ marginTop: '8px' }}>
              <label className="ssw-label">{t.selectBrand}</label>
              <input
                className="ssw-input"
                type="text"
                placeholder={t.searchBrand}
                value={brandSearch}
                onChange={e => setBrandSearch(e.target.value)}
              />
              
              {/* Vertical Scrollable Brand List */}
              <div className="ssw-brand-list">
                {filteredBrands.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.85rem' }}>
                    {lang === 'tr' ? 'Aradığınız marka bulunamadı.' : 'No matching brands found.'}
                  </div>
                ) : (
                  filteredBrands.map(brand => {
                    const domain = getBrandDomain(brand)
                    const errorKey = `${brand}_list_logo`
                    const hasError = cabinetImgErrors[errorKey]
                    const logoSrc = hasError 
                      ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
                      : `https://logo.clearbit.com/${domain}`

                    const isSelected = refBrand === brand
                    const meta = (brandMeta as any)[brand]
                    
                    return (
                      <button
                        key={brand}
                        type="button"
                        className={`ssw-brand-row-item ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setRefBrand(brand)
                          setCurrentStep(2)
                          dispatchEvent('brand_selected', { brand })
                        }}
                      >
                        <img
                          className="ssw-brand-row-logo"
                          src={logoSrc}
                          alt={brand}
                          onError={() => {
                            setCabinetImgErrors(prev => ({ ...prev, [errorKey]: true }))
                          }}
                        />
                        <div className="ssw-brand-row-info">
                          <strong>{brand}</strong>
                          <small>{lang === 'tr' ? (meta?.caption || 'Standard kalıp') : 'Size reference brand'}</small>
                        </div>
                        <span className="ssw-brand-row-arrow">→</span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Size Grid Selection */}
        {currentStep === 2 && (
          <div className="ssw-fade-in">
            {/* CM Measure Switcher */}
            <div className="ssw-card">
              <div className="ssw-measure-row">
                <div>
                  <p className="ssw-label" style={{ margin: 0 }}>
                    {t.measureOption}
                  </p>
                  <p className="ssw-section-note">{t.measureInstruction}</p>
                </div>
                <button
                  type="button"
                  className={`ssw-secondary ${isMeasuring ? 'active' : ''}`}
                  onClick={() => setIsMeasuring(prev => !prev)}
                >
                  {isMeasuring ? t.close : t.measureBtn}
                </button>
              </div>

              {isMeasuring && (
                <div className="ssw-tile ssw-fade-in" style={{ marginTop: '14px' }}>
                  <label className="ssw-label">{t.measureCmLabel}</label>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <input
                      className="ssw-input"
                      style={{ maxWidth: '100px' }}
                      type="number"
                      min="18"
                      max="35"
                      step="0.1"
                      value={measuredCm || ''}
                      onChange={e => setMeasuredCm(parseFloat(e.target.value))}
                      placeholder="26.5"
                    />
                    <span style={{ fontWeight: 700, color: '#334155' }}>cm</span>
                  </div>
                </div>
              )}
            </div>

            {/* Standard Size Grid Selection */}
            {!isMeasuring && (
              <div className="ssw-card" style={{ marginTop: '16px' }}>
                <label className="ssw-label">{t.selectSize}</label>
                
                <div className="ssw-section">
                  <span className="ssw-section-note">{t.sizeSystem}</span>
                  <div className="ssw-pill-group ssw-pill-group-full">
                    {(['EU', 'US', 'UK', 'CM'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        className={`ssw-pill ${refSizeSystem === mode ? 'active' : ''}`}
                        onClick={() => {
                          setRefSizeSystem(mode)
                          setRefSizeValue(SYSTEM_SIZES[mode][Math.floor(SYSTEM_SIZES[mode].length / 2)])
                        }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ssw-size-grid" style={{ marginTop: '12px' }}>
                  {SYSTEM_SIZES[refSizeSystem].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`ssw-size-chip ${refSizeValue === val ? 'active' : ''}`}
                      onClick={() => setRefSizeValue(val)}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="ssw-action-row">
              <button type="button" className="ssw-secondary" onClick={() => setCurrentStep(1)}>
                {t.back}
              </button>
              <button
                type="button"
                className="ssw-button"
                disabled={isMeasuring && (!measuredCm || measuredCm <= 0)}
                onClick={() => {
                  // cm ölçüm modunda kalıp sorusu anlamsız — direkt sonuca git
                  if (isMeasuring) {
                    setCurrentStep(4)
                    dispatchEvent('recommendation_completed')
                  } else {
                    setCurrentStep(3)
                  }
                }}
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Fit & Width Preference (sadece referans numara modunda gösterilir) */}
        {currentStep === 3 && !isMeasuring && (
          <div className="ssw-fade-in">
            <div className="ssw-card">
              <label className="ssw-label">{t.howItFits}</label>
              <div className="ssw-vertical-pills">
                <button
                  type="button"
                  className={`ssw-vertical-pill ${refFitFeedback === 'kucuk' ? 'active' : ''}`}
                  onClick={() => setRefFitFeedback('kucuk')}
                >
                  <span className="ssw-feedback-icon">👟⬂</span>
                  <span>{t.fitTight}</span>
                </button>
                <button
                  type="button"
                  className={`ssw-vertical-pill ${refFitFeedback === 'tam' ? 'active' : ''}`}
                  onClick={() => setRefFitFeedback('tam')}
                >
                  <span className="ssw-feedback-icon">👟✓</span>
                  <span>{t.fitPerfect}</span>
                </button>
                <button
                  type="button"
                  className={`ssw-vertical-pill ${refFitFeedback === 'buyuk' ? 'active' : ''}`}
                  onClick={() => setRefFitFeedback('buyuk')}
                >
                  <span className="ssw-feedback-icon">👟⬀</span>
                  <span>{t.fitLoose}</span>
                </button>
              </div>
            </div>

            <div className="ssw-card" style={{ marginTop: '16px' }}>
              <label className="ssw-label">{t.footWidth}</label>
              <div className="ssw-pill-group">
                <button
                  type="button"
                  className={`ssw-pill ${refFootWidth === 'dar' ? 'active' : ''}`}
                  onClick={() => setRefFootWidth('dar')}
                >
                  {t.widthNarrow}
                </button>
                <button
                  type="button"
                  className={`ssw-pill ${refFootWidth === 'normal' ? 'active' : ''}`}
                  onClick={() => setRefFootWidth('normal')}
                >
                  {t.widthNormal}
                </button>
                <button
                  type="button"
                  className={`ssw-pill ${refFootWidth === 'genis' ? 'active' : ''}`}
                  onClick={() => setRefFootWidth('genis')}
                >
                  {t.widthWide}
                </button>
              </div>
            </div>

            <div className="ssw-action-row">
              <button type="button" className="ssw-secondary" onClick={() => setCurrentStep(2)}>
                {t.back}
              </button>
              <button
                type="button"
                className="ssw-button"
                onClick={() => {
                  setCurrentStep(4)
                  dispatchEvent('recommendation_completed')
                }}
              >
                {t.next}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Results Display */}
        {currentStep === 4 && (
          <div className="ssw-fade-in">
            {!targetBrandConfirmed ? (
              <div className="ssw-target-confirm-container ssw-fade-in" style={{ marginTop: '8px' }}>
                <div className="ssw-card ssw-card-brand-list">
                  <label className="ssw-label">🎯 {t.targetBrandConfirmTitle}</label>
                  <p className="ssw-section-note">{t.targetBrandConfirmDesc}</p>
                  
                  <input
                    className="ssw-input"
                    type="text"
                    placeholder={t.selectTargetBrandPlaceholder}
                    value={brandSearch}
                    onChange={e => setBrandSearch(e.target.value)}
                  />

                  <div className="ssw-brand-list" style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {filteredBrands.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748b', fontSize: '0.85rem' }}>
                        {lang === 'tr' ? 'Aradığınız marka bulunamadı.' : 'No matching brands found.'}
                      </div>
                    ) : (
                      filteredBrands.map(brand => {
                        const domain = getBrandDomain(brand)
                        const errorKey = `${brand}_list_logo_target`
                        const hasError = cabinetImgErrors[errorKey]
                        const logoSrc = hasError 
                          ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
                          : `https://logo.clearbit.com/${domain}`

                        const isSelected = resolvedTargetBrand === brand
                        const meta = (brandMeta as any)[brand]
                        
                        return (
                          <button
                            key={brand}
                            type="button"
                            className={`ssw-brand-row-item ${isSelected ? 'active' : ''}`}
                            onClick={() => {
                              setResolvedTargetBrand(brand)
                              setTargetBrandConfirmed(true)
                              dispatchEvent('target_brand_confirmed', { targetBrand: brand })
                            }}
                          >
                            <img
                              className="ssw-brand-row-logo"
                              src={logoSrc}
                              alt={brand}
                              onError={() => {
                                setCabinetImgErrors(prev => ({ ...prev, [errorKey]: true }))
                              }}
                            />
                            <div className="ssw-brand-row-info">
                              <strong>{brand}</strong>
                              <small>{lang === 'tr' ? (meta?.caption || 'Standard kalıp') : 'Size reference brand'}</small>
                            </div>
                            <span className="ssw-brand-row-arrow">→</span>
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              recommendation && (
                <div className="ssw-fade-in">
                  {/* Header showing confirmed brand and a Change button */}
                  <div className="ssw-confirmed-brand-header">
                    <span className="ssw-confirmed-label">
                      {lang === 'tr' ? 'Hedef Marka:' : 'Target Brand:'} <strong>{resolvedTargetBrand}</strong>
                    </span>
                    <button
                      type="button"
                      className="ssw-change-brand-btn"
                      onClick={() => setTargetBrandConfirmed(false)}
                    >
                      ✏️ {t.changeTargetBrand}
                    </button>
                  </div>

                  <div className="result-card" style={{ marginTop: '10px' }}>
                    <div className="ssw-result-grid">
                      <div className="ssw-result-row">
                        <div>
                          <p className="ssw-result-label">{t.recommendedTitle}</p>
                          <p className="ssw-result-value">EU {recommendation.recommendedSizeEu}</p>
                        </div>
                        
                        <div className="ssw-result-confidence">
                          <p className="ssw-result-label">{t.confidenceScore}</p>
                          <div className="ssw-badge-confidence" data-risk={recommendation.riskLevel}>
                            {recommendation.confidenceScore}%
                          </div>
                        </div>
                      </div>

                      <div className="ssw-result-row" style={{ borderTop: '1px solid rgba(15,23,42,0.06)', paddingTop: '10px' }}>
                        <span className="ssw-result-label">{t.alternativeTitle}:</span>
                        <strong style={{ fontSize: '1.1rem', color: '#1e293b' }}>
                          EU {recommendation.alternativeSizeEu}
                        </strong>
                      </div>

                      <div className="ssw-result-help">
                        {lang === 'tr' ? recommendation.explanationTr : recommendation.explanationEn}
                      </div>

                      {((lang === 'tr' ? recommendation.warningsTr : recommendation.warningsEn).length > 0) && (
                        <div className="ssw-warnings-container">
                          <span className="ssw-result-label">{t.warnings}:</span>
                          <ul className="ssw-warnings-list">
                            {(lang === 'tr' ? recommendation.warningsTr : recommendation.warningsEn).map((warn, i) => (
                              <li key={i}>{warn}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {successMsg && <div className="ssw-toast ssw-fade-in">{successMsg}</div>}

                  <div className="ssw-results-footer" style={{ marginTop: '20px' }}>
                    {showAddToCartBtn && (
                      <button
                        type="button"
                        className="ssw-button ssw-button-full"
                        onClick={handleSelectSize}
                      >
                        {t.selectSizeBtn}
                      </button>
                    )}

                    {showSelectSizeBtn && (
                      <button
                        type="button"
                        className="ssw-button ssw-button-full"
                        style={{ marginTop: showAddToCartBtn ? '10px' : '0px', backgroundColor: '#334155', color: '#fff', border: 'none' }}
                        onClick={handleSelectSizeOnly}
                      >
                        {t.selectOnlySizeBtn}
                      </button>
                    )}

                    {showCloseBtn && (
                      <button
                        type="button"
                        className="ssw-button ssw-button-full"
                        onClick={handleCloseDrawer}
                      >
                        {t.close}
                      </button>
                    )}
                    
                    <button
                      type="button"
                      className="ssw-secondary ssw-button-full"
                      style={{ marginTop: '10px' }}
                      onClick={handleSaveToCabinet}
                    >
                      {t.saveShoesBtn}
                    </button>

                    <p className="ssw-cabinet-info-text">
                      {lang === 'tr'
                        ? '* Beden tercihiniz ve ayak yapınız tarayıcınıza kaydedilir. Diğer ürünlerde doğrudan öneri almak için kullanılır.'
                        : '* Saves your size/fit preferences in this browser to instantly recommend sizes on other product pages.'}
                    </p>

                    <button
                      type="button"
                      className="ssw-text-btn ssw-button-full"
                      style={{ marginTop: '10px' }}
                      onClick={handleReset}
                    >
                      {t.resetBtn}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}
