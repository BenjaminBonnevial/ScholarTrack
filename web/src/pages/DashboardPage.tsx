import { Link } from 'react-router-dom'

const metrics = [
  { label: 'Cours actifs', value: '18', detail: '4 en brouillon' },
  { label: 'Users', value: '247', detail: '31 admins/teachers' },
  { label: 'Sessions notées', value: '96%', detail: 'complétées aujourd’hui' },
  { label: 'Présences à risque', value: '12', detail: 'à relancer' },
]

const quickChecks = [
  'Créer un cours puis l’ouvrir dans la page Cours.',
  'Ajouter un user et vérifier le tri par rôle.',
  'Saisir une note ou une présence depuis les pages métiers.',
  'Tester la connexion et la création de compte.',
]

export function DashboardPage() {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="panel panel-primary">
          <p className="eyebrow">Vue générale</p>
          <h2>Tout ce qu’il faut pour valider l’application depuis le navigateur.</h2>
          <p className="lede">
            Le front expose maintenant des écrans pour l’authentification et pour les
            opérations admin les plus fréquentes. Le but est de tester les parcours
            métier sans ouvrir Postman.
          </p>
          <div className="action-row">
            <Link className="button" to="/courses">
              Gérer les cours
            </Link>
            <Link className="button button-secondary" to="/auth/login">
              Ouvrir l’auth
            </Link>
          </div>
        </div>

        <div className="panel panel-spotlight">
          <p className="eyebrow">Focus QA</p>
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
          <h2>Parcours à tester en quelques clics.</h2>
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
            <Link className="soft-link" to="/courses">
              Courses
            </Link>
            <Link className="soft-link" to="/users">
              Users
            </Link>
            <Link className="soft-link" to="/grades">
              Grades
            </Link>
            <Link className="soft-link" to="/attendance">
              Attendance
            </Link>
          </div>
        </article>
      </section>
    </div>
  )
}