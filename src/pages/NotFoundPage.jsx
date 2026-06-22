import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <section className="temporary-page">
      <i className="bi bi-exclamation-triangle"></i>

      <p>Greška 404</p>

      <h1>Stranica ne postoji</h1>

      <p>Stranica koju si otvorio ne postoji u EduFlow aplikaciji.</p>

      <Link to="/dashboard">Vrati se na Dashboard</Link>
    </section>
  )
}

export default NotFoundPage