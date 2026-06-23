import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useDailyPlan } from '../context/DailyPlanContext'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import { formatDate, parseDateKey, toDateKey } from '../utils/dateUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

const priorityScore = {
  high: 3,
  medium: 2,
  low: 1,
}

function getDaysUntil(dateValue) {
  const taskDate = parseDateKey(dateValue)
  const today = new Date()

  today.setHours(0, 0, 0, 0)

  if (!taskDate) {
    return 999
  }

  return Math.round((taskDate - today) / (1000 * 60 * 60 * 24))
}

function getTaskUrgency(task) {
  const daysUntil = getDaysUntil(task.dueDate)

  if (daysUntil < 0) {
    return 1000 + Math.abs(daysUntil) * 10 + priorityScore[task.priority]
  }

  if (daysUntil === 0) {
    return 900 + priorityScore[task.priority]
  }

  if (daysUntil <= 3) {
    return 800 - daysUntil * 10 + priorityScore[task.priority]
  }

  return 500 - Math.min(daysUntil, 100) + priorityScore[task.priority]
}

function getUrgencyText(task) {
  const daysUntil = getDaysUntil(task.dueDate)

  if (daysUntil < 0) {
    return 'Rok je prošao'
  }

  if (daysUntil === 0) {
    return 'Rok je danas'
  }

  if (daysUntil === 1) {
    return 'Rok je sutra'
  }

  return `Rok: ${formatDate(task.dueDate)}`
}

function DailyFocusPanel() {
  const { subjects } = useSubjects()
  const { tasks, updateTaskStatus } = useTasks()
  const {
    getPlanTaskIds,
    addTaskToPlan,
    removeTaskFromPlan,
    clearDailyPlan,
    maxDailyTasks,
  } = useDailyPlan()

  const [feedback, setFeedback] = useState('')

  const todayKey = toDateKey(new Date())

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }, [subjects])

  const activeTasks = useMemo(() => {
    return tasks.filter((task) => task.status !== 'done')
  }, [tasks])

  const plannedTaskIds = getPlanTaskIds(todayKey)

  const plannedTasks = useMemo(() => {
    return plannedTaskIds
      .map((taskId) => activeTasks.find((task) => task.id === taskId))
      .filter(Boolean)
      .sort((firstTask, secondTask) => getTaskUrgency(secondTask) - getTaskUrgency(firstTask))
  }, [plannedTaskIds, activeTasks])

  const recommendedTasks = useMemo(() => {
    return activeTasks
      .filter((task) => !plannedTaskIds.includes(task.id))
      .sort((firstTask, secondTask) => getTaskUrgency(secondTask) - getTaskUrgency(firstTask))
      .slice(0, 5)
  }, [activeTasks, plannedTaskIds])

  function getSubject(task) {
    return subjectMap.get(task.subjectId)
  }

  function getSubjectName(task) {
    const subject = getSubject(task)

    return subject
      ? `${subject.code} — ${subject.name}`
      : 'Obrisani predmet'
  }

  function getTaskColor(task) {
    const subject = getSubject(task)

    return subject ? getSubjectColorValue(subject.color) : '#94a3b8'
  }

  function handleAddToPlan(task) {
    const result = addTaskToPlan(todayKey, task.id)

    if (result.added) {
      setFeedback(`Obaveza „${task.title}“ je dodata u današnji fokus.`)
      return
    }

    if (result.reason === 'limit') {
      setFeedback(
        `Dnevni fokus može da sadrži najviše ${maxDailyTasks} obaveza.`
      )
    }
  }

  function handleCompleteTask(task) {
    updateTaskStatus(task.id, 'done')
    removeTaskFromPlan(todayKey, task.id)
    setFeedback(`Odlično! Obaveza „${task.title}“ je označena kao završena.`)
  }

  function handleClearPlan() {
    clearDailyPlan(todayKey)
    setFeedback('Dnevni fokus je očišćen.')
  }

  return (
    <section className="daily-focus-panel">
      <div className="daily-focus-heading">
        <div>
          <p className="page-eyebrow">DNEVNI PLAN</p>
          <h2>Dnevni fokus</h2>
          <p>
            Izaberi najviše {maxDailyTasks} obaveza koje želiš da završiš danas.
          </p>
        </div>

        <div className="daily-focus-heading-actions">
          <span className="daily-focus-count">
            {plannedTasks.length}/{maxDailyTasks} planirano
          </span>

          {plannedTasks.length > 0 && (
            <button
              type="button"
              className="daily-focus-clear-button"
              onClick={handleClearPlan}
            >
              Očisti plan
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <p className="daily-focus-feedback" aria-live="polite">
          <i className="bi bi-check-circle-fill"></i>
          {feedback}
        </p>
      )}

      {activeTasks.length === 0 ? (
        <div className="daily-focus-empty-state">
          <div className="daily-focus-empty-icon">
            <i className="bi bi-emoji-smile"></i>
          </div>

          <h3>Nema aktivnih obaveza</h3>
          <p>Sve je završeno. Dodaj novu obavezu kada budeš imao sledeći rok.</p>

          <Link to="/tasks" className="panel-link">
            Dodaj obavezu
            <i className="bi bi-arrow-right"></i>
          </Link>
        </div>
      ) : (
        <div className="daily-focus-content">
          <div className="daily-focus-column">
            <div className="daily-focus-section-heading">
              <h3>Planirano za danas</h3>
              <span>Ovo je tvoj konkretan plan rada.</span>
            </div>

            {plannedTasks.length > 0 ? (
              <div className="daily-focus-list">
                {plannedTasks.map((task) => (
                  <article
                    key={task.id}
                    className="daily-focus-task daily-focus-task-selected"
                    style={{ '--subject-color': getTaskColor(task) }}
                  >
                    <button
                      type="button"
                      className="daily-focus-complete-button"
                      onClick={() => handleCompleteTask(task)}
                      title="Označi kao završeno"
                      aria-label={`Označi kao završeno: ${task.title}`}
                    >
                      <i className="bi bi-check-lg"></i>
                    </button>

                    <div className="daily-focus-task-content">
                      <span className="daily-focus-subject">
                        <span className="daily-focus-subject-dot"></span>
                        {getSubjectName(task)}
                      </span>

                      <strong>{task.title}</strong>

                      <small>{getUrgencyText(task)}</small>
                    </div>

                    <button
                      type="button"
                      className="daily-focus-remove-button"
                      onClick={() => removeTaskFromPlan(todayKey, task.id)}
                      title="Ukloni iz dnevnog fokusa"
                      aria-label={`Ukloni iz dnevnog fokusa: ${task.title}`}
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="daily-focus-placeholder">
                <i className="bi bi-bullseye"></i>
                <p>
                  Još nisi izabrao obaveze za danas. Dodaj predloge sa desne
                  strane.
                </p>
              </div>
            )}
          </div>

          <div className="daily-focus-column">
            <div className="daily-focus-section-heading">
              <h3>Pametni predlozi</h3>
              <span>Rok i prioritet određuju redosled predloga.</span>
            </div>

            <div className="daily-focus-list">
              {recommendedTasks.length > 0 ? (
                recommendedTasks.map((task) => (
                  <article
                    key={task.id}
                    className="daily-focus-task"
                    style={{ '--subject-color': getTaskColor(task) }}
                  >
                    <div className="daily-focus-task-content">
                      <span className="daily-focus-subject">
                        <span className="daily-focus-subject-dot"></span>
                        {getSubjectName(task)}
                      </span>

                      <strong>{task.title}</strong>

                      <small>{getUrgencyText(task)}</small>
                    </div>

                    <button
                      type="button"
                      className="daily-focus-add-button"
                      onClick={() => handleAddToPlan(task)}
                      disabled={plannedTasks.length >= maxDailyTasks}
                      title="Dodaj u dnevni fokus"
                    >
                      <i className="bi bi-plus-lg"></i>
                      Dodaj
                    </button>
                  </article>
                ))
              ) : (
                <div className="daily-focus-placeholder">
                  <i className="bi bi-check2-all"></i>
                  <p>Sve aktivne obaveze su već dodate u današnji fokus.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default DailyFocusPanel