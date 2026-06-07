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
      <aside ref={ref} className={"ssw-drawer" + (open? ' open':'')} role="dialog" aria-label="Ayakkabı numarası asistanı">
        <header className="ssw-header"><h3>Ayakkabı Numaranı Doğrula</h3><p style={{marginTop:6}}>Kullandığın markadaki numarana göre bu üründe sana en yakın bedeni bulalım.</p></header>
        <div className="ssw-body">{children}</div>
        <div className="ssw-footer"><button onClick={onClose} style={{marginRight:8}}>Kapat</button><button className="ssw-button">Bu bedeni seç</button></div>
      </aside>
    </div>
  )
}
