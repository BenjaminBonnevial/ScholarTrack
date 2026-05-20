import { Link } from 'react-router-dom'

export default function NotAuthorizedPage() {
  return (
    <div className="auth-shell auth-shell-simple">
      <section className="auth-card auth-card-wide">
        <p className="eyebrow">Accès refusé</p>
        <h1>Vous n’avez pas la permission d’accéder à cette page.</h1>
        <p className="lede">Contactez un administrateur si vous pensez que c’est une erreur.</p>
        <div style={{ marginTop: 16 }}>
          <Link to="/" className="btn">
            Retour au tableau de bord
          </Link>
        </div>
      </section>
    </div>
  )
}
