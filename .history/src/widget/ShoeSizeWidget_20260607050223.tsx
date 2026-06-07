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
  const [open,setOpen] = useState(true)
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
    <div>
      <Drawer open={open} onClose={()=>{setOpen(false); console.log('event','widget_closed')}}>
        <div className="ssw-section">
          <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',alignItems:'center'}}>
            <div>
              <p className="ssw-label">Hedef marka</p>
              <p style={{margin:'8px 0 0',fontSize:'1rem',fontWeight:700}}>{selectedTargetBrand}</p>
            </div>
            <button type="button" className="ssw-secondary" onClick={()=>setShowMeasure(prev=>!prev)}>{showMeasure ? 'Ölçümü gizle' : 'Ayağımı ölç'} </button>
          </div>
        </div>

        <div className="ssw-section ssw-grid-2">
          <BrandSelector value={fromBrand} onChange={setFromBrand} />
          <div>
            <label className="ssw-label">Beden sistemin</label>
            <div className="ssw-pill-group" style={{marginBottom:12}}>
              {(['EU','US','UK','CM'] as const).map(mode => (
                <button key={mode} type="button" className={`ssw-pill ${system===mode? 'active':''}`} onClick={()=>setSystem(mode)}>{mode}</button>
              ))}
            </div>
            <SizeSelector system={system} options={SIZE_OPTIONS[system]} value={value} onChange={setValue} />
          </div>
        </div>

        <FitPreference value={fit} onChange={setFit} />
        {showMeasure && <FootMeasureForm onMeasure={(cm)=>{ setMeasuredCm(cm); console.log('event','size_calculated') }} />}

        {result && (
          <div className="ssw-section">
            <div className="ssw-description">{result.summary}</div>
            <ResultCard recommended={result.recommended} alternative={result.alternative} fitNote={result.fitNote} confidence={result.confidence} />
          </div>
        )}

        <div className="ssw-section" style={{marginTop:16}}>
          <button className="ssw-button" onClick={apply}>Bu bedeni seç</button>
        </div>
      </Drawer>
    </div>
  )
}
