import React, { useEffect, useMemo, useState } from 'react'
import Drawer from './drawer'
import BrandSelector from '../components/BrandSelector'
import SizeSelector from '../components/SizeSelector'
import FitPreference from '../components/FitPreference'
import ResultCard from '../components/ResultCard'
import FootMeasureForm from '../components/FootMeasureForm'
import { toCm, findNearestSizeByCm, applyFitPreference } from '../utils/sizeConverter'
import { brandSizeProfiles } from '../data/brandSizeProfiles'
import { brandMeta } from '../data/brandMeta'
import { trySelectSize } from '../utils/domIntegration'

const SIZE_OPTIONS = {
  EU: ['40','41','42','42.5','43','44'],
  US: ['7','8','8.5','9','9.5','10'],
  UK: ['6','7','8','9','10'],
  CM: ['25.5','26','26.5','27','27.5']
}
const TARGET_BRANDS = ['Nike','Adidas','Puma','New Balance'] as const

export default function ShoeSizeWidget({targetBrand}:{targetBrand:string}){
  const [open,setOpen] = useState(false)
  const [fromBrand,setFromBrand] = useState('Adidas')
  const [system,setSystem] = useState<'EU'|'US'|'UK'|'CM'>('EU')
  const [value,setValue] = useState('42')
  const [fit,setFit] = useState('normal')
  const [measuredCm,setMeasuredCm] = useState<number|undefined>()
  const [selectedTargetBrand,setSelectedTargetBrand] = useState(targetBrand)
  const profile = (brandSizeProfiles as any)[selectedTargetBrand]

  useEffect(()=>{
    const stored = window.localStorage.getItem('shoe-size-widget')
    if(stored){
      try{
        const parsed = JSON.parse(stored)
        setFromBrand(parsed.fromBrand || 'Adidas')
        setSystem(parsed.system || 'EU')
        setValue(parsed.value || '42')
        setFit(parsed.fit || 'normal')
        setSelectedTargetBrand(parsed.targetBrand || selectedTargetBrand)
      }catch{}
    }
  }, [])

  useEffect(()=>{
    window.localStorage.setItem('shoe-size-widget', JSON.stringify({fromBrand,system,value,fit,targetBrand:selectedTargetBrand}))
  }, [fromBrand,system,value,fit,selectedTargetBrand])

  useEffect(()=>{ console.log('event','widget_opened') },[])

  const result = useMemo(()=>{
    let cm:number| null = null
    if(measuredCm) cm = measuredCm
    else cm = toCm(fromBrand, Number(value), system)
    if(!cm) return null
    const nearest = findNearestSizeByCm(selectedTargetBrand, cm)
    if(!nearest) return null
    let eu = nearest.eu + ((profile?.offsetFromStandard)||0)
    eu = applyFitPreference(eu, fit)
    const alt = eu - 0.5
    const confidence = measuredCm ? 92 : 80
    return {
      summary: `${fromBrand} ${system} ${value} giyiyorsan, ${selectedTargetBrand} için önerilen numaran:`,
      recommended: `EU ${eu}`,
      alternative: `EU ${alt}`,
      fitNote: profile?.fitNote,
      confidence
    }
  },[fromBrand,system,value,fit,measuredCm,selectedTargetBrand,profile])

  const [showMeasure, setShowMeasure] = useState(false)

  const apply = ()=>{
    if(!result) return
    const normalized = result.recommended.replace('EU ','').trim()
    const ok = trySelectSize(normalized)
    console.log('event','size_selected',{ok,recommended:result.recommended})
    if(!ok) alert(`Bu ürün için önerilen bedenin: ${result.recommended}`)
  }

  return (
    <div className="ssw-widget">
      {!open && (
        <div className="ssw-trigger-container">
          <button type="button" className="ssw-trigger" onClick={()=>{setOpen(true); console.log('event','widget_opened')}}>
            Bedenimi Bul
          </button>
        </div>
      )}
      <Drawer open={open} onClose={()=>{setOpen(false); console.log('event','widget_closed')}}>
        <div className="ssw-stepper">
          <span className="ssw-step active">1. Marka</span>
          <span className="ssw-step">2. Beden</span>
          <span className="ssw-step">3. Fit</span>
        </div>

        <div className="ssw-card">
          <div className="ssw-section">
            <label className="ssw-label">Hedef marka</label>
            <div className="ssw-chip">{selectedTargetBrand}</div>
            <p className="ssw-section-note">Bu üründe geçerli olan hedef marka üzerinden öneri hesaplanıyor.</p>
          </div>
        </div>

        <div className="ssw-card">
          <BrandSelector value={fromBrand} onChange={setFromBrand} />

          <div className="ssw-section">
            <label className="ssw-label">Beden sistemin</label>
            <div className="ssw-pill-group ssw-pill-group-full">
              {(['EU','US','UK','CM'] as const).map(mode => (
                <button key={mode} type="button" className={`ssw-pill ${system===mode? 'active':''}`} onClick={()=>setSystem(mode)}>{mode}</button>
              ))}
            </div>
            <SizeSelector system={system} options={SIZE_OPTIONS[system]} value={value} onChange={setValue} />
          </div>

          <FitPreference value={fit} onChange={setFit} />
        </div>

        <div className="ssw-card">
          <div className="ssw-measure-row">
            <div>
              <p className="ssw-label" style={{margin:0}}>Ayağımı ölçerek daha doğrusu</p>
              <p className="ssw-section-note">Doğru veriler için topuğu duvara yasla ve en uzun parmağı ölç.</p>
            </div>
            <button type="button" className="ssw-secondary" onClick={()=>setShowMeasure(prev=>!prev)}>{showMeasure ? 'Kapat' : 'Aç'}</button>
          </div>
          {showMeasure && <FootMeasureForm onMeasure={(cm)=>{ setMeasuredCm(cm); console.log('event','size_calculated') }} />}
        </div>

        {result && (
          <div className="ssw-card">
            <div className="ssw-description">{result.summary}</div>
            <ResultCard recommended={result.recommended} alternative={result.alternative} fitNote={result.fitNote} confidence={result.confidence} />
          </div>
        )}

        <div className="ssw-footer">
          <button className="ssw-button ssw-button-full" onClick={apply}>Bu bedeni seç</button>
          <p className="ssw-footer-note">Otomatik seçilemiyorsa, önerilen bedeni ürün sayfasında manuel olarak seç.</p>
        </div>
      </Drawer>
    </div>
  )
}
