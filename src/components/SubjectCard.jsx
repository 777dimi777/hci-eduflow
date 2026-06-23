import { Link } from 'react-router'
import { useTasks } from '../context/TaskContext'
import { formatDate } from '../utils/dateUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

function SubjectCard({ subject, onDelete, onEdit, isDeleting }) {
  const { tasks } = useTasks()

  const activeTasks = tasks.filter(
    (task) => task.subjectId === subject.id && task.status !== 'done'
  )

  const nextTask = [...activeTasks].sort((firstTask, secondTask) =>
    firstTask.dueDate.localeCompare(secondTask.dueDate)
  )[0]

  return (
    <article
      className={[
        'subject-card',
        isDeleting ? 'subject-card-leaving' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        '--subject-color': getSubjectColorValue(subject.color),
      }}
    >
      <div className="subject-card-header">
        <div className="subject-code-wrapper">
          <span className="subject-color-dot"></span>
          <span className="subject-code">{subject.code}</span>
        </div>

        <div className="subject-card-actions">
          <button
            type="button"
            className="subject-edit-button"
            onClick={() => onEdit(subject)}
            aria-label={`Izmeni predmet ${subject.name}`}
            title="Izmeni predmet"
            disabled={isDeleting}
          >
            <i className="bi bi-pencil-square"></i>
          </button>

          <button
            type="button"
            className="subject-delete-button"
            onClick={() => onDelete(subject)}
            aria-label={`Obriši predmet ${subject.name}`}
            title="Obriši predmet"
            disabled={isDeleting}
          >
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      </div>

      <h2>{subject.name}</h2>

      <p className="subject-professor">
        <i className="bi bi-person"></i>
        {subject.professor}
      </p>

      <div className="subject-meta">
        <span>
          <i className="bi bi-calendar3"></i>
          {subject.semester}. semestar
        </span>

        <span>
          <i className="bi bi-award"></i>
          {subject.ects} ESPB
        </span>
      </div>

      <div className="subject-progress-block">
        <div className="subject-progress-label">
          <span>Napredak</span>
          <strong>{subject.progress}%</strong>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${subject.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="subject-card-footer">
        <span>
          <i className="bi bi-list-task"></i>
          {activeTasks.length} aktivne obaveze
        </span>

        <span>
          <i className="bi bi-clock"></i>
          {nextTask ? formatDate(nextTask.dueDate) : 'Nema roka'}
        </span>
      </div>

      <Link
        to={`/subjects/${subject.id}`}
        className="subject-detail-link"
      >
        Otvori detalje
        <i className="bi bi-arrow-right"></i>
      </Link>
    </article>
  )
}

export default SubjectCard