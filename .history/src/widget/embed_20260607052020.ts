import React from 'react'
import { createRoot } from 'react-dom/client'
import ShoeSizeWidget from './ShoeSizeWidget'
import cssText from '../styles/widget.css?inline'

function injectIntoShadow(rootEl:HTMLElement, brand:string){
  const host = document.createElement('div')
  host.style.display = 'inline-flex'
  host.style.marginTop = '14px'
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
  injectIntoShadow(target, brand)
}

init()
