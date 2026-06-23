import { createContext, useContext, useEffect, useState } from 'react'

const ExamScheduleContext = createContext(null)

const STORAGE_KEY = 'eduflow-exam-schedules'

function loadSchedules() {
  const savedSchedules = localStorage.getItem(STORAGE_KEY)

  if (!savedSchedules) {
    return []
  }

  try {
    const parsedSchedules = JSON.parse(savedSchedules)

    return Array.isArray(parsedSchedules) ? parsedSchedules : []
  } catch {
    return []
  }
}

export function ExamScheduleProvider({ children }) {
  const [schedules, setSchedules] = useState(loadSchedules)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
  }, [schedules])

  function addSchedule(scheduleData) {
    const newSchedule = {
      id: Date.now(),
      title: scheduleData.title.trim(),
      sourceFileName: scheduleData.sourceFileName,
      profile: scheduleData.profile,
      accentColor: scheduleData.accentColor,
      createdAt: new Date().toISOString(),
      entries: scheduleData.entries.map((entry, index) => ({
        ...entry,
        id: `${Date.now()}-${index}`,
      })),
    }

    setSchedules((previousSchedules) => [
      newSchedule,
      ...previousSchedules,
    ])

    return newSchedule
  }

  function updateScheduleTitle(scheduleId, title) {
    setSchedules((previousSchedules) =>
      previousSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              title,
            }
          : schedule
      )
    )
  }

  function updateScheduleEntry(scheduleId, entryId, field, value) {
    setSchedules((previousSchedules) =>
      previousSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              entries: schedule.entries.map((entry) =>
                entry.id === entryId
                  ? {
                      ...entry,
                      [field]: value,
                    }
                  : entry
              ),
            }
          : schedule
      )
    )
  }

  function addScheduleEntry(scheduleId, entry) {
    setSchedules((previousSchedules) =>
      previousSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              entries: [
                ...schedule.entries,
                {
                  ...entry,
                  id: `${Date.now()}-${schedule.entries.length}`,
                },
              ],
            }
          : schedule
      )
    )
  }

  function deleteScheduleEntry(scheduleId, entryId) {
    setSchedules((previousSchedules) =>
      previousSchedules.map((schedule) =>
        schedule.id === scheduleId
          ? {
              ...schedule,
              entries: schedule.entries.filter(
                (entry) => entry.id !== entryId
              ),
            }
          : schedule
      )
    )
  }

  function deleteSchedule(scheduleId) {
    setSchedules((previousSchedules) =>
      previousSchedules.filter(
        (schedule) => schedule.id !== scheduleId
      )
    )
  }

  return (
    <ExamScheduleContext.Provider
      value={{
        schedules,
        addSchedule,
        updateScheduleTitle,
        updateScheduleEntry,
        addScheduleEntry,
        deleteScheduleEntry,
        deleteSchedule,
      }}
    >
      {children}
    </ExamScheduleContext.Provider>
  )
}

export function useExamSchedules() {
  const context = useContext(ExamScheduleContext)

  if (!context) {
    throw new Error(
      'useExamSchedules mora da se koristi unutar ExamScheduleProvider komponente.'
    )
  }

  return context
}