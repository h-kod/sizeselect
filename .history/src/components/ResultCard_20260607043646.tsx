import React from 'react'

export default function ResultCard({recommended,alternative,fitNote,confidence}:{recommended:string,alternative:string,fitNote?:string,confidence?:number}){
  return (
    <div className="result-card" style={{marginTop:12}}>
      <div style={{fontWeight:700,fontSize:18}}>Önerilen beden: {recommended}</div>
      <div style={{marginTop:6}}>Alternatif: {alternative}</div>
      {fitNote && <div style={{marginTop:8}}>{fitNote}</div>}
      {confidence!=null && <div style={{marginTop:8}}>Güven: {Math.round(confidence)}%</div>}
    </div>
  )
}
