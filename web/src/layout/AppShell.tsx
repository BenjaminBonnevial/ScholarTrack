import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../lib/auth-client'

const navigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/semesters', label: 'Semesters', roles: ['ADMIN'] },
  { to: '/courses', label: 'Courses', roles: ['TEACHER', 'ADMIN'] },
  { to: '/users', label: 'Users', roles: ['ADMIN'] },
  { to: '/enrollments', label: 'Enrollments', roles: ['ADMIN'] },
  { to: '/grades', label: 'Grades', roles: ['TEACHER', 'ADMIN'] },
  { to: '/attendance', label: 'Attendance', roles: ['TEACHER', 'ADMIN'] },
]

export function AppShell() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const role = (session as { role?: string } | null | undefined)?.role ?? 'STUDENT'

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate('/auth/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">ScholarTrack</span>
        </div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            if (item.roles && !item.roles.includes(role)) return null
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `nav-link${isActive ? ' nav-link-active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        {session && (
          <div className="sidebar-footer">
            <span className="sidebar-user-email">{session.user.email}</span>
            <button type="button" className="button-ghost button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        )}
      </aside>

      <div className="workspace">
        <header className="topbar">
          <span className="topbar-title">ScholarTrack</span>
          {session && (
            <div className="topbar-right">
              <span className="topbar-user-email">{session.user.name || session.user.email}</span>
              <span className="role-badge">{role}</span>
            </div>
          )}
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
