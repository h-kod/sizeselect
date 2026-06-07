import React from 'react'

export default function FitPreference({value,onChange}:{value:string,onChange:(v:string)=>void}){
  const opts = [{k:'dar',t:'Dar seviyorum'},{k:'normal',t:'Tam otursun'},{k:'rahat',t:'Rahat olsun'},{k:'tarakli',t:'Ayağım taraklı'}]
  return (
    <div className="ssw-section">
      <label className="ssw-label">Fit tercihin</label>
      <div className="ssw-pill-group">
        {opts.map(o=> (
          <button key={o.k} type="button" className={`ssw-pill ${value===o.k? 'active':''}`} onClick={()=>onChange(o.k)}>{o.t}</button>
        ))}
      </div>
    </div>
  )
}
