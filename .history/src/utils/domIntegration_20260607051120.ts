export function findSizeElement() {
  // try select
  const selectors = ['select[name*="size"]','select[id*="size"]','select']
  for(const sel of selectors){
    const el = document.querySelector(sel) as HTMLSelectElement | null
    if(el && el.options.length>0) return el
  }
  // radios
  const radios = Array.from(document.querySelectorAll('input[type="radio"]'))
  if(radios.length) return radios[0].closest('form') || radios[0]
  return null
}

export function trySelectSize(value:string){
  try{
    const sel = findSizeElement() as HTMLSelectElement | null
    if(sel && sel.tagName === 'SELECT'){
      const target = String(value).trim()
      const numericTarget = Number(target.replace(/[^\\d.]/g,''))
      // exact text match
      for(const [i,opt] of Array.from(sel.options).entries()){
        const text = opt.textContent? opt.textContent.trim() : ''
        if(text === target){ sel.selectedIndex = i; sel.dispatchEvent(new Event('change',{bubbles:true})); return true }
        const num = Number(text.replace(/[^\d.]/g,''))
        if(!Number.isNaN(num) && !Number.isNaN(numericTarget) && Math.abs(num - numericTarget) < 0.001){ sel.selectedIndex = i; sel.dispatchEvent(new Event('change',{bubbles:true})); return true }
      }
      // nearest numeric fallback
      if(!Number.isNaN(numericTarget)){
        let bestIndex = -1
        let bestDiff = Infinity
        for(const [i,opt] of Array.from(sel.options).entries()){
          const text = opt.textContent? opt.textContent.trim() : ''
          const num = Number(text.replace(/[^\d.]/g,''))
          if(Number.isNaN(num)) continue
          const d = Math.abs(num - numericTarget)
          if(d < bestDiff){ bestDiff = d; bestIndex = i }
        }
        if(bestIndex >= 0){ sel.selectedIndex = bestIndex; sel.dispatchEvent(new Event('change',{bubbles:true})); return true }
      }
    }
    // radios
    const radios = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[]
    for(const r of radios){
      const label = (r.nextElementSibling && r.nextElementSibling.textContent) || r.value
      if(label && label.trim()===value){
        r.checked = true
        r.dispatchEvent(new Event('change',{bubbles:true}))
        return true
      }
    }
  }catch(e){ console.warn('select error',e) }
  return false
}
