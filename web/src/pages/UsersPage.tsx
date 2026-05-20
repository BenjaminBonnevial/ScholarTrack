import { useState } from 'react'
import { requestJson } from '../lib/api'

const emptyDraft = {
  name: 'Nadia Leroy',
  email: 'nadia@school.local',
  role: 'STUDENT',
  password: 'password123',
}

type UserResponse = {
  action: string
  payload: {
    name: string
    email: string
    role: string
    password: string
  }
}

export function UsersPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    setError('')

    try {
      const result = await requestJson<UserResponse>('/users', {
        method: 'POST',
        body: JSON.stringify(draft),
      })

      setResponse(JSON.stringify(result, null, 2))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'User request failed')
    } finally {
      setIsSubmitting(false)
    }

    setDraft(emptyDraft)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Créer un user via l’API.</h2>
          <p className="lede">
            Le formulaire envoie un user conforme au backend Better Auth et affiche la
            réponse brute.
          </p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /users</span>
          <span className="tag">Role enum</span>
          <span className="tag">Password min 8</span>
        </div>
      </section>

      <section className="list-grid">
        <article className="panel">
          <p className="eyebrow">Nouveau user</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Nom complet</span>
                <input
                  required
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Rôle</span>
                <select
                  value={draft.role}
                  onChange={(event) => setDraft({ ...draft, role: event.target.value })}
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </label>

              <label className="field">
                <span>Mot de passe</span>
                <input
                  required
                  type="password"
                  value={draft.password}
                  onChange={(event) => setDraft({ ...draft, password: event.target.value })}
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi...' : 'Créer le user'}
              </button>
              <p className="helper-text">Le backend renvoie la payload complète pour contrôle.</p>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Réponse API</p>
          {response ? (
            <pre className="response-block">{response}</pre>
          ) : (
            <p className="helper-text">Crée un user pour afficher la réponse du serveur.</p>
          )}
        </article>
      </section>
    </div>
  )
}