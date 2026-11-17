/** Angular red neon separator used between major sections. */
export default function EdgeDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`edge-divider${flip ? ' flip' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 1440 64" preserveAspectRatio="none">
        <path
          className="edge-glow"
          d="M0 8 H 560 L 660 52 H 1440"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
        />
        <path
          d="M0 8 H 560 L 660 52 H 1440"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    </div>
  )
}
