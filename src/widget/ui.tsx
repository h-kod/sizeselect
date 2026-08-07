import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getBrandDomain } from '../data/brandProfiles'

/* -------------------------------------------------------------------------- */
/* Drawer                                                                      */
/* -------------------------------------------------------------------------- */

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  closeLabel: string
  embedded?: boolean
  children: React.ReactNode
  footer?: React.ReactNode
}

/**
 * Kaydırmalı panel. Odak tuzağı, Escape ve odağın tetikleyiciye dönmesi
 * burada yönetilir — önceki sürümde yalnızca Escape vardı.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  closeLabel,
  embedded = false,
  children,
  footer
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const restoreFocusRef = useRef<Element | null>(null)

  useEffect(() => {
    if (!open || embedded) return

    restoreFocusRef.current = document.activeElement
    const panel = panelRef.current
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(firstFocusable || panel)?.focus({ preventScroll: true })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panel) return

      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        item => item.offsetParent !== null
      )
      if (items.length === 0) return

      const first = items[0]
      const last = items[items.length - 1]
      const active = panel.getRootNode() as ShadowRoot | Document
      const current = (active as ShadowRoot).activeElement || document.activeElement

      if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      const restore = restoreFocusRef.current as HTMLElement | null
      if (restore && typeof restore.focus === 'function') {
        restore.focus({ preventScroll: true })
      }
    }
  }, [open, embedded, onClose])

  return (
    <div
      ref={panelRef}
      className={`sf-panel${open ? ' is-open' : ''}${embedded ? ' is-embedded' : ''}`}
      role="dialog"
      aria-modal={embedded ? undefined : 'true'}
      aria-label={title}
      tabIndex={-1}
    >
      <header className="sf-panel__head">
        <div className="sf-panel__heading">
          <p className="sf-panel__title">{title}</p>
          {subtitle && <p className="sf-panel__subtitle">{subtitle}</p>}
        </div>
        <button type="button" className="sf-iconbtn" onClick={onClose} aria-label={closeLabel}>
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="sf-panel__body">{children}</div>

      {footer && <div className="sf-panel__foot">{footer}</div>}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Marka logosu                                                                */
/* -------------------------------------------------------------------------- */

export function BrandLogo({ brand, size = 32 }: { brand: string; size?: number }) {
  const domain = getBrandDomain(brand)
  const [stage, setStage] = useState<0 | 1 | 2>(domain ? 0 : 2)

  const sources = [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
  ]

  const initials = brand
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

  if (stage === 2) {
    return (
      <span className="sf-logo sf-logo--fallback" style={{ width: size, height: size }} aria-hidden="true">
        {initials}
      </span>
    )
  }

  return (
    <img
      className="sf-logo"
      style={{ width: size, height: size }}
      src={sources[stage]}
      alt=""
      loading="lazy"
      onError={() => setStage(prev => (prev === 0 ? 1 : 2))}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Segmented control                                                           */
/* -------------------------------------------------------------------------- */

interface SegmentedProps<T extends string> {
  label?: string
  value: T
  options: Array<{ value: T; label: string; hint?: string }>
  onChange: (value: T) => void
  size?: 'sm' | 'md'
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  size = 'md'
}: SegmentedProps<T>) {
  return (
    <div className="sf-field">
      {label && <span className="sf-field__label">{label}</span>}
      <div className={`sf-segmented sf-segmented--${size}`} role="radiogroup" aria-label={label}>
        {options.map(option => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            className={`sf-segment${value === option.value ? ' is-active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Güven göstergesi                                                            */
/* -------------------------------------------------------------------------- */

export function ConfidenceMeter({
  value,
  risk,
  label,
  bandLabel
}: {
  value: number
  risk: 'low' | 'medium' | 'high'
  label: string
  bandLabel: string
}) {
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const dash = (value / 100) * circumference

  return (
    <div className="sf-confidence" data-risk={risk}>
      <svg viewBox="0 0 56 56" className="sf-confidence__ring" aria-hidden="true" focusable="false">
        <circle className="sf-confidence__track" cx="28" cy="28" r={radius} />
        <circle
          className="sf-confidence__value"
          cx="28"
          cy="28"
          r={radius}
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      <div className="sf-confidence__text">
        <span className="sf-confidence__number">%{value}</span>
        <span className="sf-confidence__label">
          {label} · {bandLabel}
        </span>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Stok rozeti                                                                 */
/* -------------------------------------------------------------------------- */

export function StockBadge({
  availability,
  labels
}: {
  availability: 'in_stock' | 'out_of_stock' | 'not_offered' | 'unknown'
  labels: { inStock: string; outOfStock: string; notOffered: string }
}) {
  if (availability === 'unknown') return null

  const text =
    availability === 'in_stock'
      ? labels.inStock
      : availability === 'out_of_stock'
        ? labels.outOfStock
        : labels.notOffered

  return (
    <span className="sf-stock" data-state={availability}>
      <span className="sf-stock__dot" aria-hidden="true" />
      {text}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Adım göstergesi                                                             */
/* -------------------------------------------------------------------------- */

export function StepBar({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="sf-steps" aria-label={steps.join(' / ')}>
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : 'todo'
        return (
          <li key={step} className="sf-steps__item" data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
            <span className="sf-steps__dot" aria-hidden="true">
              {state === 'done' ? '✓' : index + 1}
            </span>
            <span className="sf-steps__label">{step}</span>
          </li>
        )
      })}
    </ol>
  )
}

/* -------------------------------------------------------------------------- */
/* Duyuru bölgesi — ekran okuyucular için                                      */
/* -------------------------------------------------------------------------- */

export function useAnnouncer() {
  const [message, setMessage] = useState('')

  const announce = useCallback((text: string) => {
    setMessage('')
    window.setTimeout(() => setMessage(text), 30)
  }, [])

  const node = (
    <span className="sf-visually-hidden" role="status" aria-live="polite">
      {message}
    </span>
  )

  return { announce, node }
}
