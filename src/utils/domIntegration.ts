export function findSizeElement(): HTMLElement | null {
  const selectors = ['select[name*="size"]', 'select[id*="size"]', 'select[class*="size"]', 'select[class*="beden"]', 'select[class*="numara"]', 'select'];
  for (const sel of selectors) {
    const el = document.querySelector(sel) as HTMLSelectElement | null;
    if (el && el.options.length > 0) return el;
  }
  const radios = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
  if (radios.length > 0) {
    const sizeRadios = radios.filter(r => {
      const name = r.name.toLowerCase();
      const id = r.id.toLowerCase();
      return name.includes('size') || name.includes('beden') || name.includes('numara') ||
             id.includes('size') || id.includes('beden') || id.includes('numara');
    });
    if (sizeRadios.length > 0) {
      return sizeRadios[0].closest('form') || sizeRadios[0];
    }
    return radios[0].closest('form') || radios[0];
  }
  return null;
}

function matchSingleSizeElement(el: HTMLElement, target: string, numericTarget: number): boolean {
  if (el.tagName === 'SELECT') {
    const sel = el as HTMLSelectElement;
    for (const [i, opt] of Array.from(sel.options).entries()) {
      const optText = opt.textContent ? opt.textContent.trim() : '';
      const optNum = parseFloat(optText.replace(/[^\d.]/g, ''));
      if (optText === target || (!isNaN(optNum) && !isNaN(numericTarget) && Math.abs(optNum - numericTarget) < 0.001)) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        sel.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
    }
  } else if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'radio') {
    const r = el as HTMLInputElement;
    r.checked = true;
    r.dispatchEvent(new Event('change', { bubbles: true }));
    r.dispatchEvent(new Event('click', { bubbles: true }));
    r.dispatchEvent(new Event('input', { bubbles: true }));
    if (r.id) {
      const label = document.querySelector(`label[for="${r.id}"]`) as HTMLElement | null;
      if (label) {
        label.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        label.click();
        label.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
    }
    el.click();
    return true;
  } else {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.click();
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }
  return false;
}

export function trySelectSize(value: string, customSelector?: string): boolean {
  try {
    const target = String(value).trim();
    const numericTarget = parseFloat(target.replace(/[^\d.]/g, ''));

    // 0. Try custom selector if provided
    if (customSelector) {
      try {
        const customEls = Array.from(document.querySelectorAll(customSelector)) as HTMLElement[];
        for (const el of customEls) {
          if (el.tagName === 'SELECT' || (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'radio')) {
            const success = matchSingleSizeElement(el, target, numericTarget);
            if (success) return true;
          } else {
            // Check if element itself matches
            const text = el.textContent ? el.textContent.trim() : (el as any).value || '';
            const num = parseFloat(text.replace(/[^\d.]/g, ''));
            if (text === target || (!isNaN(num) && !isNaN(numericTarget) && Math.abs(num - numericTarget) < 0.001)) {
              const success = matchSingleSizeElement(el, target, numericTarget);
              if (success) return true;
            }

            // Check if children match
            const childSelectors = ['button', 'input[type="radio"]', 'input[type="button"]', 'a', '[role="button"]', 'li', 'span', 'div', 'label'];
            for (const selStr of childSelectors) {
              const items = Array.from(el.querySelectorAll(selStr)) as HTMLElement[];
              for (const item of items) {
                const itemText = item.textContent ? item.textContent.trim() : (item as any).value || '';
                const itemNum = parseFloat(itemText.replace(/[^\d.]/g, ''));
                if (itemText === target || (!isNaN(itemNum) && !isNaN(numericTarget) && Math.abs(itemNum - numericTarget) < 0.001)) {
                  const success = matchSingleSizeElement(item, target, numericTarget);
                  if (success) return true;
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('[ShoeFit DOM] Invalid custom size selector:', customSelector, err);
      }
    }

    // 1. Try standard select dropdown
    const sel = findSizeElement() as HTMLSelectElement | null;
    if (sel && sel.tagName === 'SELECT') {
      const success = matchSingleSizeElement(sel, target, numericTarget);
      if (success) return true;
    }

    // 2. Try standard input radios
    const radios = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
    for (const r of radios) {
      const labelText = (r.nextElementSibling && r.nextElementSibling.textContent) || 
                        (r.parentElement && r.parentElement.textContent) || 
                        r.value || '';
      const cleanLabel = labelText.trim();
      const numLabel = parseFloat(cleanLabel.replace(/[^\d.]/g, ''));

      if (cleanLabel === target || (!isNaN(numLabel) && !isNaN(numericTarget) && Math.abs(numLabel - numericTarget) < 0.001)) {
        const success = matchSingleSizeElement(r, target, numericTarget);
        if (success) return true;
      }
    }

    // 3. Try custom interactive button grids / swatches / divs / list items
    const interactiveSelectors = ['button', 'a', '[role="button"]', 'li', 'span', 'div'];
    const sizeContainers = Array.from(document.querySelectorAll(
      '[class*="size"], [id*="size"], [class*="beden"], [id*="beden"], [class*="numara"], [id*="numara"], [class*="swatch"], [class*="variant"], [class*="option"]'
    ));

    for (const container of sizeContainers) {
      for (const selStr of interactiveSelectors) {
        const items = Array.from(container.querySelectorAll(selStr)) as HTMLElement[];
        for (const item of items) {
          const text = item.textContent ? item.textContent.trim() : '';
          const num = parseFloat(text.replace(/[^\d.]/g, ''));

          if (text === target || (!isNaN(num) && !isNaN(numericTarget) && Math.abs(num - numericTarget) < 0.001)) {
            const success = matchSingleSizeElement(item, target, numericTarget);
            if (success) return true;
          }
        }
      }
    }

    // 4. Global page scanner fallback
    const allButtons = Array.from(document.querySelectorAll('button, [role="button"], .size-option-label')) as HTMLElement[];
    for (const btn of allButtons) {
      const text = btn.textContent ? btn.textContent.trim() : '';
      const num = parseFloat(text.replace(/[^\d.]/g, ''));
      if (text === target || (!isNaN(num) && !isNaN(numericTarget) && Math.abs(num - numericTarget) < 0.001)) {
        const lower = text.toLowerCase();
        if (lower.includes('ekle') || lower.includes('cart') || lower.includes('bag') || lower.includes('buy') || lower.includes('$') || lower.includes('tl') || lower.includes('€')) {
          continue;
        }
        const success = matchSingleSizeElement(btn, target, numericTarget);
        if (success) return true;
      }
    }

  } catch (e) {
    console.warn('[ShoeFit DOM] Select size error:', e);
  }
  return false;
}

export function tryAddToCart(customSelector?: string): boolean {
  try {
    // 0. Try custom selector if provided
    if (customSelector) {
      try {
        const btn = document.querySelector(customSelector) as HTMLElement | null;
        if (btn && btn.offsetParent !== null) {
          btn.click();
          return true;
        }
      } catch (err) {
        console.warn('[ShoeFit DOM] Invalid custom cart selector:', customSelector, err);
      }
    }

    const selectors = [
      '.single_add_to_cart_button',
      '[name="add"]',
      '.add-to-cart', '#add-to-cart',
      '[data-add-to-cart]',
      '.btn-cart', '#btn-cart',
      'button[class*="add-to-cart"]',
      'button[class*="addtocart"]',
      'button[id*="add-to-cart"]',
      'button[id*="addtocart"]',
      'form[action*="/cart/add"] button[type="submit"]',
      'form[action*="/cart/add"] input[type="submit"]'
    ];

    for (const sel of selectors) {
      const btn = document.querySelector(sel) as HTMLElement | null;
      if (btn && btn.offsetParent !== null) {
        btn.click();
        return true;
      }
    }

    const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, a.button')) as HTMLElement[];
    for (const btn of allButtons) {
      const text = (btn.textContent || (btn as any).value || '').toLowerCase();
      if (
        text.includes('sepete ekle') ||
        text.includes('add to cart') ||
        text.includes('add to bag') ||
        text.includes('sepet') ||
        text.includes('add to basket')
      ) {
        if (btn.offsetParent !== null) {
          btn.click();
          return true;
        }
      }
    }

    const cartForm = document.querySelector('form[action*="/cart/add"]') as HTMLFormElement | null;
    if (cartForm) {
      cartForm.submit();
      return true;
    }

  } catch (e) {
    console.warn('[ShoeFit DOM] Add to cart error:', e);
  }
  return false;
}

export function canSelectSize(customSelector?: string): boolean {
  if (customSelector) {
    try {
      const el = document.querySelector(customSelector);
      if (el) return true;
    } catch (e) {}
  }
  
  if (findSizeElement()) return true;
  
  const radios = Array.from(document.querySelectorAll('input[type="radio"]')) as HTMLInputElement[];
  const sizeRadios = radios.filter(r => {
    const name = r.name.toLowerCase();
    const id = r.id.toLowerCase();
    return name.includes('size') || name.includes('beden') || name.includes('numara') ||
           id.includes('size') || id.includes('beden') || id.includes('numara');
  });
  if (sizeRadios.length > 0) return true;

  const sizeContainers = Array.from(document.querySelectorAll(
    '[class*="size"], [id*="size"], [class*="beden"], [id*="beden"], [class*="numara"], [id*="numara"], [class*="swatch"], [class*="variant"], [class*="option"]'
  ));
  if (sizeContainers.length > 0) {
    const interactiveSelectors = ['button', 'a', '[role="button"]', 'li', 'span', 'div'];
    for (const container of sizeContainers) {
      for (const selStr of interactiveSelectors) {
        const items = container.querySelectorAll(selStr);
        if (items.length > 0) return true;
      }
    }
  }

  const allButtons = Array.from(document.querySelectorAll('button, [role="button"], .size-option-label')) as HTMLElement[];
  for (const btn of allButtons) {
    const text = btn.textContent ? btn.textContent.trim() : '';
    const num = parseFloat(text.replace(/[^\d.]/g, ''));
    if (!isNaN(num) && num >= 18 && num <= 50) {
      const lower = text.toLowerCase();
      if (!lower.includes('ekle') && !lower.includes('cart') && !lower.includes('bag') && !lower.includes('buy') && !lower.includes('$') && !lower.includes('tl') && !lower.includes('€')) {
        return true;
      }
    }
  }

  return false;
}

export function canAddToCart(customSelector?: string): boolean {
  if (customSelector) {
    try {
      const el = document.querySelector(customSelector);
      if (el) return true;
    } catch (e) {}
  }
  const selectors = [
    '.single_add_to_cart_button',
    '[name="add"]',
    '.add-to-cart', '#add-to-cart',
    '[data-add-to-cart]',
    '.btn-cart', '#btn-cart',
    'button[class*="add-to-cart"]',
    'button[class*="addtocart"]',
    'button[id*="add-to-cart"]',
    'button[id*="addtocart"]',
    'form[action*="/cart/add"] button[type="submit"]',
    'form[action*="/cart/add"] input[type="submit"]'
  ];
  for (const sel of selectors) {
    if (document.querySelector(sel)) return true;
  }
  const allButtons = Array.from(document.querySelectorAll('button, input[type="submit"], input[type="button"], a.btn, a.button')) as HTMLElement[];
  for (const btn of allButtons) {
    const text = (btn.textContent || (btn as any).value || '').toLowerCase();
    if (
      text.includes('sepete ekle') ||
      text.includes('add to cart') ||
      text.includes('add to bag') ||
      text.includes('sepet') ||
      text.includes('add to basket')
    ) {
      return true;
    }
  }
  const cartForm = document.querySelector('form[action*="/cart/add"]');
  if (cartForm) return true;

  return false;
}
