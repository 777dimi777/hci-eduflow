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
  }

  function updateTaskStatus(taskId, status) {
    setTasks((previousTasks) =>
      previousTasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    )
  }

  function deleteTask(taskId) {
    setTasks((previousTasks) =>
      previousTasks.filter((task) => task.id !== taskId)
    )
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTaskStatus,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)

  if (!context) {
    throw new Error('useTasks mora da se koristi unutar TaskProvider komponente.')
  }

  return context
}