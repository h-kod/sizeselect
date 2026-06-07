import React from 'react'

const BRANDS = ['Nike','Adidas','Puma','New Balance','Converse','Vans','Reebok','Skechers']

export default function BrandSelector({value,onChange}:{value:string,onChange:(v:string)=>void}){
  return (
    <div>
      <label>Hangi markayı giydin?</label>
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
        {BRANDS.map(b=> (
          <button key={b} onClick={()=>onChange(b)} style={{padding:'8px 10px',borderRadius:8,background: b===value? '#111':'#f2f2f2',color: b===value? '#fff':'#111',border:'none'}}>{b}</button>
        ))}
      </div>
    </div>
  )
}
