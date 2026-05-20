import { useState } from 'react'

type AttendanceEntry = {
  id: string
  student: string
  course: string
  status: string
  note: string
}

const initialEntries: AttendanceEntry[] = [
  {
    id: 'attendance-1',
    student: 'Lina Robert',
    course: 'DEV-310',
    status: 'Présent',
    note: 'À l’heure',
  },
  {
    id: 'attendance-2',
    student: 'Hugo Petit',
    course: 'MATH-201',
    status: 'À risque',
    note: '2 absences consécutives',
  },
]

const emptyDraft = {
  student: '',
  course: '',
  status: 'Présent',
  note: '',
}

export function AttendancePage() {
  const [entries, setEntries] = useState(initialEntries)
  const [draft, setDraft] = useState(emptyDraft)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setEntries((currentEntries) => [
      ...currentEntries,
      {
        id: `attendance-${Date.now()}`,
        ...draft,
      },
    ])
    setDraft(emptyDraft)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Suivi</p>
          <h2>Marquer les présences et détecter les risques.</h2>
          <p className="lede">
            La page prépare le futur calcul des alertes atRisk et des statistiques de
            présence.
          </p>
        </div>
      </section>

      <section className="list-grid">
        <article className="panel">
          <p className="eyebrow">Nouvelle présence</p>
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
                <span>Statut</span>
                <select
                  value={draft.status}
                  onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                >
                  <option value="Présent">Présent</option>
                  <option value="Absent">Absent</option>
                  <option value="À risque">À risque</option>
                </select>
              </label>

              <label className="field">
                <span>Note</span>
                <input
                  value={draft.note}
                  onChange={(event) => setDraft({ ...draft, note: event.target.value })}
                  placeholder="Observation rapide"
                />
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit">
                Enregistrer
              </button>
              <p className="helper-text">La future logique atRisk pourra partir de cette vue.</p>
            </div>
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Journal</p>
          <div className="record-list">
            {entries.map((entry) => (
              <div key={entry.id} className="record-item">
                <div>
                  <p className="record-title">
                    {entry.student} · {entry.course}
                  </p>
                  <p className="record-meta">{entry.note}</p>
                </div>
                <div className="record-side">
                  <span className="tag">{entry.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}