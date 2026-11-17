import type { ReactElement, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function base(props: IconProps): IconProps {
  return {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    focusable: false,
    ...props,
  }
}

/* ---------- UI ---------- */

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

export const IconArrowUp = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19V5" />
    <path d="m6 11 6-6 6 6" />
  </svg>
)

export const IconMenu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </svg>
)

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
)

export const IconMail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 6L2 7" />
  </svg>
)

export const IconMapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

/* ---------- Social ---------- */

export const IconFacebook = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

export const IconYouTube = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-2C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.95 2c1.71.46 8.59.46 8.59.46s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <path d="m9.75 15.02 5.75-3.27-5.75-3.27v6.54z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconInstagram = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <path d="M16 11.37a4 4 0 1 1-7.75 1.26A4 4 0 0 1 16 11.37z" />
    <path d="M17.5 6.5h.01" />
  </svg>
)

export const IconBehance = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 5.5h4.2a2.9 2.9 0 0 1 0 5.8H3z" />
    <path d="M3 11.3h4.8a3.1 3.1 0 1 1 0 6.2H3z" />
    <path d="M14.5 7h5" />
    <path d="M21.8 14.6a3.6 3.6 0 1 0-7.2 0 3.6 3.6 0 0 0 7.2 0z" />
    <path d="M14.6 14.6h7.2" />
  </svg>
)

export const IconX = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4l16 16" />
    <path d="M20 4 4 20" />
  </svg>
)

/* ---------- Stats ---------- */

export const IconTrophy = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5C3 9.5 4.6 11 7 11.2" />
    <path d="M17 6h2.5A1.5 1.5 0 0 1 21 7.5C21 9.5 19.4 11 17 11.2" />
  </svg>
)

export const IconBriefcase = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
)

export const IconSmile = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14s1.4 2 3.5 2 3.5-2 3.5-2" />
    <path d="M9 9.5h.01" />
    <path d="M15 9.5h.01" />
  </svg>
)

/* ---------- Services ---------- */

export const IconPen = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 19 7-7 3 3-7 7-3-3z" />
    <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="m2 2 7.586 7.586" />
    <circle cx="11" cy="11" r="2" />
  </svg>
)

export const IconClapper = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3l.8 2.6z" />
    <path d="m6.2 5.3 3.1 3.9" />
    <path d="m12.4 3.4 3.1 4" />
    <path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8z" />
  </svg>
)

export const IconCamera = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
)

export const IconVideo = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="1" y="5" width="15" height="14" rx="2" />
    <path d="m23 7-7 5 7 5V7z" />
  </svg>
)

export const IconPlay = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="4" width="20" height="16" rx="4" />
    <path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconChart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </svg>
)

export const IconBulb = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 18h6" />
    <path d="M10 21h4" />
    <path d="M12 3a6 6 0 0 0-4 10.5c.8.7 1 1.5 1 2.5h6c0-1 .2-1.8 1-2.5A6 6 0 0 0 12 3z" />
  </svg>
)

export const IconCode = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m16 18 6-6-6-6" />
    <path d="m8 6-6 6 6 6" />
  </svg>
)

/* ---------- Lookup helpers ---------- */

const ICONS: Record<string, (p: IconProps) => ReactElement> = {
  facebook: IconFacebook,
  youtube: IconYouTube,
  instagram: IconInstagram,
  behance: IconBehance,
  x: IconX,
  trophy: IconTrophy,
  briefcase: IconBriefcase,
  smile: IconSmile,
  pen: IconPen,
  clapper: IconClapper,
  camera: IconCamera,
  video: IconVideo,
  play: IconPlay,
  chart: IconChart,
  bulb: IconBulb,
  code: IconCode,
}

export function SiteIcon({ name, ...rest }: { name: string } & IconProps) {
  const Cmp = ICONS[name] ?? IconBulb
  return <Cmp {...rest} />
}
