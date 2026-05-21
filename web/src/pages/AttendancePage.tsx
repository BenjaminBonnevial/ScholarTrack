import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

type Course = { id: string; code: string; title: string }
type Student = { id: string; name: string; email: string }
type CourseSession = {
  id: string
  sessionDate: string
  topic: string | null
  course: { code: string; title: string }
}

const emptySessionDraft = {
  courseId: '',
  sessionDate: '',
  topic: '',
}

const emptyRecordDraft = {
  sessionId: '',
  studentId: '',
  status: 'PRESENT',
}

export function AttendancePage() {
  const [sessionDraft, setSessionDraft] = useState(emptySessionDraft)
  const [recordDraft, setRecordDraft] = useState(emptyRecordDraft)
  const [error, setError] = useState('')
  const [sessionSubmitting, setSessionSubmitting] = useState(false)
  const [recordSubmitting, setRecordSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    void fetchSessions()
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

  async function fetchSessions() {
    setIsLoading(true)
    try {
      const data = await requestJson<CourseSession[]>('/attendance/sessions')
      setSessions(Array.isArray(data) ? data : [])
    } catch {
      setSessions([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSessionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSessionSubmitting(true)
    setError('')
    try {
      await requestJson('/attendance/sessions', {
        method: 'POST',
        body: JSON.stringify({
          courseId: sessionDraft.courseId,
          sessionDate: new Date(sessionDraft.sessionDate).toISOString(),
          topic: sessionDraft.topic || undefined,
        }),
      })
      setSessionDraft(emptySessionDraft)
      await fetchSessions()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Session creation failed')
    } finally {
      setSessionSubmitting(false)
    }
  }

  const handleRecordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setRecordSubmitting(true)
    setError('')
    try {
      await requestJson('/attendance/records', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: recordDraft.sessionId,
          records: [{ studentId: recordDraft.studentId, status: recordDraft.status }],
        }),
      })
      setRecordDraft(emptyRecordDraft)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Attendance record failed')
    } finally {
      setRecordSubmitting(false)
    }
  }

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Attendance</h2>
          <p className="page-subtitle">Create sessions and record student attendance.</p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /attendance/sessions</span>
          <span className="tag">POST /attendance/records</span>
        </div>
      </div>

      <div className="grid-2">
        <div className="panel">
          <p className="panel-title">New session</p>
          <form className="form-stack" onSubmit={handleSessionSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Course</span>
                <select
                  required
                  value={sessionDraft.courseId}
                  onChange={(e) => setSessionDraft({ ...sessionDraft, courseId: e.target.value })}
                >
                  <option value="">— Select a course —</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Session date</span>
                <input
                  required
                  type="datetime-local"
                  value={sessionDraft.sessionDate}
                  onChange={(e) => setSessionDraft({ ...sessionDraft, sessionDate: e.target.value })}
                />
              </label>

              <label className="field form-grid-span-2">
                <span>Topic (optional)</span>
                <input
                  value={sessionDraft.topic}
                  onChange={(e) => setSessionDraft({ ...sessionDraft, topic: e.target.value })}
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            <div className="form-actions">
              <button className="button" type="submit" disabled={sessionSubmitting}>
                {sessionSubmitting ? 'Creating…' : 'Create session'}
              </button>
            </div>
          </form>
        </div>

        <div className="panel">
          <p className="panel-title">Sessions ({sessions.length})</p>
          {isLoading ? (
            <p className="helper-text">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="helper-text">No sessions yet.</p>
          ) : (
            <ul className="list-plain">
              {sessions.map((s) => (
                <li key={s.id} className="list-item">
                  <div>
                    <strong>{s.course?.code ?? '—'}</strong>
                    <div className="muted">
                      {new Date(s.sessionDate).toLocaleDateString()}
                      {s.topic ? ` · ${s.topic}` : ''}
                    </div>
                  </div>
                  <div className="muted" style={{ fontSize: '0.7rem', fontFamily: 'monospace' }}>
                    {s.id.slice(0, 8)}…
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="panel">
        <p className="panel-title">Record attendance</p>
        <form className="form-stack" onSubmit={handleRecordSubmit}>
          <div className="form-grid">
            <label className="field">
              <span>Session</span>
              <select
                required
                value={recordDraft.sessionId}
                onChange={(e) => setRecordDraft({ ...recordDraft, sessionId: e.target.value })}
              >
                <option value="">— Select a session —</option>
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.course?.code ?? '—'} · {new Date(s.sessionDate).toLocaleDateString()}
                    {s.topic ? ` · ${s.topic}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Student</span>
              <select
                required
                value={recordDraft.studentId}
                onChange={(e) => setRecordDraft({ ...recordDraft, studentId: e.target.value })}
              >
                <option value="">— Select a student —</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} — {s.email}</option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Status</span>
              <select
                value={recordDraft.status}
                onChange={(e) => setRecordDraft({ ...recordDraft, status: e.target.value })}
              >
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="EXCUSED">Excused</option>
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button className="button" type="submit" disabled={recordSubmitting}>
              {recordSubmitting ? 'Saving…' : 'Record attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
