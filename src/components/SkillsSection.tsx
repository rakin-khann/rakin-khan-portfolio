import { useLayoutEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { SKILLS } from '../data/content'
import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'
import { IconArrowRight } from './icons'

const RADIUS = 64
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function SkillRing({ name, value }: { name: string; value: number }) {
  const fgRef = useRef<SVGCircleElement>(null)
  const numRef = useRef<HTMLSpanElement>(null)

  useLayoutEffect(() => {
    const fg = fgRef.current
    const num = numRef.current
    if (!fg || !num) return

    const finalOffset = CIRCUMFERENCE * (1 - value / 100)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      fg.style.strokeDashoffset = String(finalOffset)
      num.textContent = `${value}%`
      return
    }

    const counter = { v: 0 }
    const ctx = gsap.context(() => {
      gsap.set(fg, { strokeDashoffset: CIRCUMFERENCE })
      gsap
        .timeline({
          scrollTrigger: { trigger: fg, start: 'top 88%', once: true },
        })
        .to(fg, { strokeDashoffset: finalOffset, duration: 1.5, ease: 'power2.inOut' }, 0)
        .to(
          counter,
          {
            v: value,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
              num.textContent = `${Math.round(counter.v)}%`
            },
          },
          0,
        )
    })

    return () => ctx.revert()
  }, [value])

  return (
    <div className="skill-ring" data-reveal>
      <div className="ring-wrap">
        <svg className="ring-svg" viewBox="0 0 150 150" role="img" aria-label={`${name}: ${value} percent`}>
          <circle className="ring-bg" cx="75" cy="75" r={RADIUS} />
          <circle
            ref={fgRef}
            className="ring-fg"
            cx="75"
            cy="75"
            r={RADIUS}
            style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: CIRCUMFERENCE }}
          />
        </svg>
        <span ref={numRef} className="ring-value">
          0%
        </span>
      </div>
      <p className="skill-name">{name}</p>
    </div>
  )
}

export default function SkillsSection() {
  const skillRows = usePublicRows('skills')
  const skills = skillRows.length ? skillRows.map(row => ({ name: String(row.name || ''), value: Number(row.proficiency || 0) })) : SKILLS
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="skills" className="section skills" aria-label="Skills">
      <div className="bg-art left" aria-hidden="true">
        <img src="/assets/bg-torii.webp" alt="" />
      </div>

      <div className="container split">
        <div className="split-head" data-reveal>
          <p className="section-label">{'//'} My Skills</p>
          <h2 className="section-title">
            Exper<span className="text-red">tise</span>
          </h2>
          <p className="section-sub">Tools &amp; technologies I work with.</p>
          <a href="#contact" className="btn btn-ghost">
            My Skills <IconArrowRight />
          </a>
        </div>

        <div className="skills-rings">
          {skills.map((skill) => (
            <SkillRing key={skill.name} name={skill.name} value={skill.value} />
          ))}
        </div>
      </div>
    </section>
  )
}
