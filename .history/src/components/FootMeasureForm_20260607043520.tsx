import React, { useState } from 'react'

export default function FootMeasureForm({onMeasure}:{onMeasure:(cm:number)=>void}){
  const [val,setVal] = useState('26')
  return (
    <div style={{marginTop:12}}>
      <label>Ayak uzunluğu (cm)</label>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        <input value={val} onChange={e=>setVal(e.target.value)} style={{padding:8,borderRadius:8,width:120}} />
        <button onClick={()=>onMeasure(Number(val))} className="ssw-button">Hesapla</button>
      </div>
      <small style={{display:'block',marginTop:8}}>Topuğunu duvara yasla, en uzun parmağa kadar ölç.</small>
    </div>
  )
}
