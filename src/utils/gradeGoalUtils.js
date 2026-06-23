import { calculateTotalEcts } from './gradeUtils'

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

export function getStudyYearFromSemester(semester) {
  const parsedSemester = Number(semester)

  if (!Number.isInteger(parsedSemester) || parsedSemester < 1) {
    return 1
  }

  return Math.ceil(parsedSemester / 2)
}

export function getAvailableStudyYears(subjects, passedExams) {
  const years = new Set()

  subjects.forEach((subject) => {
    years.add(getStudyYearFromSemester(subject.semester))
  })

  passedExams.forEach((exam) => {
    years.add(getStudyYearFromSemester(exam.semester))
  })

  return [...years].sort((firstYear, secondYear) => firstYear - secondYear)
}

export function getDefaultStudyYear(subjects, passedExams) {
  const years = getAvailableStudyYears(subjects, passedExams)

  if (years.length === 0) {
    return 1
  }

  return years[years.length - 1]
}

export function getPassedExamsForStudyYear(passedExams, studyYear) {
  return passedExams.filter(
    (exam) => getStudyYearFromSemester(exam.semester) === Number(studyYear)
  )
}

export function isSubjectPassed(subject, passedExams) {
  return passedExams.some((exam) => {
    const linkedById =
      exam.subjectId !== null &&
      exam.subjectId !== undefined &&
      Number(exam.subjectId) === Number(subject.id)

    const linkedByCode =
      exam.code &&
      subject.code &&
      normalizeText(exam.code) === normalizeText(subject.code)

    const linkedByName =
      exam.name &&
      subject.name &&
      normalizeText(exam.name) === normalizeText(subject.name)

    return linkedById || linkedByCode || linkedByName
  })
}

export function getSubjectsForProjection(
  subjects,
  passedExams,
  selectedStudyYear
) {
  return subjects.filter((subject) => {
    const belongsToSelectedYear =
      getStudyYearFromSemester(subject.semester) === Number(selectedStudyYear)

    return belongsToSelectedYear && !isSubjectPassed(subject, passedExams)
  })
}

export function getPredictionForSubject(predictions, subjectId) {
  const prediction = Number(predictions[subjectId])

  if (!Number.isInteger(prediction) || prediction < 6 || prediction > 10) {
    return 8
  }

  return prediction
}

export function calculateGoalPlan(
  passedExams,
  activeSubjects,
  predictions,
  targetAverage
) {
  const completedEcts = calculateTotalEcts(passedExams)

  const completedPoints = passedExams.reduce(
    (sum, exam) => sum + Number(exam.grade) * Number(exam.ects),
    0
  )

  const remainingEcts = activeSubjects.reduce(
    (sum, subject) => sum + Number(subject.ects),
    0
  )

  const predictedPoints = activeSubjects.reduce((sum, subject) => {
    const predictedGrade = getPredictionForSubject(
      predictions,
      subject.id
    )

    return sum + predictedGrade * Number(subject.ects)
  }, 0)

  const totalEcts = completedEcts + remainingEcts
  const totalPoints = completedPoints + predictedPoints

  const currentAverage =
    completedEcts > 0 ? completedPoints / completedEcts : 0

  const projectedAverage =
    totalEcts > 0 ? totalPoints / totalEcts : 0

  const targetPoints = Number(targetAverage) * totalEcts

  const deficit = Math.max(0, targetPoints - totalPoints)

  const requiredRemainingAverage =
    remainingEcts > 0
      ? (targetPoints - completedPoints) / remainingEcts
      : null

  const minimumPossibleAverage =
    totalEcts > 0
      ? (completedPoints + remainingEcts * 6) / totalEcts
      : 0

  const maximumPossibleAverage =
    totalEcts > 0
      ? (completedPoints + remainingEcts * 10) / totalEcts
      : 0

  return {
    completedEcts,
    completedPoints,
    remainingEcts,
    predictedPoints,
    totalEcts,
    totalPoints,
    currentAverage,
    projectedAverage,
    targetPoints,
    deficit,
    requiredRemainingAverage,
    minimumPossibleAverage,
    maximumPossibleAverage,
  }
}

export function createImprovementPlan(
  activeSubjects,
  predictions,
  deficit
) {
  let remainingDeficit = deficit

  const candidates = activeSubjects
    .map((subject) => {
      const predictedGrade = getPredictionForSubject(
        predictions,
        subject.id
      )

      const maxImprovementPoints =
        (10 - predictedGrade) * Number(subject.ects)

      return {
        ...subject,
        predictedGrade,
        maxImprovementPoints,
      }
    })
    .filter((subject) => subject.maxImprovementPoints > 0)
    .sort((firstSubject, secondSubject) => {
      return (
        secondSubject.maxImprovementPoints -
        firstSubject.maxImprovementPoints
      )
    })

  const adjustments = []

  candidates.forEach((subject) => {
    if (remainingDeficit <= 0) {
      return
    }

    const ects = Number(subject.ects)

    const neededGradeIncrease = Math.ceil(remainingDeficit / ects)

    const actualGradeIncrease = Math.min(
      10 - subject.predictedGrade,
      Math.max(1, neededGradeIncrease)
    )

    const newPredictedGrade =
      subject.predictedGrade + actualGradeIncrease

    const gainedPoints =
      (newPredictedGrade - subject.predictedGrade) * ects

    adjustments.push({
      subjectId: subject.id,
      name: subject.name,
      code: subject.code,
      ects,
      currentGrade: subject.predictedGrade,
      suggestedGrade: newPredictedGrade,
      gainedPoints,
    })

    remainingDeficit -= gainedPoints
  })

  return {
    possible: remainingDeficit <= 0,
    adjustments,
    remainingDeficit: Math.max(0, remainingDeficit),
  }
}

export function getLowerPredictionDeviations(
  passedExams,
  predictions
) {
  return passedExams
    .map((exam) => {
      if (
        exam.subjectId === null ||
        exam.subjectId === undefined ||
        !Object.prototype.hasOwnProperty.call(
          predictions,
          exam.subjectId
        )
      ) {
        return null
      }

      const predictedGrade = getPredictionForSubject(
        predictions,
        exam.subjectId
      )

      const actualGrade = Number(exam.grade)

      if (actualGrade >= predictedGrade) {
        return null
      }

      return {
        ...exam,
        predictedGrade,
        actualGrade,
        difference: predictedGrade - actualGrade,
      }
    })
    .filter(Boolean)
}