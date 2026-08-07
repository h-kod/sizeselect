import React from 'react'
import { createRoot, Root } from 'react-dom/client'
import ShoeSizeWidget from './ShoeSizeWidget'
import cssText from '../styles/widget.css?inline'
import { configureFeedback, getCalibration, getFeedbackStats } from '../utils/feedback'
import { resolveMountTarget } from '../utils/domIntegration'
import { recommendSize } from '../utils/recommendationEngine'
import {
  brandNames,
  brandProfiles,
  getBrandDomain,
  getBrandProfile,
  getBrandTable
} from '../data/brandProfiles'
import { getModelsByBrand, matchModel, shoeModels } from '../data/models'
import { buildSizeTable, formatSize } from '../data/sizeSystem'
import { widgetBus } from './bus'

export interface WidgetConfig {
  storeId: string
  productId: string
  brand: string
  model: string
  gender: string
  language: string
  stylePreset: string
  buttonColor: string
  buttonTextColor: string
  borderRadius: string
  buttonFontSize: string
  triggerLabel: string
  targetSelector: string
  insertPosition: 'before' | 'after'
  sizeSelector: string
  cartSelector: string
  brandSelector: string
  modelSelector: string
  storeSizeSystem: string
  allowAddToCart: boolean
  feedbackEndpoint: string
  embedded: boolean
}

interface Instance {
  host: HTMLElement
  root: Root
}

let instance: Instance | null = null

const DEFAULTS: WidgetConfig = {
  storeId: 'STORE_1',
  productId: '',
  brand: '',
  model: '',
  gender: 'auto',
  language: 'auto',
  stylePreset: 'modern',
  buttonColor: '#2563eb',
  buttonTextColor: '#ffffff',
  borderRadius: '16px',
  buttonFontSize: '14px',
  triggerLabel: '',
  targetSelector: '',
  insertPosition: 'after',
  sizeSelector: '',
  cartSelector: '',
  brandSelector: '',
  modelSelector: '',
  storeSizeSystem: 'auto',
  allowAddToCart: true,
  feedbackEndpoint: '',
  embedded: false
}

function toBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback
  return value !== 'false' && value !== '0'
}

/**
 * Yapılandırma öncelik sırası:
 * 1. init() ile verilen nesne
 * 2. #shoefit-widget kabındaki data-* öznitelikleri
 * 3. script etiketindeki data-* öznitelikleri
 * 4. varsayılanlar
 */
function readConfig(override?: Partial<WidgetConfig>): WidgetConfig {
  const script =
    (document.currentScript as HTMLScriptElement | null) ||
    (document.querySelector('script[data-store-id]') as HTMLScriptElement | null) ||
    (document.querySelector('script[src*="shoe-size-widget"]') as HTMLScriptElement | null)

  const container = document.getElementById('shoefit-widget')
  const scriptData = script?.dataset ?? {}

  const read = (attribute: string, datasetKey: string): string | undefined =>
    container?.getAttribute(attribute) ?? scriptData[datasetKey]

  return {
    storeId: override?.storeId ?? read('data-store-id', 'storeId') ?? DEFAULTS.storeId,
    productId: override?.productId ?? read('data-product-id', 'productId') ?? DEFAULTS.productId,
    brand: override?.brand ?? read('data-brand', 'brand') ?? DEFAULTS.brand,
    model: override?.model ?? read('data-model', 'model') ?? DEFAULTS.model,
    gender: override?.gender ?? read('data-gender', 'gender') ?? DEFAULTS.gender,
    language: override?.language ?? read('data-language', 'language') ?? DEFAULTS.language,
    stylePreset: override?.stylePreset ?? read('data-style-preset', 'stylePreset') ?? DEFAULTS.stylePreset,
    buttonColor: override?.buttonColor ?? read('data-button-color', 'buttonColor') ?? DEFAULTS.buttonColor,
    buttonTextColor:
      override?.buttonTextColor ?? read('data-button-text-color', 'buttonTextColor') ?? DEFAULTS.buttonTextColor,
    borderRadius: override?.borderRadius ?? read('data-border-radius', 'borderRadius') ?? DEFAULTS.borderRadius,
    buttonFontSize:
      override?.buttonFontSize ?? read('data-button-font-size', 'buttonFontSize') ?? DEFAULTS.buttonFontSize,
    triggerLabel: override?.triggerLabel ?? read('data-trigger-label', 'triggerLabel') ?? DEFAULTS.triggerLabel,
    targetSelector:
      override?.targetSelector ?? read('data-target-selector', 'targetSelector') ?? DEFAULTS.targetSelector,
    insertPosition:
      (override?.insertPosition ??
        (read('data-insert-position', 'insertPosition') as WidgetConfig['insertPosition'])) ||
      DEFAULTS.insertPosition,
    sizeSelector: override?.sizeSelector ?? read('data-size-selector', 'sizeSelector') ?? DEFAULTS.sizeSelector,
    cartSelector: override?.cartSelector ?? read('data-cart-selector', 'cartSelector') ?? DEFAULTS.cartSelector,
    brandSelector: override?.brandSelector ?? read('data-brand-selector', 'brandSelector') ?? DEFAULTS.brandSelector,
    modelSelector: override?.modelSelector ?? read('data-model-selector', 'modelSelector') ?? DEFAULTS.modelSelector,
    storeSizeSystem:
      override?.storeSizeSystem ?? read('data-store-size-system', 'storeSizeSystem') ?? DEFAULTS.storeSizeSystem,
    allowAddToCart:
      override?.allowAddToCart ?? toBoolean(read('data-allow-add-to-cart', 'allowAddToCart'), DEFAULTS.allowAddToCart),
    feedbackEndpoint:
      override?.feedbackEndpoint ?? read('data-feedback-endpoint', 'feedbackEndpoint') ?? DEFAULTS.feedbackEndpoint,
    embedded: override?.embedded ?? toBoolean(read('data-embedded', 'embedded'), DEFAULTS.embedded)
  }
}

function findAnchor(config: WidgetConfig): HTMLElement | null {
  if (config.embedded) return document.getElementById('shoefit-widget')
  return resolveMountTarget(config.targetSelector)
}

function mount(config: WidgetConfig, anchor: HTMLElement): void {
  const host = document.createElement('div')
  host.dataset.sswHost = 'true'
  host.setAttribute('data-preset', config.stylePreset || 'modern')
  host.style.display = 'block'
  host.style.width = '100%'
  host.style.setProperty('--sf-accent', config.buttonColor)
  host.style.setProperty('--sf-on-accent', config.buttonTextColor)
  host.style.setProperty('--sf-radius', config.borderRadius)
  host.style.setProperty('--sf-font-size', config.buttonFontSize)

  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = cssText
  shadow.appendChild(style)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  if (config.embedded || anchor === document.body || !anchor.parentNode) {
    anchor.appendChild(host)
  } else if (config.insertPosition === 'before') {
    anchor.parentNode.insertBefore(host, anchor)
  } else {
    anchor.parentNode.insertBefore(host, anchor.nextSibling)
  }

  const root = createRoot(mountPoint)
  root.render(
    React.createElement(ShoeSizeWidget, {
      storeId: config.storeId,
      productId: config.productId,
      targetBrand: config.brand,
      targetModel: config.model,
      gender: config.gender,
      languageMode: config.language,
      sizeSelector: config.sizeSelector,
      cartSelector: config.cartSelector,
      brandSelector: config.brandSelector,
      modelSelector: config.modelSelector,
      storeSizeSystem: config.storeSizeSystem,
      allowAddToCart: config.allowAddToCart,
      embedded: config.embedded,
      triggerLabel: config.triggerLabel
    })
  )

  instance = { host, root }
}

function destroy(): void {
  widgetBus.reset()
  if (!instance) return
  try {
    instance.root.unmount()
  } catch {
    /* unmount sırasında hata akışı durdurmamalı */
  }
  instance.host.remove()
  instance = null
}

/** Merchant elle init() çağırdıysa otomatik başlatma devreye girmemeli. */
let manuallyInitialised = false

function init(override?: Partial<WidgetConfig>): void {
  const config = readConfig(override)
  configureFeedback(config.feedbackEndpoint)

  // Hedefi mevcut kurulumu bozmadan önce çöz: bulunamıyorsa çalışan widget'ı
  // yıkmaktansa olduğu gibi bırakmak doğrudur.
  const anchor = findAnchor(config)
  if (!anchor) {
    console.warn(
      '[ShoeFit] Butonun ekleneceği element bulunamadı. data-target-selector verin veya sayfaya #shoefit-widget ekleyin.'
    )
    return
  }

  destroy()

  try {
    mount(config, anchor)
  } catch (error) {
    console.error('[ShoeFit] Widget yüklenemedi:', error)
  }
}

const api = {
  init: (override?: Partial<WidgetConfig>) => {
    manuallyInitialised = true
    init(override)
  },
  destroy,
  open: () => widgetBus.open(),
  close: () => widgetBus.close(),
  /** SPA yönlendirmelerinden sonra ürün değiştiyse yeniden kurar. */
  refresh: (override?: Partial<WidgetConfig>) => {
    manuallyInitialised = true
    init(override)
  },
  version: '2.0.0'
}

;(window as any).ShoeFitWidget = api

/**
 * Motorun kendisi de dışa açılır. Landing sayfası ve merchant paneli beden
 * hesabını buradan yapar; böylece marka/model verisinin ikinci bir kopyası
 * HTML içinde yaşamaz.
 */
;(window as any).ShoeFitEngine = {
  recommendSize,
  brandProfiles,
  brandNames,
  getBrandProfile,
  getBrandTable,
  getBrandDomain,
  shoeModels,
  getModelsByBrand,
  matchModel,
  buildSizeTable,
  formatSize,
  getFeedbackStats,
  getCalibration
}

function shouldAutoInit(): boolean {
  const script =
    (document.currentScript as HTMLScriptElement | null) ||
    (document.querySelector('script[src*="shoe-size-widget"]') as HTMLScriptElement | null)
  return script?.dataset.autoinit !== 'false'
}

function autoInit(): void {
  if (manuallyInitialised) return
  init()
}

if (shouldAutoInit()) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit)
  } else {
    autoInit()
  }
}

export default api
