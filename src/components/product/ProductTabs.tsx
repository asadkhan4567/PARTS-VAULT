'use client'

import * as Tabs from '@radix-ui/react-tabs'

export function ProductTabs({ tabs }: { tabs: Array<{ id: string; label: string; content: React.ReactNode }> }) {
  return (
    <Tabs.Root defaultValue={tabs[0]?.id}>
      <Tabs.List className="scrollbar-none flex gap-1 overflow-x-auto border-b" aria-label="Product information">
        {tabs.map((t) => (
          <Tabs.Trigger
            key={t.id}
            value={t.id}
            className="shrink-0 border-b-2 border-transparent px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:border-red-600 data-[state=active]:text-navy-950"
          >
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {tabs.map((t) => (
        <Tabs.Content key={t.id} value={t.id} forceMount className="py-6 data-[state=inactive]:hidden">
          {t.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  )
}
