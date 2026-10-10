export default function Loading() {
  return (
    <div className="container-py grid gap-8 py-10 lg:grid-cols-2" aria-busy aria-label="Loading product">
      <div className="aspect-square rounded-2xl skeleton" />
      <div className="space-y-4">
        <div className="h-4 w-24 rounded skeleton" />
        <div className="h-10 w-4/5 rounded skeleton" />
        <div className="h-4 w-1/2 rounded skeleton" />
        <div className="h-12 w-40 rounded skeleton" />
        <div className="h-24 rounded-brand skeleton" />
        <div className="h-13 rounded-lg skeleton" />
        <div className="h-13 rounded-lg skeleton" />
      </div>
    </div>
  )
}
