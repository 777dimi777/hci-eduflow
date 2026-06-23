import { useMemo, useState } from 'react'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import { formatDate, toDateKey } from '../utils/dateUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

const weekDayLabels = [
  'Ned',
  'Pon',
  'Uto',
  'Sre',
  'Čet',
  'Pet',
  'Sub',
]

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
}

const priorityLabels = {
  high: 'Visok',
  medium: 'Srednji',
  low: 'Nizak',
}

function createWeekDays(startDate) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate)

    date.setDate(startDate.getDate() + index)

    return {
      date,
      dateKey: toDateKey(date),
      dayNumber: date.getDate(),
      label: weekDayLabels[date.getDay()],
      fullLabel: date.toLocaleDateString('sr-RS', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    }
  })
}

function WeeklyWorkloadPanel() {
  const { tasks } = useTasks()
  const { subjects } = useSubjects()

  const [weekStart] = useState(() => {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    return today
  })

  const [selectedDateKey, setSelectedDateKey] = useState(() =>
    toDateKey(weekStart)
  )

  const todayKey = toDateKey(weekStart)

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }, [subjects])

  const weekDays = useMemo(() => {
    return createWeekDays(weekStart)
  }, [weekStart])

  const weeklyWorkload = useMemo(() => {
    return weekDays.map((day) => {
      const dayTasks = tasks
        .filter(
          (task) =>
            task.status !== 'done' && task.dueDate === day.dateKey
        )
        .sort((firstTask, secondTask) => {
          const priorityDifference =
            priorityOrder[firstTask.priority] -
            priorityOrder[secondTask.priority]

          if (priorityDifference !== 0) {
            return priorityDifference
          }

          return firstTask.title.localeCompare(secondTask.title, 'sr')
        })

      return {
        ...day,
        tasks: dayTasks,
      }
    })
  }, [tasks, weekDays])

  const maxTaskCount = Math.max(
    ...weeklyWorkload.map((day) => day.tasks.length),
    1
  )

  const selectedDay =
    weeklyWorkload.find(
      (day) => day.dateKey === selectedDateKey
    ) || weeklyWorkload[0]

  const overdueTasks = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.status !== 'done' &&
          task.dueDate &&
          task.dueDate < todayKey
      )
      .sort((firstTask, secondTask) =>
        firstTask.dueDate.localeCompare(secondTask.dueDate)
      )
  }, [tasks, todayKey])

  function getSubject(task) {
    return subjectMap.get(Number(task.subjectId))
  }

  function getTaskColor(task) {
    const subject = getSubject(task)

    return subject
      ? getSubjectColorValue(subject.color)
      : '#64748b'
  }

  function getSubjectLabel(task) {
    const subject = getSubject(task)

    return subject
      ? `${subject.code} — ${subject.name}`
      : task.taskType === 'exam'
        ? 'Ispit iz rasporeda'
        : 'Nepovezana obaveza'
  }

  return (
    <section className="weekly-workload-panel">
      <div className="weekly-workload-heading">
        <div>
          <p className="page-eyebrow">PLAN RADA</p>
          <h2>Narednih 7 dana</h2>
          <p>
            Klikni na dan da vidiš aktivne obaveze i rokove za taj datum.
          </p>
        </div>

        <span className="weekly-workload-total">
          {weeklyWorkload.reduce(
            (sum, day) => sum + day.tasks.length,
            0
          )}{' '}
          obaveza
        </span>
      </div>

      <div className="weekly-workload-layout">
        <div className="weekly-workload-chart">
          {weeklyWorkload.map((day) => {
            const isSelected = selectedDay.dateKey === day.dateKey
            const isToday = todayKey === day.dateKey

            const barHeight =
              day.tasks.length === 0
                ? 4
                : Math.max(
                    16,
                    (day.tasks.length / maxTaskCount) * 100
                  )

            return (
              <button
                type="button"
                key={day.dateKey}
                className={[
                  'weekly-workload-day',
                  isSelected ? 'weekly-workload-day-selected' : '',
                  isToday ? 'weekly-workload-day-today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setSelectedDateKey(day.dateKey)}
                title={`${day.fullLabel}: ${day.tasks.length} obaveza`}
                aria-pressed={isSelected}
              >
                <span className="weekly-workload-day-label">
                  {isToday ? 'Danas' : day.label}
                </span>

                <strong>{day.dayNumber}</strong>

                <div className="weekly-workload-bar-track">
                  <span
                    style={{
                      height: `${barHeight}%`,
                    }}
                  ></span>
                </div>

                <small>
                  {day.tasks.length === 1
                    ? '1 obaveza'
                    : `${day.tasks.length} obaveza`}
                </small>
              </button>
            )
          })}
        </div>

        <aside className="weekly-workload-details">
          <div className="weekly-workload-details-heading">
            <div>
              <p className="page-eyebrow">IZABRANI DAN</p>
              <h3>{selectedDay.fullLabel}</h3>
            </div>

            <span>{selectedDay.tasks.length}</span>
          </div>

          {selectedDay.tasks.length > 0 ? (
            <div className="weekly-workload-task-list">
              {selectedDay.tasks.map((task) => (
                <article
                  key={task.id}
                  className="weekly-workload-task"
                  style={{
                    '--subject-color': getTaskColor(task),
                  }}
                >
                  <span className="weekly-workload-task-dot"></span>

                  <div>
                    <small>{getSubjectLabel(task)}</small>
                    <strong>{task.title}</strong>

                    {task.notes && <p>{task.notes}</p>}
                  </div>

                  <span
                    className={`weekly-workload-priority weekly-workload-priority-${task.priority}`}
                  >
                    {priorityLabels[task.priority]}
                  </span>
                </article>
              ))}
            </div>
          ) : (
            <div className="weekly-workload-empty">
              <i className="bi bi-calendar-check"></i>
              <h3>Slobodan dan</h3>
              <p>
                Nema aktivnih obaveza za ovaj datum. Možeš ga iskoristiti za
                ponavljanje, odmor ili unapred pripremu gradiva.
              </p>
            </div>
          )}
        </aside>
      </div>

      {overdueTasks.length > 0 ? (
        <div className="weekly-overdue-alert">
          <div>
            <i className="bi bi-exclamation-triangle-fill"></i>

            <span>
              Imaš <strong>{overdueTasks.length}</strong>{' '}
              {overdueTasks.length === 1
                ? 'prekoračenu obavezu'
                : 'prekoračenih obaveza'}
              .
            </span>
          </div>

          <p>
            Najstariji rok: {formatDate(overdueTasks[0].dueDate)} —{' '}
            {overdueTasks[0].title}
          </p>
        </div>
      ) : (
        <div className="weekly-workload-success">
          <i className="bi bi-check-circle-fill"></i>
          Nema prekoračenih rokova. Sve aktivne obaveze su u planu.
        </div>
      )}
    </section>
  )
}

export default WeeklyWorkloadPanel