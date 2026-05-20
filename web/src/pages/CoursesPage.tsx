import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

const emptyDraft = {
  code: 'SCI-101',
  title: 'Sciences appliquées',
  description: 'Cours de démonstration pour le flux admin.',
  capacity: '30',
  teacherId: '11111111-1111-1111-1111-111111111111',
  semesterId: '22222222-2222-2222-2222-222222222222',
}

type CourseResponse = {
  action: string
  payload: {
    code: string
    title: string
    description?: string
    capacity: number
    teacherId: string
    semesterId: string
  }
}

export function CoursesPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<any | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    setError('')

    try {
      const result = await requestJson<CourseResponse>('/courses', {
        method: 'POST',
        body: JSON.stringify({
          code: draft.code,
          title: draft.title,
          description: draft.description,
          capacity: Number(draft.capacity),
          teacherId: draft.teacherId,
          semesterId: draft.semesterId,
        }),
      })

      setResponse(JSON.stringify(result, null, 2))
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Course request failed',
      )
    } finally {
      setIsSubmitting(false)
    }

    setDraft(emptyDraft)
    await fetchCourses()
  }

  useEffect(() => {
    void fetchCourses()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchCourses() {
    setIsLoading(true)
    try {
      const data = await requestJson<any>('/courses')
      if (Array.isArray(data)) setCourses(data)
      else if (Array.isArray(data.payload)) setCourses(data.payload)
      else if (Array.isArray(data.courses)) setCourses(data.courses)
      else setCourses([])
    } catch (err) {
      // ignore for now
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  async function startEdit(course: any) {
    setEditId(course.id ?? course.payload?.id ?? null)
    setEditDraft({
      code: course.code ?? course.payload?.code,
      title: course.title ?? course.payload?.title,
      description: course.description ?? course.payload?.description,
      capacity: String(course.capacity ?? course.payload?.capacity ?? ''),
      teacherId: course.teacherId ?? course.payload?.teacherId,
      semesterId: course.semesterId ?? course.payload?.semesterId,
    })
  }

  async function saveEdit() {
    if (!editId || !editDraft) return
    try {
      await requestJson(`/courses/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({
          code: editDraft.code,
          title: editDraft.title,
          description: editDraft.description,
          capacity: Number(editDraft.capacity),
          teacherId: editDraft.teacherId,
          semesterId: editDraft.semesterId,
        }),
      })
      setEditId(null)
      setEditDraft(null)
      await fetchCourses()
    } catch (e) {
      // show error inline
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce cours ?')) return
    try {
      await requestJson(`/courses/${id}`, { method: 'DELETE' })
      await fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Créer un cours via l’API.</h2>
          <p className="lede">
            Les champs attendus par le backend sont préremplis avec des UUID de test pour
            éviter de retomber sur Postman.
          </p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /courses</span>
          <span className="tag">UUID teacher</span>
          <span className="tag">UUID semester</span>
        </div>
      </section>

      <section className="list-grid">
        <article className="panel">
          <p className="eyebrow">Nouveau cours</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Code</span>
                <input
                  required
                  value={draft.code}
                  onChange={(event) =>
                    setDraft({ ...draft, code: event.target.value.toUpperCase() })
                  }
                />
              </label>

              <label className="field">
                <span>Intitulé</span>
                <input
                  required
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                />
              </label>

              <label className="field form-grid-span-2">
                <span>Description</span>
                <textarea
                  value={draft.description}
                  onChange={(event) =>
                    setDraft({ ...draft, description: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>Capacité</span>
                <input
                  required
                  type="number"
                  min="1"
                  value={draft.capacity}
                  onChange={(event) => setDraft({ ...draft, capacity: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Teacher ID</span>
                <input
                  required
                  value={draft.teacherId}
                  onChange={(event) => setDraft({ ...draft, teacherId: event.target.value })}
                />
              </label>

              <label className="field form-grid-span-2">
                <span>Semester ID</span>
                <input
                  required
                  value={draft.semesterId}
                  onChange={(event) =>
                    setDraft({ ...draft, semesterId: event.target.value })
                  }
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi...' : 'Créer le cours'}
              </button>
              <p className="helper-text">Le backend renvoie la payload complète pour contrôle.</p>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </article>
        <article className="panel">
          <p className="eyebrow">Cours existants</p>
          {isLoading ? (
            <p className="helper-text">Chargement…</p>
          ) : courses.length === 0 ? (
            <p className="helper-text">Aucun cours récupéré.</p>
          ) : (
            <ul className="list-plain">
              {courses.map((c) => {
                const id = c.id ?? c.payload?.id ?? c.code
                return (
                  <li key={id} className="list-item">
                    <div>
                      <strong>{c.title ?? c.payload?.title ?? c.code}</strong>
                      <div className="muted">{c.code ?? c.payload?.code}</div>
                    </div>
                    <div className="list-actions">
                      <button className="button button-ghost" onClick={() => startEdit(c)}>
                        Éditer
                      </button>
                      <button
                        className="button button-danger"
                        onClick={() => handleDelete(id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </article>

        <article className="panel">
          <p className="eyebrow">Réponse API</p>
          {response ? (
            <pre className="response-block">{response}</pre>
          ) : (
            <p className="helper-text">Crée un cours pour afficher la réponse du serveur.</p>
          )}
        </article>
      </section>

      {editId && editDraft ? (
        <section className="panel">
          <p className="eyebrow">Édition</p>
          <div className="form-grid">
            <label className="field">
              <span>Code</span>
              <input value={editDraft.code} onChange={(e) => setEditDraft({ ...editDraft, code: e.target.value.toUpperCase() })} />
            </label>
            <label className="field">
              <span>Intitulé</span>
              <input value={editDraft.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} />
            </label>
            <label className="field form-grid-span-2">
              <span>Description</span>
              <textarea value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} />
            </label>
            <div className="form-actions">
              <button className="button" onClick={() => void saveEdit()}>
                Enregistrer
              </button>
              <button className="button button-ghost" onClick={() => { setEditId(null); setEditDraft(null) }}>
                Annuler
              </button>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}