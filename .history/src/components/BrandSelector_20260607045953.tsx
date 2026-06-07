import React from 'react'
import { brandMeta } from '../data/brandMeta'

const BRANDS = Object.keys(brandMeta) as Array<keyof typeof brandMeta>

export default function BrandSelector({value,onChange}:{value:string,onChange:(v:string)=>void}){
  return (
    <div className="ssw-section">
      <div className="ssw-stepper">
        <span className="ssw-step active">1. Kaynak Marka</span>
      </div>
      <label className="ssw-label">Daha önce hangi markayı giydin?</label>
      <div className="ssw-brand-grid">
        {BRANDS.map(b => {
          const meta = brandMeta[b]
          return (
            <button key={b} type="button" className={`ssw-brand-card ${value===b? 'active':''}`} onClick={()=>onChange(b)}>
              <span className="ssw-brand-avatar" style={{backgroundColor:meta.color}}>{meta.label}</span>
              <span>
                <strong>{meta.display}</strong>
                <small>{meta.caption}</small>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
