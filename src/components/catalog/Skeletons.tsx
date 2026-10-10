export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4" aria-busy aria-label="Loading parts">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-brand border bg-white">
          <div className="aspect-square skeleton" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-1/3 rounded skeleton" />
            <div className="h-5 w-4/5 rounded skeleton" />
            <div className="h-3 w-1/2 rounded skeleton" />
            <div className="h-10 rounded-lg skeleton" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Full-height so the footer never flashes into view and then jumps (CLS). */
export function PageSkeleton() {
  return (
    <div className="min-h-[110vh]">
      <div className="bg-navy-900">
        <div className="container-py space-y-3 py-10">
          <div className="h-3 w-40 rounded bg-navy-700" />
          <div className="h-10 w-2/3 max-w-lg rounded bg-navy-700" />
        </div>
      </div>
      <div className="container-py py-8">
        <GridSkeleton />
      </div>
    </div>
  )
}
