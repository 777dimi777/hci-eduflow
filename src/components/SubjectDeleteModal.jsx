import { useEffect } from 'react'

function SubjectDeleteModal({
  subject,
  linkedTasks,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isDeleting) {
        onCancel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isDeleting, onCancel])

  if (!subject) {
    return null
  }

  const taskCount = linkedTasks.length

  return (
    <div
      className="subject-delete-modal-backdrop"
      role="presentation"
      onMouseDown={() => {
        if (!isDeleting) {
          onCancel()
        }
      }}
    >
      <section
        className="subject-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-subject-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="subject-delete-modal-icon">
          <i className="bi bi-exclamation-triangle-fill"></i>
        </div>

        <p className="page-eyebrow">POTVRDA BRISANJA</p>

        <h2 id="delete-subject-title">
          Obriši predmet?
        </h2>

        <p className="subject-delete-modal-text">
          Predmet <strong>„{subject.name}“</strong> biće uklonjen iz
          aktivnog planera.
        </p>

        <div className="subject-delete-impact-card">
          <div>
            <i className="bi bi-list-task"></i>

            <span>
              {taskCount === 0
                ? 'Nema povezanih obaveza.'
                : taskCount === 1
                  ? 'Biće obrisana 1 povezana obaveza.'
                  : `Biće obrisano ${taskCount} povezane obaveze.`}
            </span>
          </div>

          <p>
            Te obaveze će nestati iz stranice Obaveze, Kalendara i Dnevnog
            fokusa.
          </p>
        </div>

        <p className="subject-delete-history-note">
          <i className="bi bi-info-circle"></i>
          Položeni ispit ostaje u akademskoj evidenciji, jer predstavlja
          istorijski zapis.
        </p>

        {taskCount > 0 && (
          <div className="subject-delete-task-preview">
            <span>Povezane obaveze:</span>

            <ul>
              {linkedTasks.slice(0, 3).map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>

            {taskCount > 3 && (
              <small>+ još {taskCount - 3} obaveza</small>
            )}
          </div>
        )}

        <div className="subject-delete-modal-actions">
          <button
            type="button"
            className="outline-button"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Otkaži
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            <i className={`bi ${isDeleting ? 'bi-arrow-repeat' : 'bi-trash3'}`}></i>
            {isDeleting ? 'Brisanje...' : 'Obriši predmet'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default SubjectDeleteModal