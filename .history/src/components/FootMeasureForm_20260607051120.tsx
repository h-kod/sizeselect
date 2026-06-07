import React, { useState } from 'react'

export default function FootMeasureForm({onMeasure}:{onMeasure:(cm:number)=>void}){
  const [val,setVal] = useState('26.5')
  return (
    <div className="ssw-section">
      <label className="ssw-label">Ayağımı ölçerek bul</label>
      <div className="ssw-tile">
        <div style={{display:'flex',gap:10,flexWrap:'wrap',alignItems:'center'}}>
          <input className="ssw-input" value={val} onChange={e=>setVal(e.target.value)} placeholder="26.5" />
          <button type="button" className="ssw-button" onClick={()=>onMeasure(Number(val))}>Hesapla</button>
        </div>
        <p className="ssw-section-note">Topuğunu duvara yasla, en uzun parmağa kadar ölç. Sonra değeri gir.</p>
      </div>
    </div>
  )
}
