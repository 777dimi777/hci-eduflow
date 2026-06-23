import { createContext, useContext, useEffect, useState } from 'react'
import { initialSubjects } from '../data/initialSubjects'

const SubjectContext = createContext(null)

const STORAGE_KEY = 'eduflow-subjects'

function normalizeText(value) {
  return String(value || '').trim().toLocaleLowerCase('sr-RS')
}

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

  function addImportedSubjects(importedSubjects) {
    const existingCodes = new Set(
      subjects.map((subject) => normalizeText(subject.code))
    )

    const existingNames = new Set(
      subjects.map((subject) => normalizeText(subject.name))
    )

    const addedSubjects = []
    const skippedSubjects = []

    importedSubjects.forEach((subject, index) => {
      const code = String(subject.code || '').trim().toUpperCase()
      const name = String(subject.name || '').trim()

      const normalizedCode = normalizeText(code)
      const normalizedName = normalizeText(name)

      const isDuplicate =
        existingCodes.has(normalizedCode) ||
        existingNames.has(normalizedName)

      if (!code || !name || isDuplicate) {
        skippedSubjects.push(subject)
        return
      }

      const newSubject = {
        id: Date.now() + index,
        code,
        name,
        professor:
          String(subject.professor || '').trim() ||
          'Nastavnik nije unet',
        semester: Number(subject.semester) || 6,
        ects: Number(subject.ects) || 6,
        progress: Number(subject.progress) || 0,
        color: subject.color || 'emerald',
        tasks: 0,
        nextDeadline: 'Rok nije unet',
      }

      addedSubjects.push(newSubject)
      existingCodes.add(normalizedCode)
      existingNames.add(normalizedName)
    })

    if (addedSubjects.length > 0) {
      setSubjects((previousSubjects) => [
        ...previousSubjects,
        ...addedSubjects,
      ])
    }

    return {
      addedCount: addedSubjects.length,
      skippedCount: skippedSubjects.length,
      addedCodes: addedSubjects.map((subject) => subject.code),
    }
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
        addImportedSubjects,
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