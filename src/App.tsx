import Header from './components/Header'
import HeroSection from './components/HeroSection'
import EdgeDivider from './components/EdgeDivider'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import PortfolioSection from './components/PortfolioSection'
import SkillsSection from './components/SkillsSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import AdminApp from './admin/AdminApp'
import { useEffect } from 'react'
import { usePublicRows } from './hooks/usePublicRows'

export default function App() {
  const settings = usePublicRows('site_settings')
  useEffect(() => {
    const record = settings.find(row => row.key === 'global_theme')
    const theme = (record?.value || {}) as Record<string, string>
    const root = document.documentElement
    const primary = theme.primary || '#ff101a'
    const secondary = theme.secondary || '#850000'
    root.style.setProperty('--red', primary)
    root.style.setProperty('--red-deep', secondary)
    root.style.setProperty('--bg', theme.background || '#050505')
    root.style.setProperty('--white', theme.text || '#ffffff')
    root.style.setProperty('--gray', theme.muted || '#c0c0c0')
    root.style.setProperty('--border-red', primary + '47')
    root.style.setProperty('--glow-red', '0 0 22px ' + primary + '73')
  }, [settings])
  const path = window.location.pathname.replace(/\/$/, '')
  if (path === '/admin') return <AdminApp />

  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <EdgeDivider />
        <AboutSection />
        <ServicesSection />
        <PortfolioSection />
        <SkillsSection />
        <EdgeDivider flip />
        <ContactSection />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
