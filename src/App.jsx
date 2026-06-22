import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './layouts/AppLayout'
import DashboardPage from './pages/DashboardPage'
import SectionPage from './pages/SectionPage'
import NotFoundPage from './pages/NotFoundPage'
import SubjectsPage from './pages/SubjectsPage'
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/subjects" element={<SubjectsPage />} />

        <Route
          path="/tasks"
          element={
            <SectionPage
              title="Obaveze"
              description="Ovde će biti tabela obaveza, statusi, prioriteti, filteri i pretraga."
              icon="bi-check2-square"
            />
          }
        />

        <Route
          path="/calendar"
          element={
            <SectionPage
              title="Kalendar"
              description="Ovde će se prikazivati rokovi, kolokvijumi, ispiti i važni datumi."
              icon="bi-calendar-event"
            />
          }
        />

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