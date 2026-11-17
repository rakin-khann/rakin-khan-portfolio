import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'

/**
 * Reveals every `[data-reveal]` descendant of the returned ref when it
 * scrolls into view. Optional stagger via `data-reveal-delay="0.15"`.
 * Fully disabled (content simply visible) under prefers-reduced-motion.
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null)

  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return

    const targets = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll('[data-reveal]'),
    )
    if (targets.length === 0) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((t) => {
        t.style.opacity = '1'
        t.style.transform = 'none'
      })
      return
    }

    const ctx = gsap.context(() => {
      targets.forEach((t) => {
        gsap.fromTo(
          t,
          { y: 44, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: 'power3.out',
            delay: Number(t.dataset.revealDelay ?? 0),
            scrollTrigger: { trigger: t, start: 'top 88%', once: true },
          },
        )
      })
    }, root)

    return () => ctx.revert()
  }, [])

  return ref
}
