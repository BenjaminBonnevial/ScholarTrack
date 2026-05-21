import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

type Semester = {
  id: string
  name: string
  startDate: string
  endDate: string
}

const emptyDraft = { name: '', startDate: '', endDate: '' }

export function SemestersPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [editId, setEditId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<typeof emptyDraft | null>(null)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => { void fetchSemesters() }, [])

  async function fetchSemesters() {
    setIsLoading(true)
    try {
      const data = await requestJson<any>('/semesters')
      setSemesters(Array.isArray(data) ? data : (data?.items ?? []))
    } catch {
      setSemesters([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await requestJson('/semesters', {
        method: 'POST',
        body: JSON.stringify(draft),
      })
      setDraft(emptyDraft)
      await fetchSemesters()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Semester creation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  function startEdit(s: Semester) {
    setEditId(s.id)
    setEditDraft({
      name: s.name,
      startDate: s.startDate.slice(0, 10),
      endDate: s.endDate.slice(0, 10),
    })
  }

  async function saveEdit() {
    if (!editId || !editDraft) return
    try {
      await requestJson(`/semesters/${editId}`, {
        method: 'PATCH',
        body: JSON.stringify(editDraft),
      })
      setEditId(null)
      setEditDraft(null)
      await fetchSemesters()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this semester?')) return
    try {
      await requestJson(`/semesters/${id}`, { method: 'DELETE' })
      await fetchSemesters()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Semesters</h2>
          <p className="page-subtitle">Manage academic semesters.</p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /semesters</span>
          <span className="tag">PATCH /semesters/:id</span>
          <span className="tag">DELETE /semesters/:id</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <p className="panel-title">New semester</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field form-grid-span-2">
                <span>Name</span>
                <input
                  required
                  value={draft.name}
                  placeholder="Fall 2026"
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Start date</span>
                <input
                  required
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
                />
              </label>

              <label className="field">
                <span>End date</span>
                <input
                  required
                  type="date"
                  value={draft.endDate}
                  onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create semester'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <p className="panel-title">Semesters ({semesters.length})</p>
          {isLoading ? (
            <p className="helper-text">Loading…</p>
          ) : semesters.length === 0 ? (
            <p className="helper-text">No semesters yet.</p>
          ) : (
            <ul className="list-plain">
              {semesters.map((s) => (
                <li key={s.id} className="list-item">
                  <div>
                    <strong>{s.name}</strong>
                    <div className="muted">
                      {new Date(s.startDate).toLocaleDateString()} →{' '}
                      {new Date(s.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="list-actions">
                    <button className="button button-ghost" onClick={() => startEdit(s)}>
                      Edit
                    </button>
                    <button className="button button-danger" onClick={() => handleDelete(s.id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editId && editDraft && (
        <div className="panel">
          <p className="panel-title">Edit semester</p>
          <div className="form-grid">
            <label className="field form-grid-span-2">
              <span>Name</span>
              <input
                value={editDraft.name}
                onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Start date</span>
              <input
                type="date"
                value={editDraft.startDate}
                onChange={(e) => setEditDraft({ ...editDraft, startDate: e.target.value })}
              />
            </label>
            <label className="field">
              <span>End date</span>
              <input
                type="date"
                value={editDraft.endDate}
                onChange={(e) => setEditDraft({ ...editDraft, endDate: e.target.value })}
              />
            </label>
            <div className="form-actions form-grid-span-2">
              <button className="button" onClick={() => void saveEdit()}>Save</button>
              <button className="button button-ghost" onClick={() => { setEditId(null); setEditDraft(null) }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
