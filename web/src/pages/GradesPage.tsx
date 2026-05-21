import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

type Course = { id: string; code: string; title: string }
type Student = { id: string; name: string; email: string }
type Grade = {
  id: string
  score: number
  evaluationType: string
  weightedAverage: number | null
  course: { code: string; title: string }
  student: { name: string; email: string }
}

const emptyDraft = {
  courseId: '',
  studentId: '',
  evaluationType: 'EXAM',
  score: '',
}

export function GradesPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [grades, setGrades] = useState<Grade[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])

  useEffect(() => {
    void fetchGrades()
    void requestJson<any>('/courses').then((d) => {
      const list = Array.isArray(d) ? d : (d?.items ?? [])
      setCourses(list)
    })
    void requestJson<any>('/users?role=STUDENT&limit=100').then((d) => {
      const list = Array.isArray(d) ? d : (d?.items ?? [])
      setStudents(list)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchGrades() {
    setIsLoading(true)
    try {
      const data = await requestJson<Grade[]>('/grades')
      setGrades(Array.isArray(data) ? data : [])
    } catch {
      setGrades([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await requestJson('/grades', {
        method: 'POST',
        body: JSON.stringify({
          courseId: draft.courseId,
          studentId: draft.studentId,
          evaluationType: draft.evaluationType,
          score: Number(draft.score),
        }),
      })
      setDraft(emptyDraft)
      await fetchGrades()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Grade creation failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Grades</h2>
          <p className="page-subtitle">Record grades and view weighted averages.</p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /grades</span>
          <span className="tag">GET /grades</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <p className="panel-title">Record a grade</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Course</span>
                <select
                  required
                  value={draft.courseId}
                  onChange={(e) => setDraft({ ...draft, courseId: e.target.value })}
                >
                  <option value="">— Select a course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Student</span>
                <select
                  required
                  value={draft.studentId}
                  onChange={(e) => setDraft({ ...draft, studentId: e.target.value })}
                >
                  <option value="">— Select a student —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.email}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Evaluation type</span>
                <input
                  value={draft.evaluationType}
                  onChange={(e) => setDraft({ ...draft, evaluationType: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Score /20</span>
                <input
                  required
                  type="number"
                  min="0"
                  max="20"
                  step="0.01"
                  value={draft.score}
                  onChange={(e) => setDraft({ ...draft, score: e.target.value })}
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Record grade'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <p className="panel-title">Grades ({grades.length})</p>
          {isLoading ? (
            <p className="helper-text">Loading…</p>
          ) : grades.length === 0 ? (
            <p className="helper-text">No grades yet.</p>
          ) : (
            <ul className="list-plain">
              {grades.map((g) => (
                <li key={g.id} className="list-item">
                  <div>
                    <strong>{g.student?.name ?? '—'}</strong>
                    <div className="muted">
                      {g.course?.code ?? '—'} · {g.evaluationType} · {g.score}/20
                      {g.weightedAverage != null
                        ? ` · avg ${g.weightedAverage.toFixed(2)}`
                        : ''}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
