import { useState } from 'react'
import { requestJson } from '../lib/api'

const emptyDraft = {
  courseId: '33333333-3333-3333-3333-333333333333',
  studentId: '44444444-4444-4444-4444-444444444444',
  evaluationType: 'Homework',
  score: '16',
}

type GradeResponse = {
  action: string
  payload: {
    courseId: string
    studentId: string
    evaluationType?: string
    score: number
  }
}

export function GradesPage() {
  const [draft, setDraft] = useState(emptyDraft)
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setIsSubmitting(true)
    setError('')

    try {
      const result = await requestJson<GradeResponse>('/grades', {
        method: 'POST',
        body: JSON.stringify({
          courseId: draft.courseId,
          studentId: draft.studentId,
          evaluationType: draft.evaluationType,
          score: Number(draft.score),
        }),
      })

      setResponse(JSON.stringify(result, null, 2))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Grade request failed')
    } finally {
      setIsSubmitting(false)
    }

    setDraft(emptyDraft)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Performance</p>
          <h2>Créer une note via l’API.</h2>
          <p className="lede">
            Le formulaire envoie un score réel au backend et affiche la réponse retournée.
          </p>
        </div>
        <div className="tag-row">
          <span className="tag">POST /grades</span>
          <span className="tag">score 0-20</span>
          <span className="tag">UUID course/student</span>
        </div>
      </section>

      <section className="list-grid">
        <article className="panel">
          <p className="eyebrow">Nouvelle note</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Cours</span>
                <input
                  required
                  value={draft.courseId}
                  onChange={(event) => setDraft({ ...draft, courseId: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Student ID</span>
                <input
                  required
                  value={draft.studentId}
                  onChange={(event) => setDraft({ ...draft, studentId: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Type d’évaluation</span>
                <input
                  value={draft.evaluationType}
                  onChange={(event) =>
                    setDraft({ ...draft, evaluationType: event.target.value })
                  }
                />
              </label>

              <label className="field">
                <span>Score /20</span>
                <input
                  required
                  type="number"
                  min="0"
                  max="20"
                  value={draft.score}
                  onChange={(event) => setDraft({ ...draft, score: event.target.value })}
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi...' : 'Ajouter la note'}
              </button>
              <p className="helper-text">Le backend renvoie la payload complète pour contrôle.</p>
            </div>
            {error ? <p className="form-error">{error}</p> : null}
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Réponse API</p>
          {response ? (
            <pre className="response-block">{response}</pre>
          ) : (
            <p className="helper-text">Ajoute une note pour afficher la réponse du serveur.</p>
          )}
        </article>
      </section>
    </div>
  )
}