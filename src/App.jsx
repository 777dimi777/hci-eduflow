import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import SectionPage from './pages/SectionPage'
import NotFoundPage from './pages/NotFoundPage'
import SubjectsPage from './pages/SubjectsPage'
import TasksPage from './pages/TasksPage'
import CalendarPage from './pages/CalendarPage'
import PassedExamsPage from './pages/PassedExamsPage'
import GradeGoalPage from './pages/GradeGoalPage'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/exams" element={<PassedExamsPage />} />
        <Route path="/grade-goal" element={<GradeGoalPage />} />

        <Route
          path="/materials"
          element={
            <SectionPage
              title="Materijali"
              description="Ovde će korisnik čuvati beleške, linkove i materijale po predmetima."
              icon="bi-folder2-open"
            />
          }
        />

        <Route
          path="/statistics"
          element={
            <SectionPage
              title="Statistika"
              description="Ovde će se pratiti napredak, završene obaveze i uspeh po predmetima."
              icon="bi-bar-chart-line"
            />
          }
        />

        <Route
          path="/pdf-import"
          element={
            <SectionPage
              title="Uvoz PDF-a"
              description="Ovde će korisnik ubacivati plan studija i izdvajati predmete za svoj smer."
              icon="bi-file-earmark-pdf"
            />
          }
        />

        <Route
          path="/settings"
          element={
            <SectionPage
              title="Podešavanja"
              description="Ovde će korisnik menjati temu, boje i podešavanja aplikacije."
              icon="bi-gear"
            />
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

export default App