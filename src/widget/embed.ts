import React from 'react'
import { createRoot } from 'react-dom/client'
import ShoeSizeWidget from './ShoeSizeWidget'
import cssText from '../styles/widget.css?inline'

let mounted = false
let currentTarget: HTMLElement | null = null

interface WidgetConfig {
  storeId: string
  productId: string
  brand: string
  model: string
  sizeSystem: string
  buttonColor: string
  buttonTextColor: string
  borderRadius: string
  language: string
  stylePreset: string
  sizeSelector: string
  cartSelector: string
  showAddToCart: string
  showSelectSize: string
  targetSelector: string
  insertPosition: string
}

function injectIntoShadow(rootEl: HTMLElement, config: Partial<WidgetConfig>, openOnMount = false, initialStep = 1) {
  // Create wrapper
  const host = document.createElement('div')
  host.dataset.sswHost = 'true'
  host.style.display = 'block'
  host.style.width = '100%'
  if (config.storeId === 'STORE_DEMO') {
    host.setAttribute('data-is-demo', 'true')
  }

  // Apply theme variables to host
  const primaryColor = config.buttonColor || '#2563eb'
  const textColor = config.buttonTextColor || '#ffffff'
  const radius = config.borderRadius || '16px'

  host.style.setProperty('--ssw-primary', primaryColor)
  host.style.setProperty('--ssw-text-on-primary', textColor)
  host.style.setProperty('--ssw-radius', radius)

  // Attach Shadow DOM for CSS isolation
  const shadow = host.attachShadow({ mode: 'open' })
  
  // Inject widget CSS styles
  const style = document.createElement('style')
  style.textContent = cssText
  shadow.appendChild(style)

  // Mount point
  const mount = document.createElement('div')
  shadow.appendChild(mount)

  // Inject host into page based on configuration
  if (config.storeId === 'STORE_DEMO' || rootEl === document.body) {
    rootEl.appendChild(host)
  } else {
    const parent = rootEl.parentNode
    if (parent) {
      if (config.insertPosition === 'before') {
        parent.insertBefore(host, rootEl)
      } else {
        parent.insertBefore(host, rootEl.nextSibling)
      }
    } else {
      rootEl.appendChild(host)
    }
  }

  // Render React App
  const root = createRoot(mount)
  root.render(
    React.createElement(ShoeSizeWidget, {
      storeId: config.storeId || 'default-store',
      productId: config.productId || 'default-prod',
      targetBrand: config.brand || 'Nike',
      targetModel: config.model || '',
      targetSizeSystem: config.sizeSystem || 'EU',
      languageMode: config.language || 'auto',
      stylePreset: config.stylePreset || 'modern',
      sizeSelector: config.sizeSelector || '',
      cartSelector: config.cartSelector || '',
      showAddToCart: config.showAddToCart || 'true',
      showSelectSize: config.showSelectSize || 'true',
      initialOpen: openOnMount,
      initialStep: initialStep
    })
  )
  mounted = true
}

function findInsertTarget(targetSelector?: string) {
  // Try to find target selector configured
  if (targetSelector) {
    try {
      const el = document.querySelector(targetSelector)
      if (el) return el as HTMLElement
    } catch (e) {
      console.warn('[ShoeFit] Invalid target selector syntax:', targetSelector, e)
    }
  }

  // Try to find the developer-configured container element
  const container = document.getElementById('shoefit-widget')
  if (container) return container

  // Fallback to searching for size selects on the page
  const selectors = ['select[name*="size"]', 'select[id*="size"]', 'select']
  for (const selector of selectors) {
    try {
      const el = document.querySelector(selector)
      if (el && el.parentElement) return el.parentElement as HTMLElement
    } catch {}
  }

  return document.body
}

function openWidget() {
  window.dispatchEvent(new CustomEvent('shoefit_open_widget'))
}

function reInit(openOnMount = false) {
  let wasOpen = openOnMount
  let lastStep = 1
  if (currentTarget) {
    const host = currentTarget.querySelector('[data-ssw-host]') || document.querySelector('[data-ssw-host]')
    if (host && host.shadowRoot) {
      const drawer = host.shadowRoot.querySelector('.ssw-drawer')
      if (drawer && drawer.classList.contains('open')) {
        wasOpen = true
      }
      const activeStepEl = host.shadowRoot.querySelector('.ssw-step.active')
      if (activeStepEl) {
        const steps = Array.from(host.shadowRoot.querySelectorAll('.ssw-step'))
        const idx = steps.indexOf(activeStepEl)
        if (idx !== -1) {
          lastStep = idx + 1
        }
      }
    }
    if (host) host.remove()
  }
  mounted = false
  init(wasOpen, lastStep)
}

function init(openOnMount = false, initialStep = 1) {
  // Avoid double mounting
  if (mounted && document.querySelector('[data-ssw-host]')) return

  // Gather config parameters from script and div container
  const script = (document.currentScript as HTMLScriptElement | null) ||
                 (document.querySelector('script[src*="shoe-size-widget"]') as HTMLScriptElement | null)
  const scriptDataset = script?.dataset || {}

  // Check target-selector
  const divContainer = document.getElementById('shoefit-widget')
  const targetSelector = divContainer?.getAttribute('data-target-selector') || scriptDataset.targetSelector || ''
  const insertPosition = divContainer?.getAttribute('data-insert-position') || scriptDataset.insertPosition || 'after'

  const target = findInsertTarget(targetSelector)
  if (!target) return
  currentTarget = target

  // Preference order: 1. Div container attributes, 2. Script attributes, 3. Defaults
  const storeId = divContainer?.getAttribute('data-store-id') || scriptDataset.storeId || 'STORE_1'
  const productId = divContainer?.getAttribute('data-product-id') || scriptDataset.productId || 'PRODUCT_1'
  const brand = divContainer?.getAttribute('data-brand') || scriptDataset.brand || 'Nike'
  const model = divContainer?.getAttribute('data-model') || scriptDataset.model || 'Air Force 1'
  const sizeSystem = divContainer?.getAttribute('data-size-system') || scriptDataset.sizeSystem || 'EU'
  const buttonColor = divContainer?.getAttribute('data-button-color') || scriptDataset.buttonColor || '#2563eb'
  const buttonTextColor = divContainer?.getAttribute('data-button-text-color') || scriptDataset.buttonTextColor || '#ffffff'
  const borderRadius = divContainer?.getAttribute('data-border-radius') || scriptDataset.borderRadius || '16px'
  const language = divContainer?.getAttribute('data-language') || scriptDataset.language || 'auto'
  const stylePreset = divContainer?.getAttribute('data-style-preset') || scriptDataset.stylePreset || 'modern'
  const sizeSelector = divContainer?.getAttribute('data-size-selector') || scriptDataset.sizeSelector || ''
  const cartSelector = divContainer?.getAttribute('data-cart-selector') || scriptDataset.cartSelector || ''
  const showAddToCart = divContainer?.getAttribute('data-show-add-to-cart') || scriptDataset.showAddToCart || 'true'
  const showSelectSize = divContainer?.getAttribute('data-show-select-size') || scriptDataset.showSelectSize || 'true'

  const config: Partial<WidgetConfig> = {
    storeId,
    productId,
    brand,
    model,
    sizeSystem,
    buttonColor,
    buttonTextColor,
    borderRadius,
    language,
    stylePreset,
    sizeSelector,
    cartSelector,
    showAddToCart,
    showSelectSize,
    targetSelector,
    insertPosition
  }

  try {
    injectIntoShadow(target, config, openOnMount, initialStep)
  } catch (error) {
    console.error('ShoeFitWidget injection failed:', error)
  }

  // Bind trigger actions to window scope
  ;(window as any).openShoeSizeWidget = openWidget
  ;(window as any).reInitShoeSizeWidget = reInit
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => init(true))
} else {
  init(true)
}
