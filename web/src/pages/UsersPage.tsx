import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

const emptyDraft = {
  name: '',
  email: '',
  role: 'STUDENT',
  password: '',
}

export function UsersPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<string | null>(null)

  useEffect(() => {
    void fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await requestJson('/users', { method: 'POST', body: JSON.stringify(draft) })
      setDraft(emptyDraft)
      await fetchUsers()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'User creation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function fetchUsers() {
    setIsLoading(true)
    try {
      const data = await requestJson<any>('/users')
      if (Array.isArray(data)) setUsers(data)
      else if (Array.isArray(data?.items)) setUsers(data.items)
      else setUsers([])
    } catch {
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  function startEdit(user: any) {
    setEditId(user.id)
    setEditRole(user.role ?? 'STUDENT')
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
      <div className="page-header">
        <div>
          <h2 className="page-title">Users</h2>
          <p className="page-subtitle">Create users and manage their roles.</p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /users</span>
          <span className="tag">PATCH /users/:id/role</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <p className="panel-title">New user</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Full name</span>
                <input
                  required
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Role</span>
                <select
                  value={draft.role}
                  onChange={(e) => setDraft({ ...draft, role: e.target.value })}
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
                  minLength={8}
                  value={draft.password}
                  onChange={(e) => setDraft({ ...draft, password: e.target.value })}
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create user'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <p className="panel-title">Users ({users.length})</p>
          {isLoading ? (
            <p className="helper-text">Loading…</p>
          ) : users.length === 0 ? (
            <p className="helper-text">No users yet.</p>
          ) : (
            <ul className="list-plain">
              {users.map((u) => (
                <li key={u.id ?? u.email} className="list-item">
                  <div>
                    <strong>{u.name}</strong>
                    <div className="muted">{u.email} · {u.role}</div>
                  </div>
                  <div className="list-actions">
                    <button className="button button-ghost" onClick={() => startEdit(u)}>
                      Role
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editId && (
        <div className="panel">
          <p className="panel-title">Update role</p>
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
              <button className="button" onClick={() => void saveEdit()}>Save</button>
              <button className="button button-ghost" onClick={() => { setEditId(null); setEditRole(null) }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
