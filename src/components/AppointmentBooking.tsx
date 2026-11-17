import { FormEvent, useState } from 'react'
import { IconArrowRight, IconClose } from './icons'
import './appointment-booking.css'

const SUPABASE_URL = 'https://ycfisgnmholndarlxvhv.supabase.co'

export default function AppointmentBooking() {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSending(true); setMessage(''); setSuccess(false)
    const form = new FormData(event.currentTarget)
    const payload = Object.fromEntries(form.entries())
    try {
      const response = await fetch(SUPABASE_URL + '/functions/v1/submit-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: 'sb_publishable_VWbu25WPHH-IDdlAD8YUVA_HymuCAcF' },
        body: JSON.stringify(payload),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.error || 'Could not submit your request.')
      setSuccess(true)
      setMessage(result.emailSent ? 'Your appointment request has been sent successfully. I will contact you soon.' : 'Your request was received. Email notification is not fully configured yet.')
      event.currentTarget.reset()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally { setSending(false) }
  }

  return <>
    <button type="button" className="btn appointment-open-btn" onClick={() => { setOpen(true); setMessage(''); setSuccess(false) }}>
      Appointment Booking <IconArrowRight />
    </button>
    {open && <div className="appointment-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false) }}>
      <section className="appointment-dialog" role="dialog" aria-modal="true" aria-labelledby="appointment-title">
        <button type="button" className="appointment-close" onClick={() => setOpen(false)} aria-label="Close booking form"><IconClose /></button>
        <p className="section-label">// LET'S PLAN YOUR PROJECT</p>
        <h2 id="appointment-title">Appointment <span className="text-red">Booking</span></h2>
        <p className="appointment-lead">Share a few details about yourself and the work you need. I'll get back to you to confirm the next step.</p>
        <form className="appointment-form" onSubmit={submit}>
          <div className="appointment-form-grid">
            <label>Full name *<input name="full_name" required maxLength={160} autoComplete="name" placeholder="Your full name" /></label>
            <label>Email address *<input name="email" type="email" required autoComplete="email" placeholder="name@example.com" /></label>
            <label>Phone number *<input name="phone" type="tel" required autoComplete="tel" placeholder="+880..." /></label>
            <label>WhatsApp number<input name="whatsapp" type="tel" placeholder="If different from phone" /></label>
            <label>Company / Organization<input name="company_name" placeholder="Company or brand name" /></label>
            <label>Country<input name="country" placeholder="Your country" autoComplete="country-name" /></label>
            <label className="appointment-full">Office address<input name="office_address" placeholder="Street, city, office address" autoComplete="street-address" /></label>
            <label className="appointment-full">Where do you currently live? *<input name="residence_location" required placeholder="City, area, country" /></label>
            <label>What service do you need? *<select name="service_type" required defaultValue=""><option value="" disabled>Select a service</option><option>Restaurant graphic design</option><option>Logo & brand identity</option><option>Menu design (print / TV / digital)</option><option>Flyer, poster & table tent</option><option>Social media design</option><option>Website / UI design</option><option>Other</option></select></label>
            <label>Project type<input name="project_type" placeholder="New project, redesign, ongoing work..." /></label>
            <label>Estimated budget<select name="budget_range" defaultValue=""><option value="">Choose a budget</option><option>Under $100</option><option>$100–$300</option><option>$300–$500</option><option>$500–$1,000</option><option>$1,000+</option><option>Not sure yet</option></select></label>
            <label>Preferred meeting type<select name="meeting_type" defaultValue=""><option value="">Choose meeting type</option><option>Video call</option><option>Phone call</option><option>Email discussion</option><option>In-person meeting (if possible)</option></select></label>
            <label>Preferred date<input name="preferred_date" type="date" min={new Date().toISOString().slice(0,10)} /></label>
            <label>Preferred time / time zone<input name="preferred_time" placeholder="e.g. 3:00 PM (GMT+6)" /></label>
            <label>Best way to contact you<select name="contact_method" defaultValue=""><option value="">Choose contact method</option><option>Email</option><option>Phone call</option><option>WhatsApp</option></select></label>
            <label>Reference / Existing website URL<input name="reference_url" type="url" placeholder="https://..." /></label>
            <label className="appointment-full">Describe the work you want done *<textarea name="project_description" required rows={5} maxLength={6000} placeholder="Tell me about your business, goals, design requirements, number of items/pages, deadline and any other important details..." /></label>
          </div>
          {message && <p className={success ? 'appointment-message success' : 'appointment-message error'} role="status">{message}</p>}
          <button className="btn appointment-submit" type="submit" disabled={sending}>{sending ? 'Submitting…' : 'Submit Appointment Request'} <IconArrowRight /></button>
          <p className="appointment-privacy">Your details will only be used to review and respond to this appointment request.</p>
        </form>
      </section>
    </div>}
  </>
}
