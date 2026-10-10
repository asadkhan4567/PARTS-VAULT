'use client'

import { useRouter } from 'next/navigation'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from 'react'

import { GARAGE_KEY, sameVehicle, serializeVehicle, VEHICLE_COOKIE, type Vehicle, type VehicleTree } from '@/lib/vehicle'

type VehicleCtx = {
  tree: VehicleTree
  vehicle: Vehicle | null
  garage: Vehicle[]
  pending: boolean
  select: (v: Vehicle) => void
  clear: () => void
  remove: (v: Vehicle) => void
  finderOpen: boolean
  openFinder: () => void
  closeFinder: () => void
}

const Ctx = createContext<VehicleCtx | null>(null)

function readGarage(): Vehicle[] {
  try {
    const raw = localStorage.getItem(GARAGE_KEY)
    return raw ? (JSON.parse(raw) as Vehicle[]) : []
  } catch {
    return []
  }
}

function writeCookie(v: Vehicle | null) {
  const maxAge = v ? 60 * 60 * 24 * 365 : 0
  document.cookie = `${VEHICLE_COOKIE}=${v ? serializeVehicle(v) : ''}; path=/; max-age=${maxAge}; samesite=lax`
}

/** Active vehicle lives in a cookie (so pages render "Fits ✓" on the server); the garage in localStorage. */
export function VehicleProvider({ initial, tree, children }: { initial: Vehicle | null; tree: VehicleTree; children: React.ReactNode }) {
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(initial)
  const [garage, setGarage] = useState<Vehicle[]>([])
  const [finderOpen, setFinderOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => setGarage(readGarage()), [])

  const persistGarage = (next: Vehicle[]) => {
    setGarage(next)
    try {
      localStorage.setItem(GARAGE_KEY, JSON.stringify(next))
    } catch {
      // storage unavailable (private mode) — garage just won't persist
    }
  }

  const select = useCallback(
    (v: Vehicle) => {
      setVehicle(v)
      writeCookie(v)
      persistGarage([v, ...readGarage().filter((g) => !sameVehicle(g, v))].slice(0, 6))
      setFinderOpen(false)
      startTransition(() => router.refresh())
    },
    [router],
  )

  const clear = useCallback(() => {
    setVehicle(null)
    writeCookie(null)
    startTransition(() => router.refresh())
  }, [router])

  const remove = useCallback(
    (v: Vehicle) => {
      persistGarage(readGarage().filter((g) => !sameVehicle(g, v)))
      if (vehicle && sameVehicle(vehicle, v)) clear()
    },
    [vehicle, clear],
  )

  const value = useMemo(
    () => ({
      tree,
      vehicle,
      garage,
      pending,
      select,
      clear,
      remove,
      finderOpen,
      openFinder: () => setFinderOpen(true),
      closeFinder: () => setFinderOpen(false),
    }),
    [tree, vehicle, garage, pending, select, clear, remove, finderOpen],
  )
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useVehicle(): VehicleCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useVehicle must be used inside <VehicleProvider>')
  return ctx
}
