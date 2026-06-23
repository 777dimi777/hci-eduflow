import { createContext, useContext, useEffect, useState } from 'react'

const DailyPlanContext = createContext(null)

const STORAGE_KEY = 'eduflow-daily-plans'
const MAX_DAILY_TASKS = 5

function loadDailyPlans() {
  const savedPlans = localStorage.getItem(STORAGE_KEY)

  if (!savedPlans) {
    return {}
  }

  try {
    const parsedPlans = JSON.parse(savedPlans)

    if (
      parsedPlans &&
      typeof parsedPlans === 'object' &&
      !Array.isArray(parsedPlans)
    ) {
      return parsedPlans
    }

    return {}
  } catch {
    return {}
  }
}

export function DailyPlanProvider({ children }) {
  const [dailyPlans, setDailyPlans] = useState(loadDailyPlans)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dailyPlans))
  }, [dailyPlans])

  function getPlanTaskIds(dateKey) {
    return dailyPlans[dateKey] || []
  }

  function addTaskToPlan(dateKey, taskId) {
    const currentPlan = dailyPlans[dateKey] || []

    if (currentPlan.includes(taskId)) {
      return { added: false, reason: 'exists' }
    }

    if (currentPlan.length >= MAX_DAILY_TASKS) {
      return { added: false, reason: 'limit' }
    }

    setDailyPlans((previousPlans) => ({
      ...previousPlans,
      [dateKey]: [...(previousPlans[dateKey] || []), taskId],
    }))

    return { added: true }
  }

  function removeTaskFromPlan(dateKey, taskId) {
    setDailyPlans((previousPlans) => {
      const updatedPlan = (previousPlans[dateKey] || []).filter(
        (plannedTaskId) => plannedTaskId !== taskId
      )

      return {
        ...previousPlans,
        [dateKey]: updatedPlan,
      }
    })
  }

  function clearDailyPlan(dateKey) {
    setDailyPlans((previousPlans) => ({
      ...previousPlans,
      [dateKey]: [],
    }))
  }

  return (
    <DailyPlanContext.Provider
      value={{
        getPlanTaskIds,
        addTaskToPlan,
        removeTaskFromPlan,
        clearDailyPlan,
        maxDailyTasks: MAX_DAILY_TASKS,
      }}
    >
      {children}
    </DailyPlanContext.Provider>
  )
}

export function useDailyPlan() {
  const context = useContext(DailyPlanContext)

  if (!context) {
    throw new Error(
      'useDailyPlan mora da se koristi unutar DailyPlanProvider komponente.'
    )
  }

  return context
}