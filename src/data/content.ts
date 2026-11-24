/**
 * Single source of truth for every piece of content on the site.
 *
 * NOTE: The professional CV referenced in the brief was not attached and was
 * not found in the connected Google Drive, so all facts below come strictly
 * from the supplied landing-page screenshot. Replace the placeholder social
 * URLs with real profile links when available.
 */

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Video Portfolio', href: '/videos' },
  { label: 'Skills', href: '#skills' },
  { label: 'Contact', href: '#contact' },
] as const

export const PROFILE = {
  name: 'Rakin Khan',
  title: 'Creative Director & Digital Artist',
  tagline: 'Turning Ideas into Impact through Design, Creativity & Innovation.',
  about:
    'A Creative Director & Digital Media Specialist with 7 years of experience in design, video, and digital storytelling. I love turning ideas into powerful visuals and creating meaningful digital experiences.',
  email: 'hello@rakinkhan.com',
  location: 'Dhaka, Bangladesh',
} as const

export const STATS = [
  { value: '7+', label: 'Years Experience', icon: 'trophy' },
  { value: '100+', label: 'Projects Completed', icon: 'briefcase' },
  { value: '50+', label: 'Happy Clients', icon: 'smile' },
] as const

export const SERVICES = [
  {
    name: 'Graphic Design',
    icon: 'pen',
    desc: 'Visual identities, posters and brand artwork with a cinematic edge.',
  },
  {
    name: 'Video Editing',
    icon: 'clapper',
    desc: 'Cinematic cuts, color grading and motion-driven storytelling.',
  },
  {
    name: 'Photography',
    icon: 'camera',
    desc: 'Portraits, products and events captured with dramatic light.',
  },
  {
    name: 'Videography',
    icon: 'video',
    desc: 'On-location production for brands, events and campaigns.',
  },
  {
    name: 'Content Creation',
    icon: 'play',
    desc: 'Scroll-stopping visuals crafted for every platform.',
  },
  {
    name: 'Social Media Management',
    icon: 'chart',
    desc: 'Strategy, scheduling and growth for your channels.',
  },
  {
    name: 'Branding & Strategy',
    icon: 'bulb',
    desc: 'Positioning and identity systems that stand out.',
  },
  {
    name: 'Web Development',
    icon: 'code',
    desc: 'Fast, responsive websites with premium interactions.',
  },
] as const

/** Percentages reproduced from the supplied landing-page screenshot. */
export const SKILLS = [
  { name: 'Design', value: 95 },
  { name: 'Editing', value: 90 },
  { name: 'Development', value: 85 },
  { name: 'Creativity', value: 92 },
] as const

/**
 * Placeholder cards — no real client work is claimed here.
 * Swap `image`, `title` and `category` with real projects later.
 */
export const PROJECTS = [
  {
    title: 'Neon District',
    category: 'Digital Artwork',
    image: '/assets/work-neon.webp',
    placeholder: true,
  },
  {
    title: 'Aura Headphones',
    category: 'Product Visualization',
    image: '/assets/work-headphones.webp',
    placeholder: true,
  },
  {
    title: 'The Adventurer',
    category: '3D Character Art',
    image: '/assets/work-character.webp',
    placeholder: true,
  },
  {
    title: 'Moonfall',
    category: 'Photo Manipulation',
    image: '/assets/work-moon.webp',
    placeholder: true,
  },
] as const

/** Placeholder profile URLs — replace with real handles in one place. */
export const SOCIALS = [
  { label: 'Facebook', icon: 'facebook', href: 'https://www.facebook.com/' },
  { label: 'YouTube', icon: 'youtube', href: 'https://www.youtube.com/' },
  { label: 'Instagram', icon: 'instagram', href: 'https://www.instagram.com/' },
  { label: 'Behance', icon: 'behance', href: 'https://www.behance.net/' },
  { label: 'X', icon: 'x', href: 'https://x.com/' },
] as const
