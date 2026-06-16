import React, { useEffect, useRef } from 'react'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle: string
  stylePreset?: string
  children: React.ReactNode
}

export default function Drawer({ open, onClose, title, subtitle, stylePreset = 'modern', children }: DrawerProps) {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
    }
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <div>
      {open && <div className="ssw-overlay" onClick={onClose} />}
      <aside
        ref={ref}
        className={`ssw-drawer${open ? ' open' : ''}`}
        data-preset={stylePreset}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="ssw-header">
          <div className="ssw-header-row">
            <div>
              <p className="ssw-title">{title}</p>
              <p className="ssw-subtitle">{subtitle}</p>
            </div>
            <button type="button" className="ssw-close-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
        </header>
        <div className="ssw-body">{children}</div>
      </aside>
    </div>
  )
}
