import { createContext, useContext, useEffect, useState } from 'react'

const GradeGoalContext = createContext(null)

const STORAGE_KEY = 'eduflow-grade-goal'

const defaultSettings = {
  targetAverage: 8.5,
  selectedStudyYear: null,
  predictions: {},
}

function loadSettings() {
  const savedSettings = localStorage.getItem(STORAGE_KEY)

  if (!savedSettings) {
    return defaultSettings
  }

  try {
    const parsedSettings = JSON.parse(savedSettings)

    const targetAverage = Number(parsedSettings.targetAverage)

    return {
      targetAverage:
        targetAverage >= 6 && targetAverage <= 10
          ? targetAverage
          : defaultSettings.targetAverage,

      selectedStudyYear: Number.isInteger(
        Number(parsedSettings.selectedStudyYear)
      )
        ? Number(parsedSettings.selectedStudyYear)
        : null,

      predictions:
        parsedSettings.predictions &&
        typeof parsedSettings.predictions === 'object' &&
        !Array.isArray(parsedSettings.predictions)
          ? parsedSettings.predictions
          : {},
    }
  } catch {
    return defaultSettings
  }
}

export function GradeGoalProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  function updateTargetAverage(targetAverage) {
    setSettings((previousSettings) => ({
      ...previousSettings,
      targetAverage: Number(targetAverage),
    }))
  }

  function updateSelectedStudyYear(selectedStudyYear) {
    setSettings((previousSettings) => ({
      ...previousSettings,
      selectedStudyYear: Number(selectedStudyYear),
    }))
  }

  function setPrediction(subjectId, grade) {
    setSettings((previousSettings) => ({
      ...previousSettings,
      predictions: {
        ...previousSettings.predictions,
        [subjectId]: Number(grade),
      },
    }))
  }

  function resetPredictions(subjectIds) {
    setSettings((previousSettings) => {
      const updatedPredictions = { ...previousSettings.predictions }

      subjectIds.forEach((subjectId) => {
        delete updatedPredictions[subjectId]
      })

      return {
        ...previousSettings,
        predictions: updatedPredictions,
      }
    })
  }

  return (
    <GradeGoalContext.Provider
      value={{
        targetAverage: settings.targetAverage,
        selectedStudyYear: settings.selectedStudyYear,
        predictions: settings.predictions,
        updateTargetAverage,
        updateSelectedStudyYear,
        setPrediction,
        resetPredictions,
      }}
    >
      {children}
    </GradeGoalContext.Provider>
  )
}

export function useGradeGoal() {
  const context = useContext(GradeGoalContext)

  if (!context) {
    throw new Error(
      'useGradeGoal mora da se koristi unutar GradeGoalProvider komponente.'
    )
  }

  return context
}