import React, { useEffect, useRef } from 'react'

export default function Drawer({open,onClose,children}:{open:boolean,onClose:()=>void,children:any}){
  const ref = useRef<HTMLDivElement|null>(null)
  useEffect(()=>{
    function onKey(e:KeyboardEvent){ if(e.key==='Escape') onClose() }
    if(open) document.addEventListener('keydown',onKey)
    return ()=> document.removeEventListener('keydown',onKey)
  },[open])
  return (
    <div>
      {open && <div className="ssw-overlay" onClick={onClose} />}
      <aside ref={ref} className={`ssw-drawer${open? ' open':''}`} role="dialog" aria-label="Ayakkabı numarası asistanı">
        <header className="ssw-header">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
            <div>
              <p className="ssw-title">Hemen bedenini seç</p>
              <p className="ssw-subtitle">3 adımda doğru numarayı bulmana yardımcı olur.</p>
            </div>
            <button type="button" className="ssw-secondary" onClick={onClose}>Kapat</button>
          </div>
        </header>
        <div className="ssw-body">{children}</div>
      </aside>
    </div>
  )
}
