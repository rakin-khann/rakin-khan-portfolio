import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'

function formatDate(value: unknown) {
  if (!value) return 'Present'
  const date = new Date(`${String(value)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}

export default function JourneySection() {
  const experiences = usePublicRows('experiences')
  const education = usePublicRows('education')
  const ref = useReveal<HTMLElement>()

  if (!experiences.length && !education.length) return null

  return (
    <section ref={ref} id="experience" className="section journey" aria-label="Experience and education">
      <div className="container">
        <div className="journey-heading" data-reveal>
          <p className="section-label">{'//'} The Journey</p>
          <h2 className="section-title">Experience &amp; <span className="text-red">Education</span></h2>
          <p className="section-sub">The experience and learning behind my work.</p>
        </div>
        <div className="journey-columns">
          {experiences.length > 0 && (
            <div className="journey-column" data-reveal>
              <h3 className="journey-column-title">Professional Experience</h3>
              <div className="journey-list">
                {experiences.map((row, index) => (
                  <article className="journey-card" key={String(row.id || index)}>
                    <span className="journey-date">{formatDate(row.start_date)} — {formatDate(row.end_date)}</span>
                    <h4>{String(row.role || 'Position')}</h4>
                    <p className="journey-place">{String(row.company || '')}{row.employment_type ? ` · ${String(row.employment_type)}` : ''}</p>
                    {Boolean(row.location) && <p className="journey-location">{String(row.location)}</p>}
                    {Boolean(row.description) && <p className="journey-description">{String(row.description)}</p>}
                  </article>
                ))}
              </div>
            </div>
          )}
          {education.length > 0 && (
            <div className="journey-column" data-reveal>
              <h3 className="journey-column-title">Education</h3>
              <div className="journey-list">
                {education.map((row, index) => (
                  <article className="journey-card" key={String(row.id || index)}>
                    <span className="journey-date">{formatDate(row.start_date)} — {formatDate(row.end_date)}</span>
                    <h4>{String(row.institution || 'Institution')}</h4>
                    <p className="journey-place">{[row.qualification, row.field_of_study].filter(Boolean).map(String).join(' · ')}</p>
                    {row.description && <p className="journey-description">{String(row.description)}</p>}
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
