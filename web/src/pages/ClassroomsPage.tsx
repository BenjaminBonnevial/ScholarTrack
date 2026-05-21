import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

type Semester = { id: string; name: string }
type Student = { id: string; name: string; email: string }
type Course = { id: string; code: string; title: string; teacher: { name: string } }
type Classroom = {
  id: string
  name: string
  description?: string
  semester?: { id: string; name: string } | null
  students?: Student[]
  courses?: Course[]
  _count?: { students: number; courses: number }
}

const emptyDraft = { name: '', description: '', semesterId: '' }

export function ClassroomsPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [editId, setEditId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<typeof emptyDraft | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null)
  const [assignStudentId, setAssignStudentId] = useState('')
  const [classrooms, setClassrooms] = useState<Classroom[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    void fetchClassrooms()
    void requestJson<any>('/semesters').then((d) => setSemesters(Array.isArray(d) ? d : (d?.items ?? [])))
    void requestJson<any>('/users?role=STUDENT&limit=100').then((d) => setAllStudents(Array.isArray(d) ? d : (d?.items ?? [])))
  }, [])

  async function fetchClassrooms() {
    setIsLoading(true)
    try {
      const data = await requestJson<Classroom[]>('/classrooms')
      setClassrooms(Array.isArray(data) ? data : [])
    } catch { setClassrooms([]) } finally { setIsLoading(false) }
  }

  async function fetchSelected(id: string) {
    try {
      const data = await requestJson<Classroom>(`/classrooms/${id}`)
      setSelectedClassroom(data)
    } catch { setSelectedClassroom(null) }
  }

  function openManage(id: string) {
    setSelectedId(id)
    void fetchSelected(id)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true); setError('')
    try {
      await requestJson('/classrooms', {
        method: 'POST',
        body: JSON.stringify({
          name: draft.name,
          ...(draft.description ? { description: draft.description } : {}),
          ...(draft.semesterId ? { semesterId: draft.semesterId } : {}),
        }),
      })
      setDraft(emptyDraft)
      await fetchClassrooms()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Creation failed')
    } finally { setIsSubmitting(false) }
  }

  async function saveEdit() {
    if (!editId || !editDraft) return
    try {
      await requestJson(`/classrooms/${editId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editDraft.name,
          ...(editDraft.description ? { description: editDraft.description } : {}),
          ...(editDraft.semesterId ? { semesterId: editDraft.semesterId } : {}),
        }),
      })
      setEditId(null); setEditDraft(null)
      await fetchClassrooms()
      if (selectedId) await fetchSelected(selectedId)
    } catch (err) { setError(err instanceof Error ? err.message : 'Update failed') }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this classroom? Students will be unassigned.')) return
    try {
      await requestJson(`/classrooms/${id}`, { method: 'DELETE' })
      if (selectedId === id) { setSelectedId(null); setSelectedClassroom(null) }
      await fetchClassrooms()
    } catch (err) { setError(err instanceof Error ? err.message : 'Delete failed') }
  }

  async function handleAssign() {
    if (!selectedId || !assignStudentId) return
    try {
      await requestJson(`/classrooms/${selectedId}/students`, {
        method: 'POST',
        body: JSON.stringify({ studentIds: [assignStudentId] }),
      })
      setAssignStudentId('')
      await fetchSelected(selectedId)
    } catch (err) { setError(err instanceof Error ? err.message : 'Assign failed') }
  }

  async function handleRemoveStudent(studentId: string) {
    if (!selectedId) return
    try {
      await requestJson(`/classrooms/${selectedId}/students/${studentId}`, { method: 'DELETE' })
      await fetchSelected(selectedId)
    } catch (err) { setError(err instanceof Error ? err.message : 'Remove failed') }
  }

  const unassignedStudents = allStudents.filter(
    (s) => !selectedClassroom?.students?.some((cs) => cs.id === s.id)
  )

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Classrooms</h2>
          <p className="page-subtitle">Manage class groups and assign students.</p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /classrooms</span>
          <span className="tag">PATCH /classrooms/:id</span>
          <span className="tag">POST /classrooms/:id/students</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <p className="panel-title">New classroom</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field form-grid-span-2">
                <span>Name</span>
                <input required value={draft.name} placeholder="3A — Science"
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </label>
              <label className="field form-grid-span-2">
                <span>Description (optional)</span>
                <input value={draft.description} placeholder="Third year science track"
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </label>
              <label className="field form-grid-span-2">
                <span>Semester (optional)</span>
                <select value={draft.semesterId} onChange={(e) => setDraft({ ...draft, semesterId: e.target.value })}>
                  <option value="">— None —</option>
                  {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create classroom'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <p className="panel-title">Classrooms ({classrooms.length})</p>
          {isLoading ? (
            <p className="helper-text">Loading…</p>
          ) : classrooms.length === 0 ? (
            <p className="helper-text">No classrooms yet.</p>
          ) : (
            <ul className="list-plain">
              {classrooms.map((c) => (
                <li key={c.id} className="list-item">
                  <div>
                    <strong>{c.name}</strong>
                    {c.semester && <div className="muted">{c.semester.name}</div>}
                    <div className="muted">
                      {c._count?.students ?? 0} students · {c._count?.courses ?? 0} courses
                    </div>
                  </div>
                  <div className="list-actions">
                    <button className="button button-ghost" onClick={() => {
                      setEditId(c.id)
                      setEditDraft({ name: c.name, description: c.description ?? '', semesterId: c.semester?.id ?? '' })
                    }}>Edit</button>
                    <button className="button button-ghost" onClick={() => openManage(c.id)}>Manage</button>
                    <button className="button button-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {editId && editDraft && (
        <div className="panel">
          <p className="panel-title">Edit classroom</p>
          <div className="form-grid">
            <label className="field form-grid-span-2">
              <span>Name</span>
              <input value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} />
            </label>
            <label className="field form-grid-span-2">
              <span>Description</span>
              <input value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} />
            </label>
            <label className="field form-grid-span-2">
              <span>Semester</span>
              <select value={editDraft.semesterId} onChange={(e) => setEditDraft({ ...editDraft, semesterId: e.target.value })}>
                <option value="">— None —</option>
                {semesters.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </label>
            <div className="form-actions form-grid-span-2">
              <button className="button" onClick={() => void saveEdit()}>Save</button>
              <button className="button button-ghost" onClick={() => { setEditId(null); setEditDraft(null) }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedId && selectedClassroom && (
        <div className="panel">
          <p className="panel-title">Manage: {selectedClassroom.name}</p>

          <div className="grid-2" style={{ marginTop: 12 }}>
            <div>
              <p className="panel-title" style={{ fontSize: '0.85rem' }}>
                Students ({selectedClassroom.students?.length ?? 0})
              </p>

              <div className="form-grid" style={{ marginBottom: 12 }}>
                <label className="field form-grid-span-2">
                  <span>Add student</span>
                  <select value={assignStudentId} onChange={(e) => setAssignStudentId(e.target.value)}>
                    <option value="">— Select student —</option>
                    {unassignedStudents.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — {s.email}</option>
                    ))}
                  </select>
                </label>
                <div className="form-actions form-grid-span-2">
                  <button className="button" disabled={!assignStudentId} onClick={() => void handleAssign()}>
                    Assign
                  </button>
                </div>
              </div>

              {selectedClassroom.students?.length === 0 ? (
                <p className="helper-text">No students assigned.</p>
              ) : (
                <ul className="list-plain">
                  {selectedClassroom.students?.map((s) => (
                    <li key={s.id} className="list-item">
                      <div>
                        <strong>{s.name}</strong>
                        <div className="muted">{s.email}</div>
                      </div>
                      <button className="button button-danger" style={{ fontSize: '0.75rem' }}
                        onClick={() => void handleRemoveStudent(s.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <p className="panel-title" style={{ fontSize: '0.85rem' }}>
                Courses ({selectedClassroom.courses?.length ?? 0})
              </p>
              {selectedClassroom.courses?.length === 0 ? (
                <p className="helper-text">No courses assigned to this classroom. Assign a course via the Courses page.</p>
              ) : (
                <ul className="list-plain">
                  {selectedClassroom.courses?.map((c) => (
                    <li key={c.id} className="list-item">
                      <div>
                        <strong>{c.code}</strong>
                        <div className="muted">{c.title}</div>
                        <div className="muted">{c.teacher?.name}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
