import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

type Course = { id: string; code: string; title: string }
type Student = { id: string; name: string; email: string }
type Enrollment = {
  id: string
  atRisk: boolean
  student: { name: string; email: string }
  course: { code: string; title: string }
}

export function EnrollmentsPage() {
  const [courseId, setCourseId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterCourseId, setFilterCourseId] = useState('')

  useEffect(() => {
    void requestJson<any>('/courses').then((d) => {
      setCourses(Array.isArray(d) ? d : (d?.items ?? []))
    })
    void requestJson<any>('/users?role=STUDENT&limit=100').then((d) => {
      setStudents(Array.isArray(d) ? d : (d?.items ?? []))
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    void fetchEnrollments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCourseId])

  async function fetchEnrollments() {
    if (!filterCourseId) { setEnrollments([]); return }
    setIsLoading(true)
    try {
      const data = await requestJson<Enrollment[]>(`/enrollments?courseId=${filterCourseId}`)
      setEnrollments(Array.isArray(data) ? data : [])
    } catch {
      setEnrollments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await requestJson('/enrollments', {
        method: 'POST',
        body: JSON.stringify({ courseId, studentId }),
      })
      setCourseId('')
      setStudentId('')
      if (filterCourseId === courseId) await fetchEnrollments()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enrollment failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Enrollments</h2>
          <p className="page-subtitle">Enroll students in courses and view enrollment lists.</p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /enrollments</span>
          <span className="tag">GET /courses/:id</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <p className="panel-title">Enroll a student</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Course</span>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
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
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                >
                  <option value="">— Select a student —</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.email}</option>
                  ))}
                </select>
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enrolling…' : 'Enroll'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <p className="panel-title">View enrollments by course</p>
          <div className="form-grid">
            <label className="field form-grid-span-2">
              <span>Course</span>
              <select
                value={filterCourseId}
                onChange={(e) => setFilterCourseId(e.target.value)}
              >
                <option value="">— Select a course —</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                ))}
              </select>
            </label>
          </div>

          {filterCourseId && (
            isLoading ? (
              <p className="helper-text">Loading…</p>
            ) : enrollments.length === 0 ? (
              <p className="helper-text">No enrollments for this course.</p>
            ) : (
              <ul className="list-plain" style={{ marginTop: 12 }}>
                {enrollments.map((e) => (
                  <li key={e.id} className="list-item">
                    <div>
                      <strong>{e.student?.name ?? '—'}</strong>
                      <div className="muted">{e.student?.email ?? '—'}</div>
                    </div>
                    {e.atRisk && (
                      <span style={{ color: '#e53e3e', fontSize: '0.75rem', fontWeight: 600 }}>
                        AT RISK
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </div>
  )
}
