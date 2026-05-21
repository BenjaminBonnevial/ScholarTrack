import { useEffect, useState } from 'react'
import { requestJson } from '../lib/api'
import { useSession } from '../lib/auth-client'

type Stats = {
  totalCourses: number
  totalEnrollments: number
  atRiskCount: number
  totalGrades: number
  averageScore: number | null
}

export function DashboardPage() {
  const { data: session } = useSession()
  const role = (session as { role?: string } | null | undefined)?.role ?? 'STUDENT'
  const isAdmin = role === 'ADMIN'

  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!isAdmin) return
    requestJson<Stats>('/admin/stats')
      .then((data) => setStats(data))
      .catch(() => setStats(null))
  }, [isAdmin])

  const metrics = [
    {
      label: 'Courses',
      value: stats ? String(stats.totalCourses) : '—',
      detail: 'active',
    },
    {
      label: 'Enrollments',
      value: stats ? String(stats.totalEnrollments) : '—',
      detail: 'total',
    },
    {
      label: 'Average grade',
      value: stats?.averageScore != null ? stats.averageScore.toFixed(1) : '—',
      detail: stats ? `${stats.totalGrades} grades recorded` : '',
    },
    {
      label: 'At risk',
      value: stats ? String(stats.atRiskCount) : '—',
      detail: 'attendance below threshold',
    },
  ]

  return (
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2 className="page-title">Dashboard</h2>
          {session && (
            <p className="page-subtitle">
              Welcome, {session.user.name || session.user.email}
            </p>
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="grid-4">
          {metrics.map((m) => (
            <div key={m.label} className="metric-card">
              <p className="metric-label">{m.label}</p>
              <p className="metric-value">{m.value}</p>
              {m.detail && <p className="metric-detail">{m.detail}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
