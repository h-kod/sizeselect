import React from 'react'

export default function ResultCard({recommended,alternative,fitNote,confidence}:{recommended:string,alternative:string,fitNote?:string,confidence?:number}){
  return (
    <div className="ssw-section">
      <div className="result-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}>
          <div>
            <p style={{margin:0,fontSize:'0.95rem',color:'#64748b'}}>Önerilen beden</p>
            <p style={{margin:'6px 0 0',fontSize:'1.5rem',fontWeight:700}}>{recommended}</p>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{margin:'0 0 6px',fontSize:'0.85rem',color:'#475569'}}>Güven</p>
            <p style={{margin:0,fontSize:'1rem',fontWeight:700}}>{confidence}%</p>
          </div>
        </div>
        <div style={{marginTop:18,display:'grid',gap:10}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><span style={{color:'#475569'}}>Alternatif</span><strong>{alternative}</strong></div>
          {fitNote && <div style={{color:'#475569'}}>{fitNote}</div>}
          <div style={{background:'#eef2ff',borderRadius:14,padding:'12px 14px',color:'#0f172a'}}>
            Ayağın taraklıysa {recommended}, normal kalıpsa {alternative} tercih edebilirsin.
          </div>
        </div>
      </div>
    </div>
  )
}
