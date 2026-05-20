import { useState } from 'react'

type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
}

const initialUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alice Bernard',
    email: 'alice@school.local',
    role: 'ADMIN',
    status: 'Actif',
  },
  {
    id: 'user-2',
    name: 'Yanis Morel',
    email: 'yanis@school.local',
    role: 'TEACHER',
    status: 'Invité',
  },
]

const emptyDraft = {
  name: '',
  email: '',
  role: 'STUDENT',
  status: 'Actif',
}

export function UsersPage() {
  const [users, setUsers] = useState(initialUsers)
  const [draft, setDraft] = useState(emptyDraft)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setUsers((currentUsers) => [
      ...currentUsers,
      {
        id: `user-${Date.now()}`,
        ...draft,
      },
    ])
    setDraft(emptyDraft)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Créer des users et vérifier les rôles.</h2>
          <p className="lede">
            L’admin peut simuler l’onboarding d’un user avant de brancher le backend.
          </p>
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
                  placeholder="Nadia Leroy"
                />
              </label>

              <label className="field">
                <span>Email</span>
                <input
                  required
                  type="email"
                  value={draft.email}
                  onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                  placeholder="nadia@school.local"
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
                <span>Statut</span>
                <select
                  value={draft.status}
                  onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                >
                  <option value="Actif">Actif</option>
                  <option value="Invité">Invité</option>
                  <option value="Suspendu">Suspendu</option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit">
                Créer le user
              </button>
              <p className="helper-text">Le QA peut vérifier les permissions à partir d’ici.</p>
            </div>
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Répertoire</p>
          <div className="record-list">
            {users.map((user) => (
              <div key={user.id} className="record-item">
                <div>
                  <p className="record-title">{user.name}</p>
                  <p className="record-meta">
                    {user.email} · {user.status}
                  </p>
                </div>
                <div className="record-side">
                  <span className="tag">{user.role}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}