import Link from 'next/link'

import { cn } from '@/lib/utils'

export function Section({ children, className, tone = 'light', id, ...rest }: { children: React.ReactNode; className?: string; tone?: 'light' | 'muted' | 'navy'; id?: string } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      id={id}
      className={cn('py-12 md:py-16', tone === 'muted' && 'bg-navy-100/60', tone === 'navy' && 'bg-navy-950 text-white', className)}
      {...rest}
    >
      <div className="container-py">{children}</div>
    </section>
  )
}

export function SectionHeading({ title, subtitle, href, linkLabel = 'View all', tone = 'light' }: { title?: string | null; subtitle?: string | null; href?: string; linkLabel?: string; tone?: 'light' | 'navy' }) {
  if (!title) return null
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8">
      <div>
        <h2 className={cn('text-3xl md:text-4xl', tone === 'navy' ? 'text-white' : 'text-navy-950')} data-reveal>
          {title}
        </h2>
        {subtitle ? <p className={cn('mt-1', tone === 'navy' ? 'text-steel-400' : 'text-muted-foreground')}>{subtitle}</p> : null}
        <span className="mt-3 block h-1 w-14 rounded-full bg-red-600" aria-hidden />
      </div>
      {href ? (
        <Link href={href} className={cn('text-sm font-semibold hover:underline', tone === 'navy' ? 'text-white' : 'text-navy-500')}>
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  )
}
