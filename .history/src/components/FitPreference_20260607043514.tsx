import React from 'react'

export default function FitPreference({value,onChange}:{value:string,onChange:(v:string)=>void}){
  const opts = [{k:'dar',t:'Dar seviyorum'},{k:'normal',t:'Tam otursun'},{k:'rahat',t:'Rahat olsun'},{k:'tarakli',t:'Ayağım taraklı'}]
  return (
    <div style={{marginTop:12}}>
      <label>Fit tercihi</label>
      <div style={{display:'flex',gap:8,marginTop:8}}>
        {opts.map(o=> (
          <button key={o.k} onClick={()=>onChange(o.k)} style={{padding:'8px 10px',borderRadius:8,background: o.k===value? '#111':'#f2f2f2',color: o.k===value? '#fff':'#111',border:'none'}}>{o.t}</button>
        ))}
      </div>
    </div>
  )
}
