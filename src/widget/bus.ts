/**
 * Widget ile dış API arasındaki küçük olay yolu.
 *
 * `ShoeFitWidget.init()` ile `ShoeFitWidget.open()` art arda çağrıldığında
 * pencere olayı, bileşen henüz dinlemeye başlamadığı için kaybolabiliyordu.
 * Bu yol istekleri tutar; bileşen bağlandığında bekleyen isteği devralır.
 */

type Command = 'open' | 'close'
type Listener = (command: Command) => void

const listeners = new Set<Listener>()
let pending: Command | null = null

function dispatch(command: Command): void {
  if (listeners.size === 0) {
    // Henüz kimse dinlemiyor: isteği bileşen bağlanana kadar sakla.
    pending = command
    return
  }
  listeners.forEach(listener => listener(command))
}

export const widgetBus = {
  open: () => dispatch('open'),
  close: () => dispatch('close'),

  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    if (pending) {
      const command = pending
      pending = null
      listener(command)
    }
    return () => {
      listeners.delete(listener)
    }
  },

  /** Widget yıkıldığında bekleyen istek de düşer. */
  reset(): void {
    pending = null
  }
}
