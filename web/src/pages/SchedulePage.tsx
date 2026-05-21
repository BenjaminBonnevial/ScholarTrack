import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'

type Course = {
  id: string
  code: string
  title: string
  description?: string
  teacher: { name: string }
  semester: { name: string } | null
  _count: { enrollments: number }
}

type Classroom = {
  id: string
  name: string
  description?: string
  semester?: { name: string } | null
  courses: Course[]
}

export function SchedulePage() {
  const [classroom, setClassroom] = useState<Classroom | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    requestJson<Classroom | null>('/classrooms/my')
      .then((data) => setClassroom(data))
      .catch(() => setClassroom(null))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">My Schedule</h2>
          <p className="page-subtitle">Courses assigned to your classroom.</p>
        </div>
        {classroom && (
          <div className="tag-row">
            <span className="tag">{classroom.name}</span>
            {classroom.semester && <span className="tag">{classroom.semester.name}</span>}
          </div>
        )}
      </div>

      {isLoading ? (
        <p className="helper-text">Loading…</p>
      ) : !classroom ? (
        <div className="panel">
          <p className="helper-text">
            You have not been assigned to a classroom yet. Contact an administrator.
          </p>
        </div>
      ) : classroom.courses.length === 0 ? (
        <div className="panel">
          <p className="helper-text">No courses have been assigned to your classroom yet.</p>
        </div>
      ) : (
        <div className="panel">
          <p className="panel-title">{classroom.courses.length} course{classroom.courses.length !== 1 ? 's' : ''}</p>
          <ul className="list-plain">
            {classroom.courses.map((c) => (
              <li key={c.id} className="list-item">
                <div>
                  <strong>{c.code} — {c.title}</strong>
                  {c.description && <div className="muted">{c.description}</div>}
                  <div className="muted">
                    {c.teacher.name}
                    {c.semester && ` · ${c.semester.name}`}
                  </div>
                </div>
                <span className="tag">{c._count.enrollments} enrolled</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
