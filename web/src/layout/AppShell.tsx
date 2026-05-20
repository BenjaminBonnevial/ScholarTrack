import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { authClient, useSession } from '../lib/auth-client'

const navigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/courses', label: 'Cours' },
  { to: '/users', label: 'Users' },
  { to: '/grades', label: 'Notes' },
  { to: '/attendance', label: 'Présences' },
]

function ActionLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="button button-secondary" to={to}>
      {children}
    </Link>
  )
}

export function AppShell() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const role = (session as { role?: string } | null | undefined)?.role ?? 'STUDENT'

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate('/auth/login')
        },
      },
    })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/">
          <span className="brand-mark">S</span>
          <span>
            <strong>ScholarTrack</strong>
            <small>Admin cockpit</small>
          </span>
        </Link>

        <nav className="sidebar-nav" aria-label="Navigation principale">
          {navigation.map((item) => (
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
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Raccourcis auth</p>
          <p className="sidebar-card-title">
            {session ? `Connecté en tant que ${session.user.email}` : 'Session active.'}
          </p>
          {session ? (
            <p className="sidebar-card-copy">Rôle {role}</p>
          ) : null}
          <div className="sidebar-actions">
            <ActionLink to="/auth/login">Connexion</ActionLink>
            <ActionLink to="/auth/register">Créer un compte</ActionLink>
            {session ? (
              <button type="button" className="button button-ghost" onClick={handleSignOut}>
                Déconnexion
              </button>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">ScholarTrack preview</p>
            <h1>Gestion académique en mode cockpit.</h1>
            <p className="topbar-copy">
              Navigue entre les écrans de connexion, de création de cours, de gestion
              des users et des pages de suivi pour valider les parcours plus vite
              qu’avec Postman.
            </p>
          </div>

          <div className="topbar-actions">
            <Link className="button" to="/courses">
              Nouveau cours
            </Link>
            <Link className="button button-ghost" to="/users">
              Nouveau user
            </Link>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}