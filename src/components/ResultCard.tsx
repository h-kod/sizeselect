import React from 'react'

export default function ResultCard({recommended,alternative,fitNote,confidence}:{recommended:string,alternative:string,fitNote?:string,confidence?:number}){
  return (
    <div className="ssw-section">
      <div className="result-card">
        <div className="ssw-result-grid">
          <div className="ssw-result-row">
            <div>
              <p className="ssw-result-label">Önerilen beden</p>
              <p className="ssw-result-value">{recommended}</p>
            </div>
            <div className="ssw-result-confidence">
              <p className="ssw-result-label">Güven</p>
              <p className="ssw-result-value">{confidence}%</p>
            </div>
          </div>
          <div className="ssw-result-row">
            <span className="ssw-result-label">Alternatif</span>
            <strong>{alternative}</strong>
          </div>
          {fitNote && <div className="ssw-result-note">{fitNote}</div>}
          <div className="ssw-result-help">
            Ayağın taraklıysa {recommended}, normal kalıpsa {alternative} tercih edebilirsin.
          </div>
        </div>
      </div>
    </div>
  )
}
