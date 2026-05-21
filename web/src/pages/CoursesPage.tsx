import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

type Semester = { id: string; name: string }
type Teacher = { id: string; name: string; email: string }
type Classroom = { id: string; name: string }

const emptyDraft = {
  code: '',
  title: '',
  description: '',
  capacity: '30',
  teacherId: '',
  semesterId: '',
  classroomId: '',
}

export function CoursesPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<any | null>(null)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classrooms, setClassrooms] = useState<Classroom[]>([])

  useEffect(() => {
    void fetchCourses()
    void requestJson<any>('/semesters').then((d) => {
      setSemesters(Array.isArray(d) ? d : (d?.items ?? []))
    })
    void requestJson<any>('/users?role=TEACHER&limit=100').then((d) => {
      setTeachers(Array.isArray(d) ? d : (d?.items ?? []))
    })
    void requestJson<any>('/classrooms').then((d) => {
      setClassrooms(Array.isArray(d) ? d : [])
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await requestJson<any>('/courses', {
        method: 'POST',
        body: JSON.stringify({
          code: draft.code,
          title: draft.title,
          description: draft.description || undefined,
          capacity: Number(draft.capacity),
          teacherId: draft.teacherId || undefined,
          semesterId: draft.semesterId,
          classroomId: draft.classroomId || undefined,
        }),
      })
      setDraft(emptyDraft)
      await fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Course creation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function fetchCourses() {
    setIsLoading(true)
    try {
      const data = await requestJson<any>('/courses')
      setCourses(Array.isArray(data) ? data : (data?.items ?? []))
    } catch {
      setCourses([])
    } finally {
      setIsLoading(false)
    }
  }

  function startEdit(course: any) {
    setEditId(course.id)
    setEditDraft({
      code: course.code ?? '',
      title: course.title ?? '',
      description: course.description ?? '',
      capacity: String(course.capacity ?? ''),
      classroomId: course.classroom?.id ?? '',
    })
  }

  async function saveEdit() {
    if (!editId || !editDraft) return
    try {
      await requestJson(`/courses/${editId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          code: editDraft.code,
          title: editDraft.title,
          description: editDraft.description || undefined,
          capacity: Number(editDraft.capacity),
          classroomId: editDraft.classroomId || undefined,
        }),
      })
      setEditId(null)
      setEditDraft(null)
      await fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this course?')) return
    try {
      await requestJson(`/courses/${id}`, { method: 'DELETE' })
      await fetchCourses()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Courses</h2>
          <p className="page-subtitle">Create, edit and delete courses.</p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /courses</span>
          <span className="tag">PATCH /courses/:id</span>
          <span className="tag">DELETE /courses/:id</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <p className="panel-title">New course</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Code</span>
                <input
                  required
                  value={draft.code}
                  placeholder="MATH101"
                  onChange={(e) => setDraft({ ...draft, code: e.target.value.toUpperCase() })}
                />
              </label>

              <label className="field">
                <span>Title</span>
                <input
                  required
                  value={draft.title}
                  placeholder="Applied Mathematics"
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </label>

              <label className="field form-grid-span-2">
                <span>Description</span>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Capacity</span>
                <input
                  required
                  type="number"
                  min="1"
                  value={draft.capacity}
                  onChange={(e) => setDraft({ ...draft, capacity: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Semester</span>
                <select
                  required
                  value={draft.semesterId}
                  onChange={(e) => setDraft({ ...draft, semesterId: e.target.value })}
                >
                  <option value="">— Select —</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Teacher (optional)</span>
                <select
                  value={draft.teacherId}
                  onChange={(e) => setDraft({ ...draft, teacherId: e.target.value })}
                >
                  <option value="">— Assign automatically —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.email}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Classroom (optional)</span>
                <select
                  value={draft.classroomId}
                  onChange={(e) => setDraft({ ...draft, classroomId: e.target.value })}
                >
                  <option value="">— None —</option>
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create course'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <p className="panel-title">Courses ({courses.length})</p>
          {isLoading ? (
            <p className="helper-text">Loading…</p>
          ) : courses.length === 0 ? (
            <p className="helper-text">No courses yet.</p>
          ) : (
            <ul className="list-plain">
              {courses.map((c) => (
                <li key={c.id} className="list-item">
                  <div>
                    <strong>{c.title}</strong>
                    <div className="muted">
                      {c.code} · {c.semester?.name ?? '—'}
                      {c.classroom ? ` · ${c.classroom.name}` : ''}
                      {c._count?.enrollments != null
                        ? ` · ${c._count.enrollments}/${c.capacity} enrolled`
                        : ''}
                    </div>
                  </div>
                  <div className="list-actions">
                    <button className="button button-ghost" onClick={() => startEdit(c)}>
                      Edit
                    </button>
                    <button className="button button-danger" onClick={() => handleDelete(c.id)}>
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
          <p className="panel-title">Edit course</p>
          <div className="form-grid">
            <label className="field">
              <span>Code</span>
              <input
                value={editDraft.code}
                onChange={(e) => setEditDraft({ ...editDraft, code: e.target.value.toUpperCase() })}
              />
            </label>
            <label className="field">
              <span>Title</span>
              <input
                value={editDraft.title}
                onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })}
              />
            </label>
            <label className="field form-grid-span-2">
              <span>Description</span>
              <textarea
                value={editDraft.description}
                onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Capacity</span>
              <input
                type="number"
                min="1"
                value={editDraft.capacity}
                onChange={(e) => setEditDraft({ ...editDraft, capacity: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Classroom</span>
              <select
                value={editDraft.classroomId ?? ''}
                onChange={(e) => setEditDraft({ ...editDraft, classroomId: e.target.value })}
              >
                <option value="">— None —</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
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
