import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/auth-client'

interface RequireSessionProps {
  children: ReactNode
  allowedRoles?: string[]
}

export function RequireSession({ children, allowedRoles }: RequireSessionProps) {
  const location = useLocation()
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="loading-screen">
        <p className="loading-card">Loading…</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = (session as { role?: string } | null | undefined)?.role ?? null
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/not-authorized" replace />
    }
  }

  return children
}
