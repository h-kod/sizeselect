import React from 'react'
import { createRoot } from 'react-dom/client'
import ShoeSizeWidget from './ShoeSizeWidget'
import cssText from '../styles/widget.css?inline'

function injectIntoShadow(rootEl:HTMLElement, brand:string){
  const host = document.createElement('div')
  const shadow = host.attachShadow({mode:'open'})
  const style = document.createElement('style')
  style.textContent = cssText
  shadow.appendChild(style)
  const mount = document.createElement('div')
  shadow.appendChild(mount)
  rootEl.appendChild(host)
  const r = createRoot(mount)
  r.render(React.createElement(ShoeSizeWidget,{targetBrand:brand}))
}

function findInsertTarget(position:string){
  if(position === 'after-size-selector'){
    const sel = document.querySelector('select[name*="size"], select[id*="size"], select')
    if(sel && sel.parentElement) return sel.parentElement
  }
  return document.body
}

function init(){
  const script = document.currentScript as HTMLScriptElement | null
  const brand = script?.dataset.brand || 'Nike'
  const pos = script?.dataset.position || 'after-size-selector'
  const target = findInsertTarget(pos)
  if(!target) return
  // create small link if there's no obvious size area
  const wrapper = document.createElement('div')
  wrapper.style.display = 'inline-flex'
  wrapper.style.alignItems = 'center'
  wrapper.style.justifyContent = 'center'
  wrapper.style.marginTop = '14px'
  const link = document.createElement('a')
  link.textContent = 'Bedenimi Bul'
  link.href = '#'
  link.className = 'ssw-open-link'
  link.setAttribute('role','button')
  link.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;padding:0.9rem 1.3rem;border-radius:999px;background:#2563eb;color:#fff;text-decoration:none;font-weight:700;box-shadow:0 14px 32px rgba(37,99,235,0.18);transition:transform .16s ease,filter .16s ease;'
  link.onmouseover = ()=>{ link.style.transform = 'translateY(-1px)'; link.style.filter = 'brightness(1.05)' }
  link.onmouseout = ()=>{ link.style.transform = 'none'; link.style.filter = 'none' }
  link.onclick = (e)=>{ e.preventDefault(); injectIntoShadow(wrapper, brand); document.querySelector('.ssw-open-link')?.remove() }
  wrapper.appendChild(link)
  target.appendChild(wrapper)
}

init()
