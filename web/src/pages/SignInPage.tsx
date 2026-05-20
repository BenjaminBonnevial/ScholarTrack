import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthShell } from '../layout/AuthShell'

export function SignInPage() {
  const [email, setEmail] = useState('admin@scholartrack.local')
  const [password, setPassword] = useState('admin123!')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <AuthShell
      title="Se connecter"
      subtitle="Ouvre le cockpit pour tester les pages admin, les listes et les formulaires métier."
    >
      <form className="form-stack auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </label>

        <label className="field">
          <span>Mot de passe</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </label>

        <div className="form-actions">
          <button className="button" type="submit">
            Se connecter
          </button>
          <Link className="button button-secondary" to="/auth/register">
            Créer un compte
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}