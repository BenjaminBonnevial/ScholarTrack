import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useSession } from '../lib/auth-client'

interface RequireSessionProps {
  children: ReactNode
}

export function RequireSession({ children }: RequireSessionProps) {
  const location = useLocation()
  const { data: session, isPending } = useSession()

  if (isPending) {
    return (
      <div className="auth-shell auth-shell-simple">
        <section className="auth-card auth-card-wide">
          <p className="eyebrow">Session</p>
          <h1>Chargement de l’authentification...</h1>
          <p className="lede">On vérifie la session avant d’ouvrir le cockpit.</p>
        </section>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />
  }

  return children
}