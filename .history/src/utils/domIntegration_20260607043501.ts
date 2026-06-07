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
      for(const opt of Array.from(sel.options)){
        if(opt.textContent && opt.textContent.trim()===value){
          sel.value = opt.value
          sel.dispatchEvent(new Event('change',{bubbles:true}))
          return true
        }
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
