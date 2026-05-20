import { useState } from 'react'

type Course = {
  id: string
  code: string
  title: string
  instructor: string
  capacity: string
  term: string
  status: string
}

const initialCourses: Course[] = [
  {
    id: 'course-1',
    code: 'MATH-201',
    title: 'Algebra lineaire',
    instructor: 'Dr. Martin',
    capacity: '28',
    term: 'Automne 2026',
    status: 'Publié',
  },
  {
    id: 'course-2',
    code: 'DEV-310',
    title: 'Architecture web',
    instructor: 'Mme Laurent',
    capacity: '24',
    term: 'Automne 2026',
    status: 'Brouillon',
  },
]

const emptyDraft = {
  code: '',
  title: '',
  instructor: '',
  capacity: '30',
  term: 'Automne 2026',
  status: 'Brouillon',
}

export function CoursesPage() {
  const [courses, setCourses] = useState(initialCourses)
  const [draft, setDraft] = useState(emptyDraft)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setCourses((currentCourses) => [
      ...currentCourses,
      {
        id: `course-${Date.now()}`,
        ...draft,
      },
    ])
    setDraft(emptyDraft)
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <p className="eyebrow">Admin</p>
          <h2>Créer et inspecter les cours.</h2>
          <p className="lede">
            Cette page sert de cockpit pour valider le CRUD des cours côté front avant
            de brancher les appels API.
          </p>
        </div>
        <div className="tag-row">
          <span className="tag">Capacité</span>
          <span className="tag">Semestre</span>
          <span className="tag">Status</span>
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
                  placeholder="SCI-101"
                />
              </label>

              <label className="field">
                <span>Intitulé</span>
                <input
                  required
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                  placeholder="Sciences appliquées"
                />
              </label>

              <label className="field">
                <span>Enseignant</span>
                <input
                  required
                  value={draft.instructor}
                  onChange={(event) =>
                    setDraft({ ...draft, instructor: event.target.value })
                  }
                  placeholder="Dr. Dupont"
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
                <span>Semestre</span>
                <input
                  required
                  value={draft.term}
                  onChange={(event) => setDraft({ ...draft, term: event.target.value })}
                />
              </label>

              <label className="field">
                <span>Statut</span>
                <select
                  value={draft.status}
                  onChange={(event) => setDraft({ ...draft, status: event.target.value })}
                >
                  <option value="Brouillon">Brouillon</option>
                  <option value="Publié">Publié</option>
                </select>
              </label>
            </div>

            <div className="form-actions">
              <button className="button" type="submit">
                Créer le cours
              </button>
              <p className="helper-text">Le formulaire ajoute une ligne locale pour le QA.</p>
            </div>
          </form>
        </article>

        <article className="panel">
          <p className="eyebrow">Catalogue</p>
          <div className="record-list">
            {courses.map((course) => (
              <div key={course.id} className="record-item">
                <div>
                  <p className="record-title">
                    {course.code} · {course.title}
                  </p>
                  <p className="record-meta">
                    {course.instructor} · {course.term}
                  </p>
                </div>
                <div className="record-side">
                  <span className="tag">{course.capacity} places</span>
                  <span className="tag tag-soft">{course.status}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}