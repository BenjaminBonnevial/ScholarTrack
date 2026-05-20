import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthShell } from '../layout/AuthShell'
import { authClient } from '../lib/auth-client'

export function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const { error: signUpError } = await authClient.signUp.email({ name, email, password })
    setLoading(false)
    if (signUpError) {
      setError(signUpError.message ?? 'Sign up failed')
    } else {
      navigate('/', { replace: true })
    }
  }

  return (
    <AuthShell title="Create an account">
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Full name</span>
          <input
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Email</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            required
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="button" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <Link className="button-secondary button" to="/auth/login">
            Already have an account
          </Link>
        </div>
      </form>
    </AuthShell>
  )
}
