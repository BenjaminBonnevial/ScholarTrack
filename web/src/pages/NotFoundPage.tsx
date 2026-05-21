import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="auth-shell auth-shell-simple">
      <section className="auth-card auth-card-wide">
        <p className="muted">404</p>
        <h1>Page not found</h1>
        <p className="helper-text">This route does not exist.</p>
        <Link className="button" to="/">Back to dashboard</Link>
      </section>
    </div>
  )
}
