import React from 'react'

const BRANDS = ['Nike','Adidas','Puma','New Balance','Converse','Vans','Reebok','Skechers']

export default function BrandSelector({value,onChange}:{value:string,onChange:(v:string)=>void}){
  return (
    <div className="ssw-section">
      <div className="ssw-stepper">
        <span className="ssw-step active">1. Kaynak Marka</span>
      </div>
      <label className="ssw-label">Daha önce hangi markayı giydin?</label>
      <div className="ssw-pill-group">
        {BRANDS.map(b => (
          <button key={b} type="button" className={`ssw-pill ${value===b? 'active':''}`} onClick={()=>onChange(b)}>{b}</button>
        ))}
      </div>
    </div>
  )
}
