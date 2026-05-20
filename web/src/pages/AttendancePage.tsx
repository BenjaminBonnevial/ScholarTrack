import { useState } from 'react'
import { requestJson } from '../lib/api'

const sessionDraftDefaults = {
  courseId: '55555555-5555-5555-5555-555555555555',
  sessionDate: '2026-09-01T08:00:00.000Z',
  topic: 'Introduction',
}

const recordsDraftDefaults = {
  sessionId: '66666666-6666-6666-6666-666666666666',
  studentId: '77777777-7777-7777-7777-777777777777',
  status: 'PRESENT',
}

type SessionResponse = {
  action: string
  payload: {
    courseId: string
    sessionDate: string
    topic?: string
  }
}

type AttendanceResponse = {
  action: string
  payload: {
    sessionId: string
    records: Array<{
      studentId: string
      status: string
    }>
  }
}

export function AttendancePage() {
  const [sessionDraft, setSessionDraft] = useState(sessionDraftDefaults)
  const [recordsDraft, setRecordsDraft] = useState(recordsDraftDefaults)
  const [sessionResponse, setSessionResponse] = useState('')
  const [recordsResponse, setRecordsResponse] = useState('')
  const [error, setError] = useState('')
  const [sessionSubmitting, setSessionSubmitting] = useState(false)
  const [recordsSubmitting, setRecordsSubmitting] = useState(false)

  const handleSessionSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSessionSubmitting(true)
    setError('')

    try {
      const result = await requestJson<SessionResponse>('/attendance/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionDraft),
      })

      setSessionResponse(JSON.stringify(result, null, 2))
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Attendance session failed',
      )
    } finally {
      setSessionSubmitting(false)
    }

    setSessionDraft(sessionDraftDefaults)
  }

  const handleRecordsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setRecordsSubmitting(true)
    setError('')

    try {
      const result = await requestJson<AttendanceResponse>('/attendance/records', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: recordsDraft.sessionId,
          records: [
            {
              studentId: recordsDraft.studentId,
              status: recordsDraft.status,
            },
          ],
        }),
      })

      setRecordsResponse(JSON.stringify(result, null, 2))
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : 'Attendance record failed',
      )
    } finally {
      setRecordsSubmitting(false)
    }

    setRecordsDraft(recordsDraftDefaults)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Suivi</p>
          <h2>Créer des sessions et marquer les présences via l’API.</h2>
          <p className="lede">
            La page couvre les deux routes d’assiduité du backend avec des payloads
            valides et des UUID de démonstration.
          </p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /attendance/sessions</span>
          <span className="tag">POST /attendance/records</span>
          <span className="tag">AttendanceStatus enum</span>
        </div>
      </section>

      <section className="list-grid">
        <article className="panel">
          <p className="eyebrow">Nouvelle session</p>
          <form className="form-stack" onSubmit={handleSessionSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Cours ID</span>
                <input
                  required
                  value={sessionDraft.courseId}
                  onChange={(event) =>
                    setSessionDraft({ ...sessionDraft, courseId: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>Date de session</span>
                <input
                  required
                  type="datetime-local"
                  value={sessionDraft.sessionDate.slice(0, 16)}
                  onChange={(event) =>
                    setSessionDraft({
                      ...sessionDraft,
                      sessionDate: new Date(event.target.value).toISOString(),
                    })
                  }
                />
              </label>

              <label className="field">
                <span>Topic</span>
                <input
                  value={sessionDraft.topic}
                  onChange={(event) =>
                    setSessionDraft({ ...sessionDraft, topic: event.target.value })
                  }
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit" disabled={sessionSubmitting}>
                {sessionSubmitting ? 'Envoi...' : 'Créer la session'}
              </button>
              <p className="helper-text">Le backend renvoie l’objet de session créé.</p>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Réponse session</p>
          {sessionResponse ? (
            <pre className="response-block">{sessionResponse}</pre>
          ) : (
            <p className="helper-text">Crée une session pour afficher la réponse du serveur.</p>
          )}
        </article>

        <article className="panel">
          <p className="eyebrow">Nouveau relevé</p>
          <form className="form-stack" onSubmit={handleRecordsSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Session ID</span>
                <input
                  required
                  value={recordsDraft.sessionId}
                  onChange={(event) =>
                    setRecordsDraft({ ...recordsDraft, sessionId: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>Student ID</span>
                <input
                  required
                  value={recordsDraft.studentId}
                  onChange={(event) =>
                    setRecordsDraft({ ...recordsDraft, studentId: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>Status</span>
                <select
                  value={recordsDraft.status}
                  onChange={(event) =>
                    setRecordsDraft({ ...recordsDraft, status: event.target.value })
                  }
                >
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                  <option value="LATE">LATE</option>
                  <option value="EXCUSED">EXCUSED</option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit" disabled={recordsSubmitting}>
                {recordsSubmitting ? 'Envoi...' : 'Enregistrer le relevé'}
              </button>
              <p className="helper-text">Le backend attend un tableau de records.</p>
            </div>
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Réponse relevé</p>
          {recordsResponse ? (
            <pre className="response-block">{recordsResponse}</pre>
          ) : (
            <p className="helper-text">Enregistre un relevé pour afficher la réponse du serveur.</p>
          )}
        </article>
      </section>
    </div>
  )
}