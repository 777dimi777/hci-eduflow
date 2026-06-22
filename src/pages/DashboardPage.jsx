import { Link } from 'react-router'
import { useSubjects } from '../context/SubjectContext'

const upcomingTasks = [
  {
    subject: 'Interakcija čovek–računar',
    task: 'Prvi kolokvijum',
    date: '24.06.2026.',
  },
  {
    subject: 'Softversko inženjerstvo',
    task: 'HCI projekat — prva faza',
    date: '27.06.2026.',
  },
  {
    subject: 'Paralelno programiranje',
    task: 'Priprema za ispit',
    date: '02.07.2026.',
  },
  {
    subject: 'Računarske mreže',
    task: 'Domaći zadatak',
    date: '05.07.2026.',
  },
]

function DashboardPage() {
  const { subjects } = useSubjects()

  const averageProgress =
    subjects.length === 0
      ? 0
      : Math.round(
          subjects.reduce((sum, subject) => sum + subject.progress, 0) /
            subjects.length
        )

  const statistics = [
    {
      value: subjects.length,
      label: 'Predmeta',
      icon: 'bi-book',
    },
    {
      value: '12',
      label: 'Obaveza',
      icon: 'bi-list-check',
    },
    {
      value: '5',
      label: 'Predstojećih rokova',
      icon: 'bi-calendar-event',
    },
    {
      value: `${averageProgress}%`,
      label: 'Ukupan napredak',
      icon: 'bi-pie-chart',
    },
  ]

  const subjectProgress = subjects.slice(0, 5)

  return (
    <section>
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">CENTRALNI PREGLED</p>
          <h1>Dashboard</h1>
          <p className="page-description">
            Organizuj svoje obaveze i prati napredak na jednom mestu.
          </p>
        </div>

        <Link to="/tasks" className="green-button">
          <i className="bi bi-plus-lg"></i>
          Dodaj obavezu
        </Link>
      </div>

      <div className="statistics-grid">
        {statistics.map((item) => (
          <article className="stat-card" key={item.label}>
            <div>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>

            <div className="stat-card-icon">
              <i className={`bi ${item.icon}`}></i>
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-content-grid">
        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>PLANIRANJE</p>
              <h2>Najbliži rokovi</h2>
            </div>

            <i className="bi bi-calendar-week"></i>
          </div>

          <div className="upcoming-task-list">
            {upcomingTasks.map((task) => (
              <article className="upcoming-task" key={task.subject}>
                <div className="task-marker"></div>

                <div className="task-main-info">
                  <strong>{task.subject}</strong>
                  <span>{task.task}</span>
                </div>

                <time>{task.date}</time>
              </article>
            ))}
          </div>

          <Link to="/calendar" className="panel-link">
            Prikaži sve rokove
            <i className="bi bi-arrow-right"></i>
          </Link>
        </section>

        <section className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <p>UČENJE</p>
              <h2>Napredak po predmetima</h2>
            </div>

            <i className="bi bi-graph-up-arrow"></i>
          </div>

          <div className="progress-list">
            {subjectProgress.length > 0 ? (
              subjectProgress.map((subject) => (
                <article className="subject-progress" key={subject.id}>
                  <div className="subject-progress-top">
                    <span>{subject.name}</span>
                    <strong>{subject.progress}%</strong>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${subject.progress}%` }}
                    ></div>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-inline-message">
                Dodaj prvi predmet da bi se ovde video napredak.
              </p>
            )}
          </div>

          <Link to="/statistics" className="panel-link">
            Pogledaj statistiku
            <i className="bi bi-arrow-right"></i>
          </Link>
        </section>
      </div>
    </section>
  )
}

export default DashboardPage