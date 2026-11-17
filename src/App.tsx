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

export default function App() {
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
