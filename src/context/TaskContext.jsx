import { createContext, useContext, useEffect, useState } from 'react'
import { initialTasks } from '../data/initialTasks'

const TaskContext = createContext(null)

const STORAGE_KEY = 'eduflow-tasks'

function loadTasks() {
  const savedTasks = localStorage.getItem(STORAGE_KEY)

  if (!savedTasks) {
    return initialTasks
  }

  try {
    const parsedTasks = JSON.parse(savedTasks)

    return Array.isArray(parsedTasks) ? parsedTasks : initialTasks
  } catch {
    return initialTasks
  }
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  function addTask(task) {
    const newTask = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      ...task,
    }

    setTasks((previousTasks) => [newTask, ...previousTasks])

    return newTask
  }

  function addExamTask({
    scheduleId,
    scheduleTitle,
    scheduleEntry,
    subjectId = null,
  }) {
    if (!scheduleEntry.dateIso) {
      return {
        success: false,
        reason: 'missing-date',
      }
    }

    const alreadyExists = tasks.some(
      (task) =>
        task.sourceScheduleId === scheduleId &&
        task.sourceScheduleEntryId === scheduleEntry.id
    )

    if (alreadyExists) {
      return {
        success: false,
        reason: 'duplicate',
      }
    }

    const examDetails = [
      `Ispitni rok: ${scheduleTitle}`,
      scheduleEntry.time ? `Vreme: ${scheduleEntry.time}` : '',
      scheduleEntry.duration
        ? `Trajanje: ${scheduleEntry.duration}`
        : '',
      scheduleEntry.rooms ? `Sale: ${scheduleEntry.rooms}` : '',
    ]
      .filter(Boolean)
      .join(' · ')

    const newTask = {
      id: Date.now(),
      subjectId:
        subjectId === null || subjectId === undefined || subjectId === ''
          ? null
          : Number(subjectId),
      title: `Ispit: ${scheduleEntry.subjectName}`,
      dueDate: scheduleEntry.dateIso,
      priority: 'high',
      status: 'todo',
      notes: examDetails,
      createdAt: new Date().toISOString(),
      taskType: 'exam',
      sourceScheduleId: scheduleId,
      sourceScheduleEntryId: scheduleEntry.id,
    }

    setTasks((previousTasks) => [newTask, ...previousTasks])

    return {
      success: true,
      task: newTask,
    }
  }

  function updateTaskStatus(taskId, status) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
            }
          : task
      )
    )
  }

  function deleteTask(taskId) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    )
  }

  function deleteTasksBySubjectId(subjectId) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.subjectId !== subjectId)
    )
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        addExamTask,
        updateTaskStatus,
        deleteTask,
        deleteTasksBySubjectId,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error(
      'useTasks mora da se koristi unutar TaskProvider komponente.'
    )
  }

  return context
}