import { useEffect, useState } from 'react'
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
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<string | null>(null)

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
    await fetchUsers()
  }

  useEffect(() => {
    void fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchUsers() {
    setIsLoading(true)
    try {
      const data = await requestJson<any>('/users')
      if (Array.isArray(data)) setUsers(data)
      else if (Array.isArray(data.payload)) setUsers(data.payload)
      else if (Array.isArray(data.users)) setUsers(data.users)
      else setUsers([])
    } catch (e) {
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  function startEdit(user: any) {
    const id = user.id ?? user.payload?.id ?? user.email
    setEditId(id)
    setEditRole(user.role ?? user.payload?.role ?? 'STUDENT')
  }

  async function saveEdit() {
    if (!editId || !editRole) return
    try {
      await requestJson(`/users/${editId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: editRole }),
      })
      setEditId(null)
      setEditRole(null)
      await fetchUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Create a user via the API.</h2>
          <p className="lede">
            The form sends a user payload to the Better Auth backend and displays
            the raw response.
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
          <p className="eyebrow">New user</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Full name</span>
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
                <span>Role</span>
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
                <span>Password</span>
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
                {isSubmitting ? 'Sending...' : 'Create user'}
              </button>
              <p className="helper-text">The backend returns the full payload for verification.</p>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </article>
        <article className="panel">
          <p className="eyebrow">Users</p>
          {isLoading ? (
            <p className="helper-text">Loading…</p>
          ) : users.length === 0 ? (
            <p className="helper-text">No users found.</p>
          ) : (
            <ul className="list-plain">
              {users.map((u) => {
                const id = u.id ?? u.payload?.id ?? u.email
                return (
                  <li key={id} className="list-item">
                    <div>
                      <strong>{u.name ?? u.payload?.name ?? u.email}</strong>
                      <div className="muted">{u.email ?? u.payload?.email}</div>
                    </div>
                    <div className="list-actions">
                      <button className="button button-ghost" onClick={() => startEdit(u)}>
                        Role
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </article>

        <article className="panel">
          <p className="eyebrow">API response</p>
          {response ? (
            <pre className="response-block">{response}</pre>
          ) : (
            <p className="helper-text">Create a user to display the server response.</p>
          )}
        </article>
      </section>

      {editId ? (
        <section className="panel">
          <p className="eyebrow">Update role</p>
          <div className="form-grid">
            <label className="field">
              <span>Role</span>
              <select value={editRole ?? ''} onChange={(e) => setEditRole(e.target.value)}>
                <option value="STUDENT">Student</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <div className="form-actions">
              <button className="button" onClick={() => void saveEdit()}>
                Save
              </button>
              <button
                className="button button-ghost"
                onClick={() => {
                  setEditId(null)
                  setEditRole(null)
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}