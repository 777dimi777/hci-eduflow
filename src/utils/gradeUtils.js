export function calculateTotalEcts(exams) {
  return exams.reduce((sum, exam) => sum + Number(exam.ects || 0), 0)
}

export function calculateWeightedAverage(exams) {
  const totalEcts = calculateTotalEcts(exams)

  if (totalEcts === 0) {
    return 0
  }

  const totalGradePoints = exams.reduce(
    (sum, exam) => sum + Number(exam.grade) * Number(exam.ects),
    0
  )

  return totalGradePoints / totalEcts
}

export function calculateSimpleAverage(exams) {
  if (exams.length === 0) {
    return 0
  }

  const gradeSum = exams.reduce(
    (sum, exam) => sum + Number(exam.grade),
    0
  )

  return gradeSum / exams.length
}

export function formatAverage(value) {
  return Number(value).toFixed(2).replace('.', ',')
}

export function getGradeDistribution(exams) {
  return [6, 7, 8, 9, 10].map((grade) => ({
    grade,
    count: exams.filter((exam) => Number(exam.grade) === grade).length,
  }))
}