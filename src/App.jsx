function App() {
  return (
    <div className="eduflow-app">
      <main className="welcome-screen">
        <div className="welcome-card">
          <div className="brand-icon">
            <i className="bi bi-mortarboard-fill"></i>
          </div>

          <p className="welcome-label">STUDENTSKI PLANER</p>

          <h1>
            Dobro došao u <span>EduFlow</span>
          </h1>

          <p className="welcome-text">
            Organizuj predmete, obaveze, rokove i materijale na jednom mestu.
          </p>

          <div className="welcome-badges">
            <span>
              <i className="bi bi-check-circle-fill"></i>
              React
            </span>

            <span>
              <i className="bi bi-check-circle-fill"></i>
              Bootstrap
            </span>

            <span>
              <i className="bi bi-check-circle-fill"></i>
              localStorage
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App