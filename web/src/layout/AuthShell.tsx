import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface AuthShellProps {
  title: string
  subtitle: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <Link className="auth-brand" to="/">
          ScholarTrack
        </Link>
        <p className="eyebrow">Espace sécurisé</p>
        <h1>{title}</h1>
        <p className="lede">{subtitle}</p>
        {children}
      </section>

      <aside className="auth-aside">
        <p className="eyebrow eyebrow-inverted">Ce que tu peux tester</p>
        <h2>Un vrai parcours de validation front.</h2>
        <ul className="feature-list">
          <li>Connexion et création de compte.</li>
          <li>Ajout de cours et de users depuis l’admin.</li>
          <li>Pages métiers pour les notes et les présences.</li>
          <li>Navigation persistante pour le QA manuel.</li>
        </ul>
        <Link className="button button-light" to="/">
          Revenir au dashboard
        </Link>
      </aside>
    </div>
  )
}