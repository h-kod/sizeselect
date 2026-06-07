import React from 'react'

export default function SizeSelector({system,options,value,onChange}:{system:string,options:number[]|string[],value:string,onChange:(v:string)=>void}){
  return (
    <div className="ssw-section">
      <label className="ssw-label">Mevcut numaran</label>
      <div className="ssw-chip">{system}</div>
      <select className="ssw-select" value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=> <option key={String(o)} value={String(o)}>{String(o)}</option>)}
      </select>
    </div>
  )
}
