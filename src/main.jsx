import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './index.css'
import App from './App.jsx'
import { SubjectProvider } from './context/SubjectContext'
import { TaskProvider } from './context/TaskContext'
import { DailyPlanProvider } from './context/DailyPlanContext'
import { AcademicProvider } from './context/AcademicContext'
import { GradeGoalProvider } from './context/GradeGoalContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SubjectProvider>
        <TaskProvider>
          <DailyPlanProvider>
            <AcademicProvider>
              <GradeGoalProvider>
                <App />
              </GradeGoalProvider>
            </AcademicProvider>
          </DailyPlanProvider>
        </TaskProvider>
      </SubjectProvider>
    </BrowserRouter>
  </StrictMode>
)