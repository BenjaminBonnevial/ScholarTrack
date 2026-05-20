import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { requestJson } from '../lib/api'
import { useSession } from '../lib/auth-client'

type Stats = {
  totalCourses: number
  totalEnrollments: number
  atRiskCount: number
  totalGrades: number
  averageScore: number | null
}

const quickChecks = [
  'Create a course and open it in the Courses page.',
  'Add a user and verify role-based filtering.',
  'Record a grade or attendance from the business pages.',
  'Test login and account creation.',
]

export function DashboardPage() {
  const { data: session } = useSession()
  const isAdmin = (session as any)?.role === 'ADMIN'
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAdmin) return
    setLoading(true)
    requestJson<Stats>('/admin/stats')
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [isAdmin])

  const metrics = stats
    ? [
        { label: 'Courses', value: String(stats.totalCourses), detail: 'total' },
        { label: 'Enrollments', value: String(stats.totalEnrollments), detail: 'enrolled students' },
        {
          label: 'Overall average',
          value: stats.averageScore != null ? stats.averageScore.toFixed(1) : '—',
          detail: `across ${stats.totalGrades} grades`,
        },
        { label: 'At risk', value: String(stats.atRiskCount), detail: 'critical attendance' },
      ]
    : [
        { label: 'Active courses', value: '—', detail: '' },
        { label: 'Enrollments', value: '—', detail: '' },
        { label: 'Overall average', value: '—', detail: '' },
        { label: 'At risk', value: '—', detail: '' },
      ]

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="panel panel-primary">
          <p className="eyebrow">Vue générale</p>
          <h2>Everything you need to validate the application from the browser.</h2>
          <p className="lede">
            The frontend exposes screens for authentication and the most common
            admin operations. Test business flows without opening Postman.
          </p>
          <div className="action-row">
            <Link className="button" to="/courses">
              Manage courses
            </Link>
            <Link className="button button-secondary" to="/auth/login">
              Ouvrir l'auth
            </Link>
          </div>
        </div>

        <div className="panel panel-spotlight">
          <p className="eyebrow">Global stats {loading ? '(loading…)' : ''}</p>
          <div className="stacked-metrics">
            {metrics.map((metric) => (
              <article key={metric.label} className="metric-inline">
                <div>
                  <p className="metric-label">{metric.label}</p>
                  <strong>{metric.value}</strong>
                </div>
                <span>{metric.detail}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="panel metric-card">
            <p className="metric-label">{metric.label}</p>
            <strong>{metric.value}</strong>
            <span>{metric.detail}</span>
          </article>
        ))}
      </section>

      <section className="list-grid">
        <article className="panel">
          <p className="eyebrow">Checklist rapide</p>
          <h2>Flows to test in a few clicks.</h2>
          <ul className="feature-list feature-list-dark">
            {quickChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="panel">
          <p className="eyebrow">Navigation</p>
          <h2>Accès direct aux pages utiles.</h2>
          <div className="link-grid">
            <Link className="soft-link" to="/courses">Courses</Link>
            <Link className="soft-link" to="/users">Users</Link>
            <Link className="soft-link" to="/grades">Grades</Link>
            <Link className="soft-link" to="/attendance">Attendance</Link>
          </div>
        </article>
      </section>
    </div>
  )
}
