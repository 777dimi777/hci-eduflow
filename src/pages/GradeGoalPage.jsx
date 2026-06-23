import { useEffect, useMemo, useState } from 'react'
import { useAcademic } from '../context/AcademicContext'
import { useGradeGoal } from '../context/GradeGoalContext'
import { useSubjects } from '../context/SubjectContext'
import { formatAverage } from '../utils/gradeUtils'
import {
  calculateGoalPlan,
  createImprovementPlan,
  getAvailableStudyYears,
  getDefaultStudyYear,
  getLowerPredictionDeviations,
  getPassedExamsForStudyYear,
  getPredictionForSubject,
  getSubjectsForProjection,
} from '../utils/gradeGoalUtils'
import { getSubjectColorValue } from '../utils/subjectColorUtils'

function GradeGoalPage() {
  const { subjects } = useSubjects()
  const { passedExams } = useAcademic()

  const {
    targetAverage,
    selectedStudyYear,
    predictions,
    updateTargetAverage,
    updateSelectedStudyYear,
    setPrediction,
    resetPredictions,
  } = useGradeGoal()

  const [targetInput, setTargetInput] = useState(
    String(targetAverage).replace('.', ',')
  )

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const availableStudyYears = useMemo(() => {
    return getAvailableStudyYears(subjects, passedExams)
  }, [subjects, passedExams])

  const defaultStudyYear = useMemo(() => {
    return getDefaultStudyYear(subjects, passedExams)
  }, [subjects, passedExams])

  const resolvedStudyYear =
    selectedStudyYear &&
    availableStudyYears.includes(selectedStudyYear)
      ? selectedStudyYear
      : defaultStudyYear

  useEffect(() => {
    if (selectedStudyYear !== resolvedStudyYear) {
      updateSelectedStudyYear(resolvedStudyYear)
    }
  }, [selectedStudyYear, resolvedStudyYear, updateSelectedStudyYear])

  useEffect(() => {
    setTargetInput(String(targetAverage).replace('.', ','))
  }, [targetAverage])

  const yearlyPassedExams = useMemo(() => {
    return getPassedExamsForStudyYear(
      passedExams,
      resolvedStudyYear
    )
  }, [passedExams, resolvedStudyYear])

  const activeSubjects = useMemo(() => {
    return getSubjectsForProjection(
      subjects,
      yearlyPassedExams,
      resolvedStudyYear
    )
  }, [subjects, yearlyPassedExams, resolvedStudyYear])

  const plan = useMemo(() => {
    return calculateGoalPlan(
      yearlyPassedExams,
      activeSubjects,
      predictions,
      targetAverage
    )
  }, [
    yearlyPassedExams,
    activeSubjects,
    predictions,
    targetAverage,
  ])

  const improvementPlan = useMemo(() => {
    return createImprovementPlan(
      activeSubjects,
      predictions,
      plan.deficit
    )
  }, [activeSubjects, predictions, plan.deficit])

  const lowerPredictionDeviations = useMemo(() => {
    return getLowerPredictionDeviations(
      yearlyPassedExams,
      predictions
    )
  }, [yearlyPassedExams, predictions])

  const projectedDifference =
    plan.projectedAverage - targetAverage

  const projectedPercent = Math.min(
    100,
    Math.max(0, ((plan.projectedAverage - 6) / 4) * 100)
  )

  const targetPercent = Math.min(
    100,
    Math.max(0, ((targetAverage - 6) / 4) * 100)
  )

  function handleTargetSubmit(event) {
    event.preventDefault()

    const parsedTarget = Number(
      targetInput.trim().replace(',', '.')
    )

    if (
      Number.isNaN(parsedTarget) ||
      parsedTarget < 6 ||
      parsedTarget > 10
    ) {
      setError('Cilj proseka mora biti broj između 6,00 i 10,00.')
      setMessage('')
      return
    }

    updateTargetAverage(parsedTarget)
    setError('')
    setMessage('Cilj proseka je uspešno sačuvan.')
  }

  function handleResetPredictions() {
    resetPredictions(activeSubjects.map((subject) => subject.id))
    setMessage('Predikcije za aktivne predmete vraćene su na podrazumevanu ocenu 8.')
    setError('')
  }

  function getSubjectColor(subject) {
    return getSubjectColorValue(subject.color)
  }

  return (
    <section className="grade-goal-page">
      <div className="dashboard-heading">
        <div>
          <p className="page-eyebrow">PLAN AKADEMSKOG USPEHA</p>
          <h1>Cilj proseka</h1>
          <p className="page-description">
            Postavi željeni prosek, proceni ocene iz aktivnih predmeta i saznaj
            šta treba da popraviš da bi ostvario plan.
          </p>
        </div>
      </div>

      <section className="goal-settings-card">
        <div>
          <p className="page-eyebrow">PODEŠAVANJA PLANA</p>
          <h2>Plan za {resolvedStudyYear}. godinu studija</h2>
          <p>
            Računanje obuhvata položene i aktivne predmete iz izabrane godine.
          </p>
        </div>

        <div className="goal-settings-actions">
          <label className="goal-select-field">
            <span>Godina studija</span>

            <select
              value={resolvedStudyYear}
              onChange={(event) => {
                updateSelectedStudyYear(Number(event.target.value))
                setMessage('')
              }}
            >
              {availableStudyYears.map((studyYear) => (
                <option key={studyYear} value={studyYear}>
                  {studyYear}. godina
                </option>
              ))}
            </select>
          </label>

          <form className="goal-target-form" onSubmit={handleTargetSubmit}>
            <label>
              <span>Željeni prosek</span>

              <input
                type="text"
                value={targetInput}
                onChange={(event) => setTargetInput(event.target.value)}
                placeholder="8,50"
                inputMode="decimal"
              />
            </label>

            <button type="submit" className="green-button">
              <i className="bi bi-bullseye"></i>
              Sačuvaj cilj
            </button>
          </form>
        </div>
      </section>

      {error && (
        <p className="goal-message goal-message-error" aria-live="polite">
          <i className="bi bi-exclamation-circle-fill"></i>
          {error}
        </p>
      )}

      {message && (
        <p className="goal-message goal-message-success" aria-live="polite">
          <i className="bi bi-check-circle-fill"></i>
          {message}
        </p>
      )}

      {lowerPredictionDeviations.length > 0 && (
        <section className="prediction-deviation-alert">
          <div className="prediction-deviation-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>

          <div>
            <strong>Stvarna ocena je niža od predviđene</strong>

            <p>
              EduFlow je automatski preračunao plan. Da bi ostao na cilju,
              možda moraš da povećaš predikciju iz nekog drugog predmeta.
            </p>

            <div className="prediction-deviation-list">
              {lowerPredictionDeviations.map((exam) => (
                <span key={exam.id}>
                  {exam.code || exam.name}: plan {exam.predictedGrade}, stvarno{' '}
                  {exam.actualGrade}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="goal-summary-grid">
        <article className="goal-summary-card">
          <span>Trenutni prosek godine</span>

          <strong>
            {yearlyPassedExams.length > 0
              ? formatAverage(plan.currentAverage)
              : '—'}
          </strong>

          <small>{yearlyPassedExams.length} položenih ispita</small>
        </article>

        <article className="goal-summary-card">
          <span>Projektovani prosek</span>

          <strong>{formatAverage(plan.projectedAverage)}</strong>

          <small>
            Na osnovu {activeSubjects.length} aktivnih predmeta
          </small>
        </article>

        <article className="goal-summary-card">
          <span>Željeni prosek</span>

          <strong>{formatAverage(targetAverage)}</strong>

          <small>
            {projectedDifference >= 0
              ? `Plan je iznad cilja za ${formatAverage(
                  projectedDifference
                )}`
              : `Nedostaje ${formatAverage(
                  Math.abs(projectedDifference)
                )} proseka`}
          </small>
        </article>

        <article className="goal-summary-card">
          <span>Preostalo ESPB</span>

          <strong>{plan.remainingEcts}</strong>

          <small>Ukupno u planu: {plan.totalEcts} ESPB</small>
        </article>
      </div>

      <section className="goal-progress-card">
        <div className="goal-progress-heading">
          <div>
            <p className="page-eyebrow">VIZUELNI PREGLED</p>
            <h2>Koliko si blizu cilju?</h2>
          </div>

          <strong
            className={
              projectedDifference >= 0
                ? 'goal-progress-positive'
                : 'goal-progress-negative'
            }
          >
            {projectedDifference >= 0 ? '+' : '-'}
            {formatAverage(Math.abs(projectedDifference))}
          </strong>
        </div>

        <div className="goal-meter">
          <div
            className="goal-meter-fill"
            style={{ width: `${projectedPercent}%` }}
          ></div>

          <span
            className="goal-meter-target"
            style={{ left: `${targetPercent}%` }}
            title={`Cilj: ${formatAverage(targetAverage)}`}
          ></span>
        </div>

        <div className="goal-meter-labels">
          <span>6,00</span>
          <span>Projektovano: {formatAverage(plan.projectedAverage)}</span>
          <span>Cilj: {formatAverage(targetAverage)}</span>
          <span>10,00</span>
        </div>
      </section>

      <div className="goal-page-layout">
        <section className="prediction-table-card">
          <div className="prediction-table-heading">
            <div>
              <p>AKTIVNI PREDMETI</p>
              <h2>Predikcija ocena</h2>
            </div>

            {activeSubjects.length > 0 && (
              <button
                type="button"
                className="outline-button"
                onClick={handleResetPredictions}
              >
                <i className="bi bi-arrow-counterclockwise"></i>
                Vrati na 8
              </button>
            )}
          </div>

          {activeSubjects.length > 0 ? (
            <div className="prediction-subject-list">
              {activeSubjects.map((subject) => {
                const predictedGrade = getPredictionForSubject(
                  predictions,
                  subject.id
                )

                return (
                  <article
                    className="prediction-subject-row"
                    key={subject.id}
                    style={{
                      '--subject-color': getSubjectColor(subject),
                    }}
                  >
                    <div className="prediction-subject-info">
                      <span className="prediction-subject-dot"></span>

                      <div>
                        <strong>{subject.name}</strong>
                        <span>
                          {subject.code} · {subject.ects} ESPB ·{' '}
                          {subject.semester}. semestar
                        </span>
                      </div>
                    </div>

                    <label className="prediction-grade-field">
                      <span>Predikcija</span>

                      <select
                        value={predictedGrade}
                        onChange={(event) => {
                          setPrediction(subject.id, event.target.value)
                          setMessage('')
                        }}
                        aria-label={`Predikcija ocene za predmet ${subject.name}`}
                      >
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                      </select>
                    </label>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="goal-empty-state">
              <i className="bi bi-check2-all"></i>
              <h3>Nema aktivnih predmeta za ovu godinu</h3>
              <p>
                Dodaj predmete ili proveri da li su već označeni kao položeni.
              </p>
            </div>
          )}
        </section>

        <aside
          className={[
            'goal-advice-card',
            plan.deficit <= 0
              ? 'goal-advice-success'
              : improvementPlan.possible
                ? 'goal-advice-warning'
                : 'goal-advice-danger',
          ].join(' ')}
        >
          {plan.deficit <= 0 ? (
            <>
              <div className="goal-advice-icon">
                <i className="bi bi-stars"></i>
              </div>

              <h2>Plan dostiže cilj</h2>

              <p>
                Sa trenutno predviđenim ocenama projektovani prosek iznosi{' '}
                <strong>{formatAverage(plan.projectedAverage)}</strong>.
              </p>

              <div className="goal-advice-details">
                <span>Minimalan mogući prosek</span>
                <strong>{formatAverage(plan.minimumPossibleAverage)}</strong>

                <span>Maksimalan mogući prosek</span>
                <strong>{formatAverage(plan.maximumPossibleAverage)}</strong>
              </div>
            </>
          ) : improvementPlan.possible ? (
            <>
              <div className="goal-advice-icon">
                <i className="bi bi-lightbulb-fill"></i>
              </div>

              <h2>Kako da dostigneš cilj</h2>

              <p>
                Za cilj od <strong>{formatAverage(targetAverage)}</strong>{' '}
                nedostaje ti još oko{' '}
                <strong>{Math.ceil(plan.deficit)} bodova</strong> u ukupnom
                zbiru ocena i ESPB bodova.
              </p>

              <div className="goal-adjustment-list">
                {improvementPlan.adjustments.map((adjustment) => (
                  <article key={adjustment.subjectId}>
                    <span>
                      {adjustment.code} · {adjustment.ects} ESPB
                    </span>

                    <strong>{adjustment.name}</strong>

                    <p>
                      Predikciju podigni sa{' '}
                      <b>{adjustment.currentGrade}</b> na{' '}
                      <b>{adjustment.suggestedGrade}</b>.
                    </p>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="goal-advice-icon">
                <i className="bi bi-exclamation-octagon-fill"></i>
              </div>

              <h2>Cilj trenutno nije dostižan</h2>

              <p>
                Čak i sa maksimalnim ocenama iz preostalih predmeta, najveći
                mogući prosek je{' '}
                <strong>{formatAverage(plan.maximumPossibleAverage)}</strong>.
              </p>

              <p>
                Smanji cilj ili proveri da li su svi položeni ispiti i ESPB
                bodovi pravilno uneti.
              </p>
            </>
          )}
        </aside>
      </div>
    </section>
  )
}

export default GradeGoalPage