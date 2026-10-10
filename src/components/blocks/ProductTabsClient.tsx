'use client'

import * as Tabs from '@radix-ui/react-tabs'

export function ProductTabsClient({ tabs }: { tabs: Array<{ label: string; content: React.ReactNode }> }) {
  if (!tabs.length) return null
  return (
    <Tabs.Root defaultValue="0">
      <Tabs.List className="scrollbar-none mb-6 flex gap-2 overflow-x-auto" aria-label="Product lists">
        {tabs.map((t, i) => (
          <Tabs.Trigger
            key={t.label}
            value={String(i)}
            className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold text-navy-900 transition-colors data-[state=active]:border-navy-900 data-[state=active]:bg-navy-900 data-[state=active]:text-white"
          >
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((t, i) => (
        <Tabs.Content key={t.label} value={String(i)} className="animate-[py-fade_.3s_ease-out] focus-visible:outline-none">
          {t.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
