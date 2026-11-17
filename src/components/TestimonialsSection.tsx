import { usePublicRows } from '../hooks/usePublicRows'
import { useReveal } from '../hooks/useScrollAnimation'

export default function TestimonialsSection() {
  const testimonials = usePublicRows('testimonials')
  const ref = useReveal<HTMLElement>()

  if (!testimonials.length) return null

  return (
    <section ref={ref} id="testimonials" className="section testimonials" aria-label="Client testimonials">
      <div className="container">
        <div className="testimonials-heading" data-reveal>
          <p className="section-label">{'//'} Kind Words</p>
          <h2 className="section-title">Client <span className="text-red">Testimonials</span></h2>
          <p className="section-sub">A few words from the people I have had the pleasure to work with.</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((row, index) => (
            <article className="testimonial-card" key={String(row.id || index)} data-reveal data-reveal-delay={(index % 3) * 0.08}>
              <span className="testimonial-quote-mark" aria-hidden="true">“</span>
              <blockquote>{String(row.quote || '')}</blockquote>
              <div className="testimonial-client">
                {row.avatar_url ? <img src={String(row.avatar_url)} alt={String(row.client_name || 'Client')} loading="lazy" /> : <span className="testimonial-avatar-fallback">{String(row.client_name || 'C').trim().charAt(0).toUpperCase()}</span>}
                <div>
                  <h3>{String(row.client_name || 'Client')}</h3>
                  {Boolean(row.client_role || row.company) && <p>{[row.client_role, row.company].filter(Boolean).map(String).join(' · ')}</p>}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
