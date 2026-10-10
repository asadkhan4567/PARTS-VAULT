'use client'

import { Canvas, extend, useFrame, type ThreeElement } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// three's own rounded box (drei pulls in three-stdlib, which blows the 200 KB 3D budget).
extend({ RoundedBoxGeometry })
declare module '@react-three/fiber' {
  interface ThreeElements {
    roundedBoxGeometry: ThreeElement<typeof RoundedBoxGeometry>
  }
}

import { ScrollTrigger } from '@/lib/gsap'

type V3 = [number, number, number]
type PartDef = { id: string; home: V3; out: V3; spin?: V3; node: React.ReactNode }

const NAVY = '#12305C'
const NAVY_DARK = '#0A1A33'
const RED = '#E10600'
const STEEL = '#B8C2D1'

const metal = <meshStandardMaterial color={STEEL} metalness={0.9} roughness={0.25} />
const red = <meshStandardMaterial color={RED} metalness={0.3} roughness={0.35} emissive={RED} emissiveIntensity={0.15} />

function Wheel({ position }: { position: V3 }) {
  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <meshStandardMaterial color="#05080f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.02, 24]} />
        {metal}
      </mesh>
    </group>
  )
}

/** Parts that fly out of the car as the hero scrolls. */
const PARTS: PartDef[] = [
  {
    id: 'brake-disc',
    home: [1.3, 0.4, 1.06],
    out: [2.7, 1.7, 2.1],
    spin: [0, 0, 1],
    node: (
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.32, 0.32, 0.05, 40]} />
          {metal}
        </mesh>
        <mesh position={[0.2, 0.05, 0]}>
          <boxGeometry args={[0.16, 0.1, 0.26]} />
          {red}
        </mesh>
      </group>
    ),
  },
  {
    id: 'oil-filter',
    home: [1.2, 0.75, -0.2],
    out: [0.6, 2.7, -1.7],
    spin: [0, 1, 0],
    node: (
      <group>
        <mesh>
          <cylinderGeometry args={[0.16, 0.16, 0.32, 28]} />
          <meshStandardMaterial color={NAVY} metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.17, 0.17, 0.05, 28]} />
          {red}
        </mesh>
      </group>
    ),
  },
  {
    id: 'headlight',
    home: [2.02, 0.68, 0.58],
    out: [3.5, 1.3, 1.0],
    node: (
      <mesh>
        <boxGeometry args={[0.08, 0.16, 0.42]} />
        <meshStandardMaterial color="#ffffff" emissive="#dfe9ff" emissiveIntensity={1.4} />
      </mesh>
    ),
  },
  {
    id: 'spark-plug',
    home: [0.9, 0.95, 0.15],
    out: [1.4, 3.0, 0.9],
    spin: [1, 0, 0],
    node: (
      <group>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.34, 16]} />
          <meshStandardMaterial color="#f4f6fa" roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.1, 6]} />
          {metal}
        </mesh>
      </group>
    ),
  },
  {
    id: 'shock',
    home: [-1.3, 0.75, 0.9],
    out: [-2.8, 1.9, 2.0],
    spin: [0, 1, 0],
    node: (
      <group>
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.6, 16]} />
          {metal}
        </mesh>
        {[-0.2, -0.1, 0, 0.1, 0.2].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.025, 8, 24]} />
            {red}
          </mesh>
        ))}
      </group>
    ),
  },
  {
    id: 'battery',
    home: [1.5, 0.78, -0.55],
    out: [2.5, 2.3, -2.3],
    spin: [0, 1, 0],
    node: (
      <group>
        <mesh>
          <boxGeometry args={[0.42, 0.28, 0.3]} />
          <meshStandardMaterial color={NAVY_DARK} roughness={0.5} />
        </mesh>
        <mesh position={[0.12, 0.17, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.06, 12]} />
          {red}
        </mesh>
      </group>
    ),
  },
]

function Scene({ progress, pointer }: { progress: React.RefObject<number>; pointer: React.RefObject<{ x: number; y: number }> }) {
  const root = useRef<THREE.Group>(null)
  const hood = useRef<THREE.Mesh>(null)
  const partRefs = useRef<Array<THREE.Group | null>>([])
  const vecs = useMemo(() => PARTS.map((p) => ({ home: new THREE.Vector3(...p.home), out: new THREE.Vector3(...p.out) })), [])
  const eased = useRef(0)

  useFrame((state, delta) => {
    // Ease toward the scroll progress so the explode feels physical, and snaps back smoothly.
    eased.current = THREE.MathUtils.damp(eased.current, progress.current ?? 0, 6, delta)
    const t = eased.current
    const g = root.current
    if (g) {
      g.rotation.y = -0.6 + state.clock.elapsedTime * 0.12 + t * 0.8 + (pointer.current?.x ?? 0) * 0.25
      g.rotation.x = 0.08 + (pointer.current?.y ?? 0) * 0.08
      g.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.04
    }
    if (hood.current) hood.current.position.y = 0.83 + t * 0.9
    partRefs.current.forEach((ref, i) => {
      if (!ref) return
      ref.position.lerpVectors(vecs[i].home, vecs[i].out, t)
      const s = PARTS[i].spin
      if (s) {
        ref.rotation.x = s[0] * t * Math.PI
        ref.rotation.y = s[1] * t * Math.PI * 1.5
        ref.rotation.z = s[2] * t * Math.PI
      }
      ref.scale.setScalar(1 + t * 0.6)
    })
  })

  return (
    <group ref={root} scale={0.95}>
      {/* Body */}
      <mesh position={[0, 0.58, 0]}>
        <roundedBoxGeometry args={[4.1, 0.62, 1.9, 4, 0.22]} />
        <meshStandardMaterial color={NAVY} metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[-0.35, 1.12, 0]}>
        <roundedBoxGeometry args={[2.1, 0.55, 1.62, 4, 0.24]} />
        <meshStandardMaterial color="#0d2142" metalness={0.5} roughness={0.15} transparent opacity={0.92} />
      </mesh>
      <mesh ref={hood} position={[1.35, 0.83, 0]}>
        <boxGeometry args={[1.2, 0.05, 1.7]} />
        <meshStandardMaterial color={NAVY} metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Red light line */}
      <mesh position={[-2.06, 0.7, 0]}>
        <boxGeometry args={[0.04, 0.08, 1.6]} />
        <meshStandardMaterial color={RED} emissive={RED} emissiveIntensity={2} />
      </mesh>
      <Wheel position={[1.3, 0.4, 0.92]} />
      <Wheel position={[1.3, 0.4, -0.92]} />
      <Wheel position={[-1.3, 0.4, 0.92]} />
      <Wheel position={[-1.3, 0.4, -0.92]} />
      {PARTS.map((p, i) => (
        <group key={p.id} ref={(el) => void (partRefs.current[i] = el)} position={p.home}>
          {p.node}
        </group>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <circleGeometry args={[2.6, 48]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>
    </group>
  )
}

/** Desktop-only R3F hero. Pins the hero briefly while the parts explode out and back. */
export default function HeroCar() {
  const wrap = useRef<HTMLDivElement>(null)
  const progress = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hero = wrap.current?.closest<HTMLElement>('[data-hero]')
    if (!hero) return
    // 0 → 1 → 0 over the pinned distance: parts float out, then snap back.
    const st = ScrollTrigger.create({
      trigger: hero,
      // Pin just below the sticky header.
      start: () => `top ${document.querySelector('header')?.getBoundingClientRect().height ?? 0}px`,
      end: '+=80%',
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        progress.current = Math.sin(self.progress * Math.PI)
      },
    })
    ScrollTrigger.refresh()
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 }
    }
    hero.addEventListener('pointermove', onMove)
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(hero)
    return () => {
      st.kill()
      hero.removeEventListener('pointermove', onMove)
      io.disconnect()
    }
  }, [])

  return (
    <div ref={wrap} className="h-full w-full">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [6.4, 3.1, 6.4], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => camera.lookAt(0.2, 1.2, 0)}
        aria-label="3D car exploding into its parts"
        role="img"
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 6, 4]} intensity={2.2} />
        <directionalLight position={[-6, 3, -3]} intensity={0.6} color="#8fb3ff" />
        <pointLight position={[-3, 1, 2]} intensity={14} color={RED} distance={8} />
        <Scene progress={progress} pointer={pointer} />
      </Canvas>
    </div>
  )
}
