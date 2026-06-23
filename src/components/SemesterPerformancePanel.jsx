import { useMemo, useState } from 'react'
import { useAcademic } from '../context/AcademicContext'
import { formatDate } from '../utils/dateUtils'
import { formatAverage } from '../utils/gradeUtils'

function calculateSemesterData(exams, semester) {
  const semesterExams = exams.filter(
    (exam) => Number(exam.semester) === Number(semester)
  )

  const totalEcts = semesterExams.reduce(
    (sum, exam) => sum + Number(exam.ects || 0),
    0
  )

  const totalPoints = semesterExams.reduce(
    (sum, exam) =>
      sum + Number(exam.grade || 0) * Number(exam.ects || 0),
    0
  )

  const weightedAverage =
    totalEcts > 0 ? totalPoints / totalEcts : 0

  return {
    semester,
    exams: semesterExams.sort((firstExam, secondExam) =>
      secondExam.passedDate.localeCompare(firstExam.passedDate)
    ),
    totalEcts,
    weightedAverage,
  }
}

function SemesterPerformancePanel() {
  const { passedExams } = useAcademic()

  const availableSemesters = useMemo(() => {
    const semesters = [
      ...new Set(
        passedExams
          .map((exam) => Number(exam.semester))
          .filter((semester) => semester > 0)
      ),
    ]

    return semesters.sort((firstSemester, secondSemester) => {
      return firstSemester - secondSemester
    })
  }, [passedExams])

  const [selectedSemester, setSelectedSemester] = useState(null)

  const semesterData = useMemo(() => {
    return availableSemesters.map((semester) =>
      calculateSemesterData(passedExams, semester)
    )
  }, [availableSemesters, passedExams])

  const resolvedSelectedSemester =
    selectedSemester && availableSemesters.includes(selectedSemester)
      ? selectedSemester
      : availableSemesters[0]

  const selectedSemesterData = semesterData.find(
    (item) => item.semester === resolvedSelectedSemester
  )

  const maxEcts = Math.max(
    ...semesterData.map((item) => item.totalEcts),
    1
  )

  return (
    <section className="semester-performance-panel">
      <div className="semester-performance-heading">
        <div>
          <p className="page-eyebrow">AKADEMSKI PREGLED</p>
          <h2>Uspeh po semestrima</h2>
          <p>
            Klikni na semestar da vidiš položene ispite, prosek i osvojene ESPB bodove.
          </p>
        </div>

        <span className="semester-performance-total">
          {passedExams.length} položenih ispita
        </span>
      </div>

      {semesterData.length > 0 ? (
        <div className="semester-performance-layout">
          <div className="semester-performance-overview">
            {semesterData.map((item) => {
              const isSelected =
                item.semester === resolvedSelectedSemester

              const ectsPercent = Math.max(
                8,
                (item.totalEcts / maxEcts) * 100
              )

              const gradePercent = Math.max(
                8,
                ((item.weightedAverage - 6) / 4) * 100
              )

              return (
                <button
                  type="button"
                  key={item.semester}
                  className={[
                    'semester-performance-card',
                    isSelected
                      ? 'semester-performance-card-selected'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => setSelectedSemester(item.semester)}
                >
                  <div className="semester-performance-card-top">
                    <span>{item.semester}. semestar</span>

                    <strong>
                      {item.exams.length} ispita
                    </strong>
                  </div>

                  <div className="semester-performance-metric">
                    <div>
                      <span>Prosek</span>
                      <strong>{formatAverage(item.weightedAverage)}</strong>
                    </div>

                    <div className="semester-grade-track">
                      <span
                        style={{
                          width: `${gradePercent}%`,
                        }}
                      ></span>
                    </div>
                  </div>

                  <div className="semester-performance-metric">
                    <div>
                      <span>ESPB</span>
                      <strong>{item.totalEcts}</strong>
                    </div>

                    <div className="semester-ects-track">
                      <span
                        style={{
                          width: `${ectsPercent}%`,
                        }}
                      ></span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <aside className="semester-performance-details">
            {selectedSemesterData ? (
              <>
                <div className="semester-performance-details-heading">
                  <div>
                    <p className="page-eyebrow">DETALJI SEMESTRA</p>
                    <h3>
                      {selectedSemesterData.semester}. semestar
                    </h3>
                  </div>

                  <span>
                    {formatAverage(selectedSemesterData.weightedAverage)}
                  </span>
                </div>

                <div className="semester-performance-summary">
                  <div>
                    <span>Položeno ispita</span>
                    <strong>{selectedSemesterData.exams.length}</strong>
                  </div>

                  <div>
                    <span>Osvojeno ESPB</span>
                    <strong>{selectedSemesterData.totalEcts}</strong>
                  </div>
                </div>

                <div className="semester-exam-list">
                  {selectedSemesterData.exams.map((exam) => (
                    <article key={exam.id} className="semester-exam-item">
                      <span
                        className={`semester-exam-grade semester-exam-grade-${exam.grade}`}
                      >
                        {exam.grade}
                      </span>

                      <div>
                        <strong>{exam.name}</strong>
                        <span>
                          {exam.code || 'Bez šifre'} · {exam.ects} ESPB ·{' '}
                          {formatDate(exam.passedDate)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            ) : null}
          </aside>
        </div>
      ) : (
        <div className="semester-performance-empty">
          <i className="bi bi-mortarboard"></i>
          <h3>Još nema položenih ispita</h3>
          <p>
            Dodaj položene ispite da bi EduFlow prikazao uspeh po semestrima.
          </p>
        </div>
      )}
    </section>
  )
}

export default SemesterPerformancePanel