function Topbar() {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <i className="bi bi-mortarboard-fill"></i>
        <span>EduFlow</span>
      </div>

      <div className="topbar-search">
        <i className="bi bi-search"></i>

        <input
          type="text"
          placeholder="Pretraži predmete, obaveze..."
          aria-label="Pretraga"
        />
      </div>

      <div className="topbar-actions">
        <button type="button" className="topbar-icon-button" aria-label="Obaveštenja">
          <i className="bi bi-bell"></i>
          <span className="notification-dot"></span>
        </button>

        <div className="profile-preview">
          <div className="profile-avatar">M</div>

          <div className="profile-text">
            <strong>Miloš</strong>
            <span>Student</span>
          </div>

          <i className="bi bi-chevron-down profile-chevron"></i>
        </div>
      </div>
    </header>
  )
}

export default Topbar