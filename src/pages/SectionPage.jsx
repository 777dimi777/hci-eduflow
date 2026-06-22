function SectionPage({ title, description, icon }) {
  return (
    <section className="section-page">
      <div className="section-page-heading">
        <div>
          <p className="page-eyebrow">EDUFLOW SEKCIJA</p>
          <h1>{title}</h1>
          <p className="page-description">{description}</p>
        </div>

        <div className="section-page-icon">
          <i className={`bi ${icon}`}></i>
        </div>
      </div>

      <div className="coming-soon-card">
        <div className="coming-soon-icon">
          <i className="bi bi-stars"></i>
        </div>

        <h2>Ova sekcija stiže uskoro</h2>

        <p>
          Stranica je povezana sa navigacijom. U sledećim koracima dodaćemo
          stvarne funkcionalnosti i čuvanje podataka u localStorage-u.
        </p>
      </div>
    </section>
  )
}

export default SectionPage