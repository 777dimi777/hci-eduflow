import { useMemo, useState } from 'react'
import PassedExamForm from '../components/PassedExamForm'
import { useAcademic } from '../context/AcademicContext'
import { useSubjects } from '../context/SubjectContext'
import { formatDate } from '../utils/dateUtils'
import {
  calculateSimpleAverage,
  calculateTotalEcts,
  calculateWeightedAverage,
  formatAverage,
  getGradeDistribution,
} from '../utils/gradeUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

function ExamSortableHeader({ label, sortKey, sortConfig, onSort }) {
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
    >
      <span>{label}</span>
      <i className={`bi ${iconClass}`}></i>
    </button>
  )
}

function PassedExamsPage() {
  const { subjects } = useSubjects()
  const { passedExams, addPassedExam, deletePassedExam } = useAcademic()

  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({
    key: 'passedDate',
    direction: 'desc',
  })

  const subjectMap = useMemo(() => {
    return new Map(subjects.map((subject) => [subject.id, subject]))
  }, [subjects])

  const weightedAverage = calculateWeightedAverage(passedExams)
  const simpleAverage = calculateSimpleAverage(passedExams)
  const totalEcts = calculateTotalEcts(passedExams)
  const gradeDistribution = getGradeDistribution(passedExams)

  const highestGradeCount = Math.max(
    ...gradeDistribution.map((item) => item.count),
    1
  )

  const filteredExams = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    const matchingExams = passedExams.filter((exam) => {
      return (
        exam.name.toLowerCase().includes(normalizedSearch) ||
        exam.code.toLowerCase().includes(normalizedSearch)
      )
    })

    return matchingExams.sort((firstExam, secondExam) => {
      let firstValue
      let secondValue

      if (sortConfig.key === 'name') {
        firstValue = firstExam.name
        secondValue = secondExam.name
      } else if (sortConfig.key === 'grade') {
        firstValue = Number(firstExam.grade)
        secondValue = Number(secondExam.grade)
      } else if (sortConfig.key === 'ects') {
        firstValue = Number(firstExam.ects)
        secondValue = Number(secondExam.ects)
      } else if (sortConfig.key === 'semester') {
        firstValue = Number(firstExam.semester)
        secondValue = Number(secondExam.semester)
      } else {
        firstValue = firstExam.passedDate
        secondValue = secondExam.passedDate
      }

      const comparison =
        typeof firstValue === 'number'
          ? firstValue - secondValue
          : firstValue.localeCompare(secondValue, 'sr')

      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [passedExams, searchTerm, sortConfig])

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

  function handleSaveExam(examData) {
    const result = addPassedExam(examData)

    if (result.success) {
      setShowForm(false)
    }

    return result
  }

  function handleDeleteExam(exam) {
    const confirmed = window.confirm(
      `Da li sigurno želiš da obrišeš ispit "${exam.name}" iz evidencije položenih ispita?`
    )

    if (confirmed) {
      deletePassedExam(exam.id)
    }
  }

  function getExamColor(exam) {
    const subject = subjectMap.get(Number(exam.subjectId))

    return subject ? getSubjectColorValue(subject.color) : '#94a3b8'
  }

  return (
    <section className="passed-exams-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">AKADEMSKI USPEH</p>
          <h1>Položeni ispiti i prosek</h1>
          <p className="page-description">
            Vodi evidenciju položenih ispita, ESPB bodova i prati prosečnu ocenu.
          </p>
        </div>

        <button
          type="button"
          className="green-button"
          onClick={() => setShowForm((previousValue) => !previousValue)}
        >
          <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showForm ? 'Zatvori formu' : 'Dodaj položen ispit'}
        </button>
      </div>

      {showForm && (
        <div className="exam-form-wrapper">
          <PassedExamForm
            subjects={subjects}
            onSave={handleSaveExam}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="academic-summary-grid">
        <article className="academic-summary-card">
          <div>
            <span>Položeno ispita</span>
            <strong>{passedExams.length}</strong>
          </div>

          <div className="academic-summary-icon">
            <i className="bi bi-patch-check"></i>
          </div>
        </article>

        <article className="academic-summary-card">
          <div>
            <span>Osvojeno ESPB</span>
            <strong>{totalEcts}</strong>
          </div>

          <div className="academic-summary-icon">
            <i className="bi bi-award"></i>
          </div>
        </article>

        <article className="academic-summary-card">
          <div>
            <span>Težinski prosek</span>
            <strong>
              {passedExams.length > 0 ? formatAverage(weightedAverage) : '—'}
            </strong>
          </div>

          <div className="academic-summary-icon">
            <i className="bi bi-bar-chart-line"></i>
          </div>
        </article>

        <article className="academic-summary-card">
          <div>
            <span>Jednostavan prosek</span>
            <strong>
              {passedExams.length > 0 ? formatAverage(simpleAverage) : '—'}
            </strong>
          </div>

          <div className="academic-summary-icon">
            <i className="bi bi-calculator"></i>
          </div>
        </article>
      </div>

      <div className="exams-page-layout">
        <section className="passed-exams-table-card">
          <div className="passed-exams-table-heading">
            <div>
              <p>AKADEMSKA EVIDENCIJA</p>
              <h2>Položeni ispiti</h2>
            </div>

            <div className="exams-search-box">
              <i className="bi bi-search"></i>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Pretraži ispite..."
                aria-label="Pretraga položenih ispita"
              />
            </div>
          </div>

          {filteredExams.length > 0 ? (
            <div className="tasks-table-wrapper">
              <table className="passed-exams-table">
                <thead>
                  <tr>
                    <th>
                      <ExamSortableHeader
                        label="Predmet"
                        sortKey="name"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </th>

                    <th>
                      <ExamSortableHeader
                        label="Ocena"
                        sortKey="grade"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </th>

                    <th>
                      <ExamSortableHeader
                        label="ESPB"
                        sortKey="ects"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </th>

                    <th>
                      <ExamSortableHeader
                        label="Semestar"
                        sortKey="semester"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </th>

                    <th>
                      <ExamSortableHeader
                        label="Položeno"
                        sortKey="passedDate"
                        sortConfig={sortConfig}
                        onSort={handleSort}
                      />
                    </th>

                    <th className="task-actions-header">Akcije</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExams.map((exam) => (
                    <tr key={exam.id}>
                      <td>
                        <div className="passed-exam-subject-cell">
                          <span
                            className="passed-exam-color-dot"
                            style={{
                              backgroundColor: getExamColor(exam),
                            }}
                          ></span>

                          <div>
                            <strong>{exam.name}</strong>
                            <span>{exam.code || 'Bez šifre predmeta'}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`exam-grade-badge exam-grade-${exam.grade}`}>
                          {exam.grade}
                        </span>
                      </td>

                      <td>{exam.ects}</td>

                      <td>{exam.semester}. semestar</td>

                      <td className="passed-exam-date">
                        <i className="bi bi-calendar-check"></i>
                        {formatDate(exam.passedDate)}
                      </td>

                      <td className="task-actions-cell">
                        <button
                          type="button"
                          className="task-delete-button"
                          onClick={() => handleDeleteExam(exam)}
                          title="Obriši iz evidencije"
                          aria-label={`Obriši ispit ${exam.name}`}
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="passed-exams-empty-state">
              <i className="bi bi-journal-check"></i>
              <h2>Još nema unetih položenih ispita</h2>
              <p>
                Dodaj prve ispite kako bi EduFlow izračunao prosek i osvojene ESPB bodove.
              </p>
            </div>
          )}
        </section>

        <aside className="grade-distribution-card">
          <div className="grade-distribution-heading">
            <p>VIZUELNI PREGLED</p>
            <h2>Raspodela ocena</h2>
          </div>

          {passedExams.length > 0 ? (
            <div className="grade-chart">
              {gradeDistribution.map((item) => (
                <div className="grade-chart-column" key={item.grade}>
                  <span className="grade-chart-count">{item.count}</span>

                  <div className="grade-chart-bar-track">
                    <div
                      className="grade-chart-bar"
                      style={{
                        height: `${Math.max(
                          8,
                          (item.count / highestGradeCount) * 100
                        )}%`,
                      }}
                      title={`${item.count} ispita sa ocenom ${item.grade}`}
                    ></div>
                  </div>

                  <strong>{item.grade}</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="grade-chart-empty">
              <i className="bi bi-bar-chart"></i>
              <p>Grafik će se pojaviti nakon prvog unetog ispita.</p>
            </div>
          )}

          <div className="grade-distribution-info">
            <i className="bi bi-info-circle"></i>
            <p>
              Težinski prosek uzima u obzir ESPB bodove, dok jednostavan prosek
              sve ocene tretira jednako.
            </p>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default PassedExamsPage