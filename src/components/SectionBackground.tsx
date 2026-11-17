import { usePublicRows } from '../hooks/usePublicRows'

type SectionKey = 'about' | 'services' | 'portfolio' | 'skills'
type Background = { mode?: string; color?: string; image_url?: string; overlay?: number; red_glow?: number }

export default function SectionBackground({ section }: { section: SectionKey }) {
  const rows = usePublicRows('site_settings')
  const saved = rows.find(row => row.key === 'section_bg_' + section)?.value as Background | undefined
  const mode = saved?.mode === 'image' && saved.image_url ? 'image' : 'color'
  const color = saved?.color || '#050505'
  const overlay = Math.max(0, Math.min(0.9, Number(saved?.overlay ?? 0.12)))
  const glow = Math.max(0, Math.min(0.6, Number(saved?.red_glow ?? 0.12)))
  return <div className="section-custom-background" aria-hidden="true" style={{
    backgroundColor: mode === 'color' ? color : '#050505',
    backgroundImage: mode === 'image'
      ? `linear-gradient(rgba(0,0,0,${overlay}),rgba(0,0,0,${overlay})),radial-gradient(ellipse at 50% 70%,rgba(255,16,26,${glow}),transparent 65%),url("${saved?.image_url}")`
      : `radial-gradient(ellipse at 50% 70%,rgba(255,16,26,${glow}),transparent 65%)`,
    backgroundSize: 'cover', backgroundPosition: 'center',
  }} />
}
