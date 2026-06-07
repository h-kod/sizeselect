import React from 'react'
import { createRoot } from 'react-dom/client'
import ShoeSizeWidget from './ShoeSizeWidget'
import cssText from '../styles/widget.css?inline'

let mounted = false
let currentTarget: HTMLElement | null = null
let currentBrand = 'Nike'

function injectIntoShadow(rootEl:HTMLElement, brand:string, openOnMount = false){
  const host = document.createElement('div')
  host.dataset.sswHost = 'true'
  host.style.display = 'block'
  host.style.width = '100%'
  host.style.marginTop = '14px'
  const shadow = host.attachShadow({mode:'open'})
  const style = document.createElement('style')
  style.textContent = cssText
  shadow.appendChild(style)
  const mount = document.createElement('div')
  shadow.appendChild(mount)
  rootEl.appendChild(host)
  const r = createRoot(mount)
  r.render(React.createElement(ShoeSizeWidget,{targetBrand:brand, initialOpen: openOnMount}))
  mounted = true
}

function findInsertTarget(position:string){
  if(position === 'after-size-selector'){
    const sel = document.querySelector('select[name*="size"], select[id*="size"], select')
    if(sel && sel.parentElement) return sel.parentElement
  }
  return document.body
}

function openWidget(){
  if(!currentTarget) return
  if(!mounted){
    injectIntoShadow(currentTarget, currentBrand, true)
    return
  }
  const host = currentTarget.querySelector('[data-ssw-host]') as HTMLElement | null
  const trigger = host?.shadowRoot?.querySelector<HTMLButtonElement>('.ssw-trigger')
  trigger?.click()
}

function init(){
  const script = document.currentScript as HTMLScriptElement | null
  const brand = script?.dataset.brand || 'Nike'
  const pos = script?.dataset.position || 'after-size-selector'
  const target = findInsertTarget(pos)
  currentTarget = target
  currentBrand = brand
  if(!target) return
  try{
    injectIntoShadow(target, brand)
  }catch(error){
    console.error('ShoeSizeWidget injection failed', error)
  }
  ;(window as any).openShoeSizeWidget = openWidget
}

init()
