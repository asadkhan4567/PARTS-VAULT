import { Logo } from '@/components/brand/Logo'

export default function AdminLogo() {
  return (
    <div className="py-admin-logo">
      <Logo tone="light" className="py-admin-logo__light" />
      <Logo tone="dark" className="py-admin-logo__dark" />
    </div>
  )
}
