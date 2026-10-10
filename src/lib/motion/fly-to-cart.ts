/**
 * Animates a product thumbnail from `from` to the visible cart icon, then bumps it.
 * Uses the Web Animations API (transform/opacity only); skipped for reduced motion.
 */
export function flyToCart(from: HTMLElement, image: string): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const targets = [...document.querySelectorAll<HTMLElement>('[data-cart-target]')].filter((el) => el.offsetParent !== null)
  const target = targets[0]
  if (!target) return
  const a = from.getBoundingClientRect()
  const b = target.getBoundingClientRect()
  const img = document.createElement('img')
  img.src = image
  img.alt = ''
  Object.assign(img.style, {
    position: 'fixed',
    left: `${a.left + a.width / 2 - 32}px`,
    top: `${a.top + a.height / 2 - 32}px`,
    width: '64px',
    height: '64px',
    borderRadius: '12px',
    objectFit: 'cover',
    zIndex: '70',
    pointerEvents: 'none',
    boxShadow: '0 10px 30px -10px rgba(6,18,42,.6)',
  })
  document.body.appendChild(img)
  const dx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dy = b.top + b.height / 2 - (a.top + a.height / 2)
  const anim = img.animate(
    [
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 80}px) scale(.7)`, opacity: 0.95, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(.2)`, opacity: 0.3 },
    ],
    { duration: 700, easing: 'cubic-bezier(.5,0,.2,1)' },
  )
  anim.onfinish = () => {
    img.remove()
    target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 350, easing: 'ease-out' })
  }
}
