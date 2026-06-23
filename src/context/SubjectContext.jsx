import { createContext, useContext, useEffect, useState } from 'react'
import { initialSubjects } from '../data/initialSubjects'

const SubjectContext = createContext(null)

const STORAGE_KEY = 'eduflow-subjects'

function loadSubjects() {
  const savedSubjects = localStorage.getItem(STORAGE_KEY)

  if (!savedSubjects) {
    return initialSubjects
  }

  try {
    const parsedSubjects = JSON.parse(savedSubjects)

    return Array.isArray(parsedSubjects) ? parsedSubjects : initialSubjects
  } catch {
    return initialSubjects
  }
}

export function SubjectProvider({ children }) {
  const [subjects, setSubjects] = useState(loadSubjects)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
  }, [subjects])

  function addSubject(subject) {
    const newSubject = {
      id: Date.now(),
      ...subject,
    }

    setSubjects((previousSubjects) => [...previousSubjects, newSubject])
  }

  function updateSubject(subjectId, updatedSubject) {
    setSubjects((previousSubjects) =>
      previousSubjects.map((subject) =>
        subject.id === subjectId
          ? {
              ...subject,
              ...updatedSubject,
            }
          : subject
      )
    )
  }

  function deleteSubject(subjectId) {
    setSubjects((previousSubjects) =>
      previousSubjects.filter((subject) => subject.id !== subjectId)
    )
  }

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
      }}
    >
      {children}
    </SubjectContext.Provider>
  )
}

export function useSubjects() {
  const context = useContext(SubjectContext)

  if (!context) {
    throw new Error(
      'useSubjects mora da se koristi unutar SubjectProvider komponente.'
    )
  }

  return context
}