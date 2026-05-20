import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="auth-shell auth-shell-simple">
      <section className="auth-card auth-card-wide">
        <p className="eyebrow">404</p>
        <h1>Page introuvable</h1>
        <p className="lede">
          La route demandée n’existe pas encore. Retourne au dashboard pour continuer le
          test.
        </p>
        <Link className="button" to="/">
          Revenir au dashboard
        </Link>
      </section>
    </div>
  )
}