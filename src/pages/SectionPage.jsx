function SectionPage({ title, description, icon }) {
  return (
    <section className="temporary-page">
      <i className={`bi ${icon}`}></i>

      <p>EduFlow sekcija</p>

      <h1>{title}</h1>

      <p>{description}</p>
    </section>
  )
}

export default SectionPage