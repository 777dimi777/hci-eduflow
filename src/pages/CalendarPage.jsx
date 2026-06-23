import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import TaskStatusBadge from '../components/TaskStatusBadge'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import {
  formatDate,
  formatLongDate,
  formatMonthTitle,
  getCalendarDays,
  toDateKey,
  weekDayLabels,
} from '../utils/dateUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

const priorityLabels = {
  high: 'Visok prioritet',
  medium: 'Srednji prioritet',
  low: 'Nizak prioritet',
}

function CalendarPage() {
  const { subjects } = useSubjects()
  const { tasks } = useTasks()

  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()

    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  const [selectedDate, setSelectedDate] = useState(() => toDateKey(new Date()))

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }, [subjects])

  const calendarDays = useMemo(() => {
    return getCalendarDays(calendarMonth)
  }, [calendarMonth])

  const tasksByDate = useMemo(() => {
    const groupedTasks = new Map()

    tasks.forEach((task) => {
      if (!groupedTasks.has(task.dueDate)) {
        groupedTasks.set(task.dueDate, [])
      }

      groupedTasks.get(task.dueDate).push(task)
    })

    groupedTasks.forEach((dateTasks) => {
      dateTasks.sort((firstTask, secondTask) =>
        firstTask.title.localeCompare(secondTask.title, 'sr')
      )
    })

    return groupedTasks
  }, [tasks])

  const selectedDayTasks = tasksByDate.get(selectedDate) || []
  const todayKey = toDateKey(new Date())

  function getSubjectLabel(subjectId) {
    const subject = subjectMap.get(subjectId)

    return subject
      ? `${subject.code} — ${subject.name}`
      : 'Obrisani predmet'
  }

  function getTaskColor(task) {
    const subject = subjectMap.get(task.subjectId)

    return subject ? getSubjectColorValue(subject.color) : '#94a3b8'
  }

  function handleDayClick(day) {
    setSelectedDate(day.dateKey)

    if (!day.isCurrentMonth) {
      setCalendarMonth(
        new Date(day.date.getFullYear(), day.date.getMonth(), 1)
      )
    }
  }

  function changeMonth(offset) {
    const nextMonth = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth() + offset,
      1
    )

    setCalendarMonth(nextMonth)
    setSelectedDate(toDateKey(nextMonth))
  }

  function goToToday() {
    const today = new Date()

    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelectedDate(toDateKey(today))
  }

  return (
    <section className="calendar-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">PLANIRANJE ROKOVA</p>
          <h1>Kalendar</h1>
          <p className="page-description">
            Klikni na bilo koji dan i odmah pogledaj obaveze, rokove i prioritete.
          </p>
        </div>

        <Link to="/tasks" className="green-button">
          <i className="bi bi-plus-lg"></i>
          Dodaj obavezu
        </Link>
      </div>

      <div className="calendar-layout">
        <section className="calendar-main-card">
          <div className="calendar-controls">
            <div className="calendar-month-navigation">
              <button
                type="button"
                className="month-navigation-button"
                onClick={() => changeMonth(-1)}
                aria-label="Prethodni mesec"
              >
                <i className="bi bi-chevron-left"></i>
              </button>

              <h2>{formatMonthTitle(calendarMonth)}</h2>

              <button
                type="button"
                className="month-navigation-button"
                onClick={() => changeMonth(1)}
                aria-label="Sledeći mesec"
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>

            <button
              type="button"
              className="today-button"
              onClick={goToToday}
            >
              <i className="bi bi-calendar-check"></i>
              Danas
            </button>
          </div>

          <div className="calendar-grid-wrapper">
            <div className="calendar-weekdays">
              {weekDayLabels.map((dayLabel) => (
                <span key={dayLabel}>{dayLabel}</span>
              ))}
            </div>

            <div className="calendar-grid">
              {calendarDays.map((day) => {
                const dayTasks = tasksByDate.get(day.dateKey) || []
                const isSelected = selectedDate === day.dateKey
                const isToday = todayKey === day.dateKey

                return (
                  <button
                    type="button"
                    key={day.dateKey}
                    onClick={() => handleDayClick(day)}
                    className={[
                      'calendar-day',
                      !day.isCurrentMonth ? 'calendar-day-other-month' : '',
                      isSelected ? 'calendar-day-selected' : '',
                      isToday ? 'calendar-day-today' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span className="calendar-day-number">
                      {day.date.getDate()}
                    </span>

                    <div className="calendar-event-list">
                      {dayTasks.slice(0, 2).map((task) => (
                        <span
                          key={task.id}
                          className="calendar-event"
                          style={{
                            '--event-color': getTaskColor(task),
                          }}
                        >
                          {task.title}
                        </span>
                      ))}

                      {dayTasks.length > 2 && (
                        <span className="calendar-event-overflow">
                          + još {dayTasks.length - 2}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="calendar-legend">
            <span className="calendar-legend-title">Predmeti:</span>

            {subjects.slice(0, 7).map((subject) => (
              <span className="calendar-legend-item" key={subject.id}>
                <span
                  className="calendar-legend-dot"
                  style={{
                    backgroundColor: getSubjectColorValue(subject.color),
                  }}
                ></span>
                {subject.code}
              </span>
            ))}
          </div>
        </section>

        <aside className="calendar-day-details">
          <div className="selected-day-heading">
            <p className="page-eyebrow">IZABRANI DAN</p>
            <h2>{formatLongDate(selectedDate)}</h2>

            <span className="selected-day-count">
              {selectedDayTasks.length === 1
                ? '1 obaveza'
                : `${selectedDayTasks.length} obaveza`}
            </span>
          </div>

          {selectedDayTasks.length > 0 ? (
            <div className="selected-day-task-list">
              {selectedDayTasks.map((task) => (
                <article
                  key={task.id}
                  className="calendar-detail-task"
                  style={{
                    '--event-color': getTaskColor(task),
                  }}
                >
                  <div className="calendar-detail-task-top">
                    <span className="calendar-detail-subject">
                      <span className="calendar-detail-subject-dot"></span>
                      {getSubjectLabel(task.subjectId)}
                    </span>

                    <TaskStatusBadge status={task.status} />
                  </div>

                  <h3>{task.title}</h3>

                  {task.notes && (
                    <p className="calendar-detail-notes">{task.notes}</p>
                  )}

                  <div className="calendar-detail-meta">
                    <span>
                      <i className="bi bi-calendar3"></i>
                      {formatDate(task.dueDate)}
                    </span>

                    <span
                      className={`calendar-priority calendar-priority-${task.priority}`}
                    >
                      <i className="bi bi-flag"></i>
                      {priorityLabels[task.priority]}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="calendar-empty-day">
              <div className="calendar-empty-icon">
                <i className="bi bi-cup-hot"></i>
              </div>

              <h3>Nema obaveza za ovaj dan</h3>

              <p>
                Iskoristi slobodan dan za odmor, ponavljanje gradiva ili planiranje
                sledećih koraka.
              </p>

              <Link to="/tasks" className="panel-link">
                Dodaj novu obavezu
                <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default CalendarPage