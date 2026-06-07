import React, { useEffect, useMemo, useState } from 'react'
import Drawer from './drawer'
import BrandSelector from '../components/BrandSelector'
import SizeSelector from '../components/SizeSelector'
import FitPreference from '../components/FitPreference'
import ResultCard from '../components/ResultCard'
import FootMeasureForm from '../components/FootMeasureForm'
import { toCm, findNearestSizeByCm, applyFitPreference } from '../utils/sizeConverter'
import { brandSizeProfiles } from '../data/brandSizeProfiles'
import { trySelectSize } from '../utils/domIntegration'

export default function ShoeSizeWidget({targetBrand}:{targetBrand:string}){
  const [open,setOpen] = useState(true)
  const [fromBrand,setFromBrand] = useState('Adidas')
  const [system,setSystem] = useState<'EU'|'CM'>('EU')
  const [value,setValue] = useState('42')
  const [fit,setFit] = useState('normal')
  const [measuredCm,setMeasuredCm] = useState<number|undefined>()
  const profile = (brandSizeProfiles as any)[targetBrand]

  const result = useMemo(()=>{
    // determine cm
    let cm:number| null = null
    if(measuredCm) cm = measuredCm
    else cm = toCm(fromBrand, Number(value), system)
    if(!cm) return null
    const nearest = findNearestSizeByCm(targetBrand, cm)
    if(!nearest) return null
    let eu = nearest.eu + ((profile?.offsetFromStandard)||0)
    eu = applyFitPreference(eu, fit)
    const alt = eu - 0.5
    const confidence = 80
    return {recommended: `EU ${eu}`, alternative: `EU ${alt}`, fitNote: profile?.fitNote, confidence}
  },[fromBrand,value,system,fit,measuredCm,targetBrand])

  useEffect(()=>{ console.log('event','widget_opened') },[])

  const apply = ()=>{
    if(!result) return
    const ok = trySelectSize(result.recommended.replace('EU ','').trim())
    console.log('event','size_selected', {ok, recommended: result.recommended})
    if(!ok) alert(`Bu ürün için önerilen bedenin: ${result.recommended}`)
  }

  return (
    <div style={{minWidth:320}}>
      <Drawer open={open} onClose={()=>{setOpen(false); console.log('event','widget_closed')}}>
        <BrandSelector value={fromBrand} onChange={setFromBrand} />
        <div style={{height:12}} />
        <div style={{display:'flex',gap:12}}>
          <div style={{flex:1}}>
            <SizeSelector system={system} options={[40,41,42,42.5,43]} value={value} onChange={setValue} />
          </div>
          <div style={{width:120}}>
            <label>Hedef marka</label>
            <div style={{padding:8,background:'#f2f2f2',borderRadius:8}}>{targetBrand}</div>
          </div>
        </div>
        <FitPreference value={fit} onChange={setFit} />
        <FootMeasureForm onMeasure={(cm)=>{ setMeasuredCm(cm); console.log('event','size_calculated') }} />
        {result && <ResultCard recommended={result.recommended} alternative={result.alternative} fitNote={result.fitNote} confidence={result.confidence} />}
        <div style={{marginTop:12}}>
          <button className="ssw-button" onClick={apply}>Bu bedeni seç</button>
        </div>
      </Drawer>
    </div>
  )
}
