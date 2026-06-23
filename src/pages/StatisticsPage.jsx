import { useMemo } from 'react'
import { useAcademic } from '../context/AcademicContext'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import {
  calculateTotalEcts,
  calculateWeightedAverage,
  formatAverage,
} from '../utils/gradeUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

function StatisticsPage() {
  const { subjects } = useSubjects()
  const { tasks } = useTasks()
  const { passedExams } = useAcademic()

  const statistics = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(
      (task) => task.status === 'done'
    ).length

    const activeTasks = totalTasks - completedTasks

    const completionRate =
      totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0

    const priorityStats = {
      high: tasks.filter(
        (task) => task.status !== 'done' && task.priority === 'high'
      ).length,
      medium: tasks.filter(
        (task) => task.status !== 'done' && task.priority === 'medium'
      ).length,
      low: tasks.filter(
        (task) => task.status !== 'done' && task.priority === 'low'
      ).length,
    }

    const subjectStats = subjects
      .map((subject) => {
        const subjectTasks = tasks.filter(
          (task) => Number(task.subjectId) === Number(subject.id)
        )

        const completed = subjectTasks.filter(
          (task) => task.status === 'done'
        ).length

        const active = subjectTasks.length - completed

        const calculatedProgress =
          subjectTasks.length > 0
            ? Math.round((completed / subjectTasks.length) * 100)
            : Number(subject.progress || 0)

        return {
          ...subject,
          totalTasks: subjectTasks.length,
          completedTasks: completed,
          activeTasks: active,
          calculatedProgress,
        }
      })
      .sort((firstSubject, secondSubject) => {
        if (secondSubject.activeTasks !== firstSubject.activeTasks) {
          return secondSubject.activeTasks - firstSubject.activeTasks
        }

        return (
          secondSubject.calculatedProgress -
          firstSubject.calculatedProgress
        )
      })

    const busiestSubject =
      [...subjectStats].sort(
        (firstSubject, secondSubject) =>
          secondSubject.activeTasks - firstSubject.activeTasks
      )[0] || null

    return {
      totalTasks,
      completedTasks,
      activeTasks,
      completionRate,
      priorityStats,
      subjectStats,
      busiestSubject,
      totalEcts: calculateTotalEcts(passedExams),
      weightedAverage: calculateWeightedAverage(passedExams),
      passedExamCount: passedExams.length,
    }
  }, [subjects, tasks, passedExams])

  const maxPriorityCount = Math.max(
    statistics.priorityStats.high,
    statistics.priorityStats.medium,
    statistics.priorityStats.low,
    1
  )

  return (
    <section className="statistics-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">PREGLED NAPRETKA</p>
          <h1>Statistika</h1>
          <p className="page-description">
            Prati obaveze, uspeh po predmetima i akademski napredak na jednom
            mestu.
          </p>
        </div>
      </div>

      <div className="statistics-summary-grid">
        <article className="statistics-summary-card">
          <div>
            <span>Ukupno obaveza</span>
            <strong>{statistics.totalTasks}</strong>
            <small>Sačuvano u planer</small>
          </div>

          <div className="statistics-summary-icon">
            <i className="bi bi-list-check"></i>
          </div>
        </article>

        <article className="statistics-summary-card">
          <div>
            <span>Završeno</span>
            <strong>{statistics.completedTasks}</strong>
            <small>{statistics.activeTasks} aktivnih obaveza</small>
          </div>

          <div className="statistics-summary-icon">
            <i className="bi bi-check2-circle"></i>
          </div>
        </article>

        <article className="statistics-summary-card">
          <div>
            <span>Izvršenost</span>
            <strong>{statistics.completionRate}%</strong>
            <small>Od svih unetih obaveza</small>
          </div>

          <div className="statistics-summary-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
        </article>

        <article className="statistics-summary-card">
          <div>
            <span>Težinski prosek</span>
            <strong>
              {statistics.passedExamCount > 0
                ? formatAverage(statistics.weightedAverage)
                : '—'}
            </strong>
            <small>{statistics.totalEcts} osvojenih ESPB</small>
          </div>

          <div className="statistics-summary-icon">
            <i className="bi bi-mortarboard"></i>
          </div>
        </article>
      </div>

      <div className="statistics-layout">
        <section className="statistics-subject-card">
          <div className="statistics-card-heading">
            <div>
              <p className="page-eyebrow">NAPREDAK PO PREDMETIMA</p>
              <h2>Kako stoje tvoje obaveze?</h2>
            </div>

            <span>{statistics.subjectStats.length} predmeta</span>
          </div>

          {statistics.subjectStats.length > 0 ? (
            <div className="statistics-subject-list">
              {statistics.subjectStats.map((subject) => (
                <article
                  className="statistics-subject-row"
                  key={subject.id}
                  style={{
                    '--subject-color': getSubjectColorValue(subject.color),
                  }}
                >
                  <div className="statistics-subject-main">
                    <span className="statistics-subject-dot"></span>

                    <div>
                      <strong>
                        {subject.code} — {subject.name}
                      </strong>

                      <span>
                        {subject.completedTasks}/{subject.totalTasks} završeno ·{' '}
                        {subject.activeTasks} aktivno
                      </span>
                    </div>
                  </div>

                  <div className="statistics-subject-progress">
                    <div>
                      <span>Napredak</span>
                      <strong>{subject.calculatedProgress}%</strong>
                    </div>

                    <div className="statistics-progress-track">
                      <span
                        style={{
                          width: `${subject.calculatedProgress}%`,
                        }}
                      ></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="statistics-empty-state">
              <i className="bi bi-bar-chart"></i>
              <h3>Još nema predmeta</h3>
              <p>Dodaj predmete i obaveze da bi se prikazao napredak.</p>
            </div>
          )}
        </section>

        <aside className="statistics-side-column">
          <section className="statistics-priority-card">
            <div className="statistics-card-heading">
              <div>
                <p className="page-eyebrow">AKTIVNE OBAVEZE</p>
                <h2>Prioriteti</h2>
              </div>
            </div>

            <div className="priority-chart">
              <div className="priority-chart-row">
                <div>
                  <span className="priority-dot priority-dot-high"></span>
                  <span>Visok prioritet</span>
                  <strong>{statistics.priorityStats.high}</strong>
                </div>

                <div className="priority-bar-track">
                  <span
                    className="priority-bar-high"
                    style={{
                      width: `${
                        (statistics.priorityStats.high / maxPriorityCount) *
                        100
                      }%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="priority-chart-row">
                <div>
                  <span className="priority-dot priority-dot-medium"></span>
                  <span>Srednji prioritet</span>
                  <strong>{statistics.priorityStats.medium}</strong>
                </div>

                <div className="priority-bar-track">
                  <span
                    className="priority-bar-medium"
                    style={{
                      width: `${
                        (statistics.priorityStats.medium / maxPriorityCount) *
                        100
                      }%`,
                    }}
                  ></span>
                </div>
              </div>

              <div className="priority-chart-row">
                <div>
                  <span className="priority-dot priority-dot-low"></span>
                  <span>Nizak prioritet</span>
                  <strong>{statistics.priorityStats.low}</strong>
                </div>

                <div className="priority-bar-track">
                  <span
                    className="priority-bar-low"
                    style={{
                      width: `${
                        (statistics.priorityStats.low / maxPriorityCount) *
                        100
                      }%`,
                    }}
                  ></span>
                </div>
              </div>
            </div>
          </section>

          <section className="statistics-focus-card">
            <div className="statistics-focus-icon">
              <i className="bi bi-bullseye"></i>
            </div>

            <p className="page-eyebrow">PREPORUČENI FOKUS</p>

            {statistics.busiestSubject ? (
              <>
                <h2>{statistics.busiestSubject.name}</h2>

                <p>
                  Trenutno ima{' '}
                  <strong>{statistics.busiestSubject.activeTasks}</strong>{' '}
                  aktivne obaveze. Posveti mu više vremena ove nedelje.
                </p>

                <span
                  className="statistics-focus-subject"
                  style={{
                    '--subject-color': getSubjectColorValue(
                      statistics.busiestSubject.color
                    ),
                  }}
                >
                  <span></span>
                  {statistics.busiestSubject.code}
                </span>
              </>
            ) : (
              <>
                <h2>Nema prioriteta</h2>
                <p>Dodaj obaveze da EduFlow predloži na šta da se fokusiraš.</p>
              </>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}

export default StatisticsPage