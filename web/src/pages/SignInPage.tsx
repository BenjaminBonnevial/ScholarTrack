import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AuthShell } from '../layout/AuthShell'
import { authClient } from '../lib/auth-client'

export function SignInPage() {
  const [email, setEmail] = useState('admin@scholartrack.local')
  const [password, setPassword] = useState('admin123!')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname?: string } } | undefined)?.from
    ?.pathname ?? '/'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')

    await authClient.signIn.email(
      {
        email,
        password,
      },
      {
        onSuccess: () => {
          navigate(from)
        },
        onError: ({ error: requestError }) => {
          setError(requestError.message)
        },
      },
    )
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

        {error ? <p className="form-error">{error}</p> : null}

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