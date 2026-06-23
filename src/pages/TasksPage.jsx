import { useMemo, useState } from 'react'
import TaskForm from '../components/TaskForm'
import TaskStatusBadge from '../components/TaskStatusBadge'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import { formatDate } from '../utils/dateUtils'

const priorityLabels = {
  high: 'Visok',
  medium: 'Srednji',
  low: 'Nizak',
}

const priorityOrder = {
  high: 1,
  medium: 2,
  low: 3,
}

const statusOrder = {
  todo: 1,
  'in-progress': 2,
  done: 3,
}

function SortableHeader({ label, sortKey, sortConfig, onSort }) {
  const isActive = sortConfig.key === sortKey

  let iconClass = 'bi-arrow-down-up'

  if (isActive && sortConfig.direction === 'asc') {
    iconClass = 'bi-arrow-up'
  }

  if (isActive && sortConfig.direction === 'desc') {
    iconClass = 'bi-arrow-down'
  }

  return (
    <button
      type="button"
      className={`sortable-header ${isActive ? 'sortable-header-active' : ''}`}
      onClick={() => onSort(sortKey)}
      title={`Sortiraj po koloni: ${label}`}
    >
      <span>{label}</span>
      <i className={`bi ${iconClass}`}></i>
    </button>
  )
}

function TasksPage() {
  const { subjects } = useSubjects()
  const { tasks, addTask, updateTaskStatus, deleteTask } = useTasks()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showForm, setShowForm] = useState(false)

  const [sortConfig, setSortConfig] = useState({
    key: 'dueDate',
    direction: 'asc',
  })

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }, [subjects])

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    const matchingTasks = tasks.filter((task) => {
      const subject = subjectMap.get(task.subjectId)

      const matchesSearch =
        task.title.toLowerCase().includes(normalizedSearch) ||
        task.notes.toLowerCase().includes(normalizedSearch) ||
        subject?.name.toLowerCase().includes(normalizedSearch) ||
        subject?.code.toLowerCase().includes(normalizedSearch)

      const matchesSubject =
        selectedSubject === 'all' ||
        task.subjectId === Number(selectedSubject)

      const matchesStatus =
        selectedStatus === 'all' || task.status === selectedStatus

      const matchesPriority =
        selectedPriority === 'all' || task.priority === selectedPriority

      return (
        matchesSearch &&
        matchesSubject &&
        matchesStatus &&
        matchesPriority
      )
    })

    return matchingTasks.sort((firstTask, secondTask) => {
      let firstValue
      let secondValue

      if (sortConfig.key === 'title') {
        firstValue = firstTask.title
        secondValue = secondTask.title
      } else if (sortConfig.key === 'subject') {
        firstValue = subjectMap.get(firstTask.subjectId)?.name || ''
        secondValue = subjectMap.get(secondTask.subjectId)?.name || ''
      } else if (sortConfig.key === 'dueDate') {
        firstValue = firstTask.dueDate
        secondValue = secondTask.dueDate
      } else if (sortConfig.key === 'priority') {
        firstValue = priorityOrder[firstTask.priority]
        secondValue = priorityOrder[secondTask.priority]
      } else {
        firstValue = statusOrder[firstTask.status]
        secondValue = statusOrder[secondTask.status]
      }

      let comparison

      if (typeof firstValue === 'number') {
        comparison = firstValue - secondValue
      } else {
        comparison = firstValue.localeCompare(secondValue, 'sr')
      }

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [
    tasks,
    searchTerm,
    selectedSubject,
    selectedStatus,
    selectedPriority,
    sortConfig,
    subjectMap,
  ])

  function handleSort(sortKey) {
    setSortConfig((previousConfig) => {
      if (previousConfig.key === sortKey) {
        return {
          key: sortKey,
          direction: previousConfig.direction === 'asc' ? 'desc' : 'asc',
        }
      }

      return {
        key: sortKey,
        direction: 'asc',
      }
    })
  }

  function handleAddTask(newTask) {
    addTask(newTask)
    setShowForm(false)
  }

  function handleDeleteTask(task) {
    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš obavezu "${task.title}"?`
    )

    if (confirmed) {
      deleteTask(task.id)
    }
  }

  return (
    <section className="tasks-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">PLANIRANJE UČENJA</p>
          <h1>Obaveze</h1>
          <p className="page-description">
            Upravljaj rokovima, prioritetima i statusima obaveza po predmetima.
          </p>
        </div>

        <button
          type="button"
          className="green-button"
          onClick={() => setShowForm((previousValue) => !previousValue)}
        >
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showForm ? 'Zatvori formu' : 'Dodaj obavezu'}
        </button>
      </div>

      {showForm && (
        <div className="task-form-wrapper">
          <TaskForm
            subjects={subjects}
            onSave={handleAddTask}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="tasks-toolbar">
        <div className="tasks-search-box">
          <i className="bi bi-search"></i>

          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pretraži obaveze, predmete ili napomene..."
            aria-label="Pretraga obaveza"
          />
        </div>

        <select
          className="task-filter-select"
          value={selectedSubject}
          onChange={(event) => setSelectedSubject(event.target.value)}
        >
          <option value="all">Svi predmeti</option>

          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.code}
            </option>
          ))}
        </select>

        <select
          className="task-filter-select"
          value={selectedStatus}
          onChange={(event) => setSelectedStatus(event.target.value)}
        >
          <option value="all">Svi statusi</option>
          <option value="todo">Nije početo</option>
          <option value="in-progress">U toku</option>
          <option value="done">Završeno</option>
        </select>

        <select
          className="task-filter-select"
          value={selectedPriority}
          onChange={(event) => setSelectedPriority(event.target.value)}
        >
          <option value="all">Svi prioriteti</option>
          <option value="high">Visok</option>
          <option value="medium">Srednji</option>
          <option value="low">Nizak</option>
        </select>
      </div>

      <p className="tasks-summary">
        Prikazano: <strong>{filteredTasks.length}</strong> od{' '}
        <strong>{tasks.length}</strong> obaveza. Klikni na naziv kolone za
        sortiranje.
      </p>

      {filteredTasks.length > 0 ? (
        <div className="tasks-table-card">
          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>
                    <SortableHeader
                      label="Obaveza"
                      sortKey="title"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th>
                    <SortableHeader
                      label="Predmet"
                      sortKey="subject"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th>
                    <SortableHeader
                      label="Rok"
                      sortKey="dueDate"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th>
                    <SortableHeader
                      label="Prioritet"
                      sortKey="priority"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th>
                    <SortableHeader
                      label="Status"
                      sortKey="status"
                      sortConfig={sortConfig}
                      onSort={handleSort}
                    />
                  </th>

                  <th className="task-actions-header">Akcije</th>
                </tr>
              </thead>

              <tbody>
                {filteredTasks.map((task) => {
                  const subject = subjectMap.get(task.subjectId)

                  return (
                    <tr key={task.id}>
                      <td>
                        <div className="task-title-cell">
                          <strong>{task.title}</strong>

                          {task.notes && <span>{task.notes}</span>}
                        </div>
                      </td>

                      <td>
                        <span className="task-subject-cell">
                          <span className="task-subject-dot"></span>
                          {subject
                            ? `${subject.code} — ${subject.name}`
                            : 'Obrisani predmet'}
                        </span>
                      </td>

                      <td className="task-date-cell">
                        <i className="bi bi-calendar3"></i>
                        {formatDate(task.dueDate)}
                      </td>

                      <td>
                        <span
                          className={`task-priority-badge task-priority-${task.priority}`}
                        >
                          {priorityLabels[task.priority]}
                        </span>
                      </td>

                      <td>
                        <div className="task-status-cell">
                          <TaskStatusBadge status={task.status} />

                          <select
                            className="task-status-select"
                            value={task.status}
                            onChange={(event) =>
                              updateTaskStatus(task.id, event.target.value)
                            }
                            aria-label={`Promeni status obaveze ${task.title}`}
                          >
                            <option value="todo">Nije početo</option>
                            <option value="in-progress">U toku</option>
                            <option value="done">Završeno</option>
                          </select>
                        </div>
                      </td>

                      <td className="task-actions-cell">
                        <button
                          type="button"
                          className="task-delete-button"
                          onClick={() => handleDeleteTask(task)}
                          title="Obriši obavezu"
                          aria-label={`Obriši obavezu ${task.title}`}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="tasks-empty-state">
          <i className="bi bi-clipboard-x"></i>
          <h2>Nema pronađenih obaveza</h2>
          <p>Promeni filtere, pretragu ili dodaj novu obavezu.</p>
        </div>
      )}
    </section>
  )
}

export default TasksPage