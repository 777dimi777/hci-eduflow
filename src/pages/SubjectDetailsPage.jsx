import { Link, useParams } from 'react-router'
import { useMemo } from 'react'
import TaskStatusBadge from '../components/TaskStatusBadge'
import { useAcademic } from '../context/AcademicContext'
import { useMaterials } from '../context/MaterialContext'
import { useSubjects } from '../context/SubjectContext'
import { useTasks } from '../context/TaskContext'
import { formatDate } from '../utils/dateUtils'
import {
  formatMaterialDate,
  getMaterialType,
} from '../utils/materialUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLocaleLowerCase('sr-RS')
}

function SubjectDetailsPage() {
  const { subjectId } = useParams()

  const { subjects } = useSubjects()
  const { tasks, updateTaskStatus } = useTasks()
  const { materials } = useMaterials()
  const { passedExams } = useAcademic()

  const subject = subjects.find(
    (item) => Number(item.id) === Number(subjectId)
  )

  const subjectData = useMemo(() => {
    if (!subject) {
      return null
    }

    const subjectTasks = tasks
      .filter((task) => Number(task.subjectId) === Number(subject.id))
      .sort((firstTask, secondTask) =>
        firstTask.dueDate.localeCompare(secondTask.dueDate)
      )

    const activeTasks = subjectTasks.filter(
      (task) => task.status !== 'done'
    )

    const completedTasks = subjectTasks.filter(
      (task) => task.status === 'done'
    )

    const subjectMaterials = materials
      .filter(
        (material) => Number(material.subjectId) === Number(subject.id)
      )
      .sort((firstMaterial, secondMaterial) =>
        secondMaterial.createdAt.localeCompare(firstMaterial.createdAt)
      )

    const passedExam = passedExams.find((exam) => {
      const sameSubjectId =
        exam.subjectId !== null &&
        exam.subjectId !== undefined &&
        Number(exam.subjectId) === Number(subject.id)

      const sameCode =
        exam.code &&
        subject.code &&
        normalizeText(exam.code) === normalizeText(subject.code)

      const sameName =
        exam.name &&
        subject.name &&
        normalizeText(exam.name) === normalizeText(subject.name)

      return sameSubjectId || sameCode || sameName
    })

    const calculatedProgress =
      subjectTasks.length > 0
        ? Math.round((completedTasks.length / subjectTasks.length) * 100)
        : Number(subject.progress || 0)

    return {
      subjectTasks,
      activeTasks,
      completedTasks,
      subjectMaterials,
      passedExam,
      calculatedProgress,
      nextTask: activeTasks[0] || null,
    }
  }, [subject, tasks, materials, passedExams])

  if (!subject || !subjectData) {
    return (
      <section className="subject-details-page">
        <div className="subject-details-not-found">
          <i className="bi bi-journal-x"></i>
          <h1>Predmet nije pronađen</h1>
          <p>Možda je predmet obrisan ili link više nije važeći.</p>

          <Link to="/subjects" className="green-button">
            <i className="bi bi-arrow-left"></i>
            Nazad na predmete
          </Link>
        </div>
      </section>
    )
  }

  const subjectColor = getSubjectColorValue(subject.color)

  function handleCompleteTask(taskId) {
    updateTaskStatus(taskId, 'done')
  }

  return (
    <section
      className="subject-details-page"
      style={{
        '--subject-color': subjectColor,
      }}
    >
      <div className="subject-details-back-row">
        <Link to="/subjects" className="subject-details-back-link">
          <i className="bi bi-arrow-left"></i>
          Svi predmeti
        </Link>
      </div>

      <section className="subject-details-hero">
        <div className="subject-details-hero-main">
          <div className="subject-details-icon">
            <i className="bi bi-book"></i>
          </div>

          <div>
            <p className="page-eyebrow">{subject.code}</p>
            <h1>{subject.name}</h1>

            <p>
              <i className="bi bi-person"></i>
              {subject.professor}
            </p>
          </div>
        </div>

        <div className="subject-details-hero-actions">
          <Link to="/tasks" className="outline-button">
            <i className="bi bi-plus-lg"></i>
            Dodaj obavezu
          </Link>

          <Link to="/materials" className="green-button">
            <i className="bi bi-folder2-open"></i>
            Materijali
          </Link>
        </div>
      </section>

      <div className="subject-details-summary-grid">
        <article className="subject-details-summary-card">
          <span>Napredak</span>
          <strong>{subjectData.calculatedProgress}%</strong>

          <div className="subject-details-progress-track">
            <span
              style={{
                width: `${subjectData.calculatedProgress}%`,
              }}
            ></span>
          </div>
        </article>

        <article className="subject-details-summary-card">
          <span>Aktivne obaveze</span>
          <strong>{subjectData.activeTasks.length}</strong>
          <small>Od ukupno {subjectData.subjectTasks.length}</small>
        </article>

        <article className="subject-details-summary-card">
          <span>Semestar i ESPB</span>
          <strong>{subject.semester}. semestar</strong>
          <small>{subject.ects} ESPB bodova</small>
        </article>

        <article className="subject-details-summary-card">
          <span>Status ispita</span>

          {subjectData.passedExam ? (
            <>
              <strong className="subject-details-passed-grade">
                {subjectData.passedExam.grade}
              </strong>
              <small>
                Položeno {formatDate(subjectData.passedExam.passedDate)}
              </small>
            </>
          ) : (
            <>
              <strong>—</strong>
              <small>Ispit još nije evidentiran</small>
            </>
          )}
        </article>
      </div>

      <div className="subject-details-layout">
        <section className="subject-details-tasks-card">
          <div className="subject-details-card-heading">
            <div>
              <p className="page-eyebrow">OBAVEZE</p>
              <h2>Plan rada za predmet</h2>
            </div>

            <span>{subjectData.activeTasks.length} aktivno</span>
          </div>

          {subjectData.nextTask && (
            <div className="subject-details-next-task">
              <div>
                <span>SLEDEĆI ROK</span>
                <strong>{subjectData.nextTask.title}</strong>
                <small>
                  <i className="bi bi-calendar3"></i>
                  {formatDate(subjectData.nextTask.dueDate)}
                </small>
              </div>

              <TaskStatusBadge status={subjectData.nextTask.status} />
            </div>
          )}

          {subjectData.subjectTasks.length > 0 ? (
            <div className="subject-details-task-list">
              {subjectData.subjectTasks.map((task) => (
                <article
                  className={[
                    'subject-details-task-item',
                    task.status === 'done'
                      ? 'subject-details-task-item-done'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={task.id}
                >
                  <button
                    type="button"
                    className="subject-details-task-check"
                    onClick={() =>
                      updateTaskStatus(
                        task.id,
                        task.status === 'done' ? 'todo' : 'done'
                      )
                    }
                    title={
                      task.status === 'done'
                        ? 'Vrati među aktivne obaveze'
                        : 'Označi kao završeno'
                    }
                  >
                    <i
                      className={`bi ${
                        task.status === 'done'
                          ? 'bi-check-circle-fill'
                          : 'bi-circle'
                      }`}
                    ></i>
                  </button>

                  <div className="subject-details-task-content">
                    <strong>{task.title}</strong>

                    <span>
                      <i className="bi bi-calendar3"></i>
                      {formatDate(task.dueDate)}
                    </span>

                    {task.notes && <p>{task.notes}</p>}
                  </div>

                  <TaskStatusBadge status={task.status} />
                </article>
              ))}
            </div>
          ) : (
            <div className="subject-details-empty">
              <i className="bi bi-check2-all"></i>
              <h3>Nema obaveza za ovaj predmet</h3>
              <p>Dodaj prvi task i napravi konkretan plan rada.</p>
            </div>
          )}
        </section>

        <aside className="subject-details-side-column">
          <section className="subject-details-materials-card">
            <div className="subject-details-card-heading">
              <div>
                <p className="page-eyebrow">MATERIJALI</p>
                <h2>Beleške i izvori</h2>
              </div>

              <span>{subjectData.subjectMaterials.length}</span>
            </div>

            {subjectData.subjectMaterials.length > 0 ? (
              <div className="subject-details-material-list">
                {subjectData.subjectMaterials.slice(0, 5).map((material) => {
                  const materialType = getMaterialType(material.type)

                  return (
                    <article
                      className="subject-details-material-item"
                      key={material.id}
                    >
                      <div>
                        <i className={`bi ${materialType.icon}`}></i>
                      </div>

                      <span>
                        <strong>{material.title}</strong>
                        <small>
                          {materialType.label} ·{' '}
                          {formatMaterialDate(material.createdAt)}
                        </small>
                      </span>

                      {material.url && (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Otvori materijal"
                        >
                          <i className="bi bi-box-arrow-up-right"></i>
                        </a>
                      )}
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="subject-details-mini-empty">
                <i className="bi bi-folder-plus"></i>
                <p>Još nema materijala za ovaj predmet.</p>
              </div>
            )}

            <Link to="/materials" className="subject-details-panel-link">
              Otvori biblioteku
              <i className="bi bi-arrow-right"></i>
            </Link>
          </section>

          <section className="subject-details-focus-card">
            <div className="subject-details-focus-icon">
              <i className="bi bi-lightbulb"></i>
            </div>

            <p className="page-eyebrow">SAVET ZA UČENJE</p>

            {subjectData.activeTasks.length > 0 ? (
              <>
                <h2>Fokusiraj se na sledeći rok</h2>
                <p>
                  Predmet trenutno ima{' '}
                  <strong>{subjectData.activeTasks.length}</strong> aktivne
                  obaveze. Počni od najbližeg roka i podeli gradivo na manje
                  korake.
                </p>
              </>
            ) : (
              <>
                <h2>Predmet je pod kontrolom</h2>
                <p>
                  Trenutno nema aktivnih obaveza. Dodaj sledeći korak čim dobiješ
                  novi rok ili materijal.
                </p>
              </>
            )}
          </section>
        </aside>
      </div>
    </section>
  )
}

export default SubjectDetailsPage