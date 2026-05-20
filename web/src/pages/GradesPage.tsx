import { useMemo, useState } from 'react'

type Grade = {
  id: string
  student: string
  course: string
  score: string
  weight: string
}

const initialGrades: Grade[] = [
  {
    id: 'grade-1',
    student: 'Lina Robert',
    course: 'DEV-310',
    score: '87',
    weight: '40',
  },
  {
    id: 'grade-2',
    student: 'Hugo Petit',
    course: 'MATH-201',
    score: '74',
    weight: '60',
  },
]

const emptyDraft = {
  student: '',
  course: '',
  score: '80',
  weight: '50',
}

export function GradesPage() {
  const [grades, setGrades] = useState(initialGrades)
  const [draft, setDraft] = useState(emptyDraft)

  const average = useMemo(() => {
    if (!grades.length) {
      return '0.0'
    }

    const total = grades.reduce(
      (sum, grade) => sum + Number(grade.score) * (Number(grade.weight) / 100),
      0,
    )
    return (total / grades.length).toFixed(1)
  }, [grades])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setGrades((currentGrades) => [
      ...currentGrades,
      {
        id: `grade-${Date.now()}`,
        ...draft,
      },
    ])
    setDraft(emptyDraft)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Performance</p>
          <h2>Saisir les notes et suivre la moyenne pondérée.</h2>
          <p className="lede">
            Cette page prépare le terrain pour le calcul des moyennes et l’import CSV.
          </p>
        </div>
        <div className="panel panel-tight">
          <p className="metric-label">Moyenne locale</p>
          <strong className="big-number">{average}</strong>
          <span className="helper-text">sur les entrées de démonstration</span>
        </div>
      </section>

      <section className="list-grid">
        <article className="panel">
          <p className="eyebrow">Nouvelle note</p>
          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label className="field">
                <span>Student</span>
                <input
                  required
                  value={draft.student}
                  onChange={(event) => setDraft({ ...draft, student: event.target.value })}
                  placeholder="Nora Ali"
                />
              </label>

              <label className="field">
                <span>Cours</span>
                <input
                  required
                  value={draft.course}
                  onChange={(event) => setDraft({ ...draft, course: event.target.value })}
                  placeholder="DEV-310"
                />
              </label>

              <label className="field">
                <span>Score</span>
                <input
                  required
                  type="number"
                  min="0"
                  max="100"
                  value={draft.score}
                  onChange={(event) => setDraft({ ...draft, score: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Poids</span>
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={draft.weight}
                  onChange={(event) => setDraft({ ...draft, weight: event.target.value })}
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit">
                Ajouter la note
              </button>
              <p className="helper-text">Le calcul pondéré se met à jour en local.</p>
            </div>
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Historique</p>
          <div className="record-list">
            {grades.map((grade) => (
              <div key={grade.id} className="record-item">
                <div>
                  <p className="record-title">
                    {grade.student} · {grade.course}
                  </p>
                  <p className="record-meta">Poids {grade.weight}%</p>
                </div>
                <div className="record-side">
                  <span className="tag">{grade.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}