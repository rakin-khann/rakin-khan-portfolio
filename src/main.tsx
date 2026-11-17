import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/anton'
import '@fontsource/rajdhani/400.css'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/rajdhani/700.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/responsive.css'
import App from './App.tsx'
import { ScrollTrigger } from './lib/gsap'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Re-measure pin distances once every asset (fonts/images) has loaded.
window.addEventListener('load', () => ScrollTrigger.refresh())
