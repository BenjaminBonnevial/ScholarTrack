import { Link } from 'react-router-dom'

export default function NotAuthorizedPage() {
  return (
    <div className="auth-shell auth-shell-simple">
      <section className="auth-card auth-card-wide">
        <p className="muted">403</p>
        <h1>Access denied</h1>
        <p className="helper-text">You do not have permission to access this page. Contact an administrator if you believe this is an error.</p>
        <div style={{ marginTop: 16 }}>
          <Link to="/" className="button">Back to dashboard</Link>
        </div>
      </section>
    </div>
  )
}
