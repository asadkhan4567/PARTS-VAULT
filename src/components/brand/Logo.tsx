import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  /** "dark" = white "Parts" for navy backgrounds; "light" = navy "Parts" for white backgrounds. */
  tone?: 'dark' | 'light'
}

/**
 * Default wordmark. The owner can upload a replacement logo in Site Settings; the header renders
 * that image when present and falls back to this component.
 */
export function Logo({ className, tone = 'dark' }: LogoProps) {
  const parts = tone === 'dark' ? '#FFFFFF' : '#0A1A33'
  return (
    <svg
      viewBox="0 0 230 48"
      role="img"
      aria-label="Partsyaar.com"
      className={cn('h-10 w-auto', className)}
    >
      <title>Partsyaar.com</title>
      {/* Shield with a lock wheel: "genuine, locked in" */}
      <path d="M22 3 39 9v13c0 11-7.4 19.3-17 23C12.4 41.3 5 33 5 22V9l17-6Z" fill="#E10600" />
      <circle cx="22" cy="23" r="9.5" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
      <circle cx="22" cy="23" r="2.6" fill="#FFFFFF" />
      <path
        d="M22 13.5v6.9M22 25.6v6.9M12.5 23h6.9M25.6 23h6.9"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="48"
        y="33"
        fontFamily="var(--font-rajdhani), Rajdhani, sans-serif"
        fontWeight="700"
        fontSize="30"
        letterSpacing="0.5"
      >
        <tspan fill={parts}>Parts</tspan>
        <tspan fill="#E10600">Yaar</tspan>
        <tspan fill="#8A97AB" fontSize="16" fontWeight="600">
          .com
        </tspan>
      </text>
    </svg>
  )
}
