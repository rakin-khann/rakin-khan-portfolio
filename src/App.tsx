import Header from './components/Header'
import HeroSection from './components/HeroSection'
import FeaturedWorkSlider from './components/FeaturedWorkSlider'
import VideoGalleryFeature from './components/VideoGalleryFeature'
import EdgeDivider from './components/EdgeDivider'
import AboutSection from './components/AboutSection'
import ServicesSection from './components/ServicesSection'
import PortfolioSection from './components/PortfolioSection'
import ProjectDetail from './components/ProjectDetail'
import VideoDetail from './components/VideoDetail'
import VideoGallery from './components/VideoGallery'
import SkillsSection from './components/SkillsSection'
import JourneySection from './components/JourneySection'
import TestimonialsSection from './components/TestimonialsSection'
import ContactSection from './components/ContactSection'
import Footer from './components/Footer'
import BackToTop from './components/BackToTop'
import AdminApp from './admin/AdminApp'
import { useEffect } from 'react'
import { usePublicRows } from './hooks/usePublicRows'
import { startAnalytics } from './lib/analytics'

export default function App() {
  const settings = usePublicRows('site_settings')
  useEffect(() => startAnalytics(), [])
  useEffect(() => {
    const record = settings.find(row => row.key === 'global_theme')
    const theme = (record?.value || {}) as Record<string, string>
    const root = document.documentElement
    const primary = theme.primary || '#ff101a'; const secondary = theme.secondary || '#850000'
    const toRgb = (hex: string) => [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)).join(', ')
    root.style.setProperty('--red-rgb', toRgb(primary)); root.style.setProperty('--red-deep-rgb', toRgb(secondary)); root.style.setProperty('--red', primary); root.style.setProperty('--red-deep', secondary)
    root.style.setProperty('--bg', theme.background || '#050505'); root.style.setProperty('--white', theme.text || '#ffffff'); root.style.setProperty('--gray', theme.muted || '#c0c0c0'); root.style.setProperty('--border-red', primary + '47'); root.style.setProperty('--glow-red', '0 0 22px ' + primary + '73')
  }, [settings])
  const path = window.location.pathname.replace(/\/+$/, '')
  if (path === '/admin') return <AdminApp />
  if (path === '/videos') return <VideoGallery />
  if (path.startsWith('/projects/')) return <ProjectDetail slug={decodeURIComponent(path.slice('/projects/'.length))} />
  if (path.startsWith('/videos/')) return <VideoDetail id={decodeURIComponent(path.slice('/videos/'.length))} />
  return <><Header /><main><HeroSection /><EdgeDivider /><FeaturedWorkSlider /><VideoGalleryFeature /><AboutSection /><ServicesSection /><PortfolioSection /><SkillsSection /><JourneySection /><TestimonialsSection /><EdgeDivider flip /><ContactSection /></main><Footer /><BackToTop /></>
}
