import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../layout/AuthShell'
import { authClient } from '../lib/auth-client'

export function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')

    await authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onSuccess: () => {
          navigate('/')
        },
        onError: ({ error: requestError }) => {
          setError(requestError.message)
        },
      },
    )
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Prépare un user de test avant de passer à l’auth réelle et aux rôles."
    >
      <form className="form-stack auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Nom</span>
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label className="field">
          <span>Email</span>
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>

        <label className="field">
          <span>Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="form-actions">
          <button className="button" type="submit">
            Créer le compte
          </button>
          <Link className="button button-secondary" to="/auth/login">
            J’ai déjà un compte
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}