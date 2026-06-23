import { createContext, useContext, useEffect, useState } from 'react'
import { initialPassedExams } from '../data/initialPassedExams'
import { toDateKey } from '../utils/dateUtils'

const AcademicContext = createContext(null)

const STORAGE_KEY = 'eduflow-passed-exams'

function loadPassedExams() {
  const savedExams = localStorage.getItem(STORAGE_KEY)

  if (!savedExams) {
    return initialPassedExams
  }

  try {
    const parsedExams = JSON.parse(savedExams)

    return Array.isArray(parsedExams) ? parsedExams : initialPassedExams
  } catch {
    return initialPassedExams
  }
}

export function AcademicProvider({ children }) {
  const [passedExams, setPassedExams] = useState(loadPassedExams)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(passedExams))
  }, [passedExams])

  function addPassedExam(exam) {
    const subjectId = exam.subjectId ? Number(exam.subjectId) : null

    const alreadyExists =
      subjectId &&
      passedExams.some(
        (savedExam) => Number(savedExam.subjectId) === subjectId
      )

    if (alreadyExists) {
      return {
        success: false,
        reason: 'duplicate',
      }
    }

    const newExam = {
      id: Date.now(),
      subjectId,
      code: exam.code.trim().toUpperCase(),
      name: exam.name.trim(),
      semester: Number(exam.semester),
      ects: Number(exam.ects),
      grade: Number(exam.grade),
      passedDate: exam.passedDate || toDateKey(new Date()),
    }

    setPassedExams((previousExams) => [newExam, ...previousExams])

    return {
      success: true,
    }
  }

  function deletePassedExam(examId) {
    setPassedExams((previousExams) =>
      previousExams.filter((exam) => exam.id !== examId)
    )
  }

  return (
    <AcademicContext.Provider
      value={{
        passedExams,
        addPassedExam,
        deletePassedExam,
      }}
    >
      {children}
    </AcademicContext.Provider>
  )
}

export function useAcademic() {
  const context = useContext(AcademicContext)

  if (!context) {
    throw new Error(
      'useAcademic mora da se koristi unutar AcademicProvider komponente.'
    )
  }

  return context
}