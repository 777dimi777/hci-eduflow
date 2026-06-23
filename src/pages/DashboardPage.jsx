import { useMemo } from 'react'
import { Link } from 'react-router'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import { formatDate } from '../utils/dateUtils'
import DailyFocusPanel from '../components/DailyFocusPanel'
import SmartStudyAssistant from '../components/SmartStudyAssistant'
import DailyLoadInsight from "../components/DailyLoadInsight";

function DashboardPage() {
  const { subjects } = useSubjects()
  const { tasks } = useTasks()

  const averageProgress =
    subjects.length === 0
      ? 0
      : Math.round(
          subjects.reduce((sum, subject) => sum + subject.progress, 0) /
            subjects.length
        )

  const activeTasks = tasks.filter((task) => task.status !== 'done')

  const upcomingTasks = useMemo(() => {
    return [...activeTasks]
      .sort((firstTask, secondTask) =>
        firstTask.dueDate.localeCompare(secondTask.dueDate)
      )
      .slice(0, 4)
  }, [tasks])

  function getSubjectName(subjectId) {
    const subject = subjects.find((item) => item.id === subjectId)

    return subject ? subject.name : 'Obrisani predmet'
  }

  const statistics = [
    {
      value: subjects.length,
      label: 'Predmeta',
      icon: 'bi-book',
    },
    {
      value: activeTasks.length,
      label: 'Aktivnih obaveza',
      icon: 'bi-list-check',
    },
    {
      value: upcomingTasks.length,
      label: 'Predstojećih rokova',
      icon: 'bi-calendar-event',
    },
    {
      value: `${averageProgress}%`,
      label: 'Ukupan napredak',
      icon: 'bi-pie-chart',
    },
  ]

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
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task) => (
                <article className="upcoming-task" key={task.id}>
                  <div className="task-marker"></div>

                  <div className="task-main-info">
                    <strong>{getSubjectName(task.subjectId)}</strong>
                    <span>{task.title}</span>
                  </div>

                  <time>{formatDate(task.dueDate)}</time>
                </article>
              ))
            ) : (
              <p className="empty-inline-message">
                Trenutno nema aktivnih obaveza.
              </p>
            )}
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
            {subjects.length > 0 ? (
              subjects.slice(0, 5).map((subject) => (
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
      <DailyFocusPanel />
      <DailyLoadInsight />
      <SmartStudyAssistant />
    </section>
  )
}

export default DashboardPage