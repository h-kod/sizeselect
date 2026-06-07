import React from 'react'

export default function SizeSelector({system,options,value,onChange}:{system:string,options:number[]|string[],value:string,onChange:(v:string)=>void}){
  return (
    <div>
      <label>Mevcut beden ({system})</label>
      <div style={{marginTop:8}}>
        <select value={value} onChange={e=>onChange(e.target.value)} style={{padding:8,borderRadius:8}}>
          {options.map(o=> <option key={String(o)} value={String(o)}>{String(o)}</option>)}
        </select>
      </div>
    </div>
  )
}
