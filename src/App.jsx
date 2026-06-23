import { Navigate, Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import SectionPage from "./pages/SectionPage";
import NotFoundPage from "./pages/NotFoundPage";
import SubjectsPage from "./pages/SubjectsPage";
import TasksPage from "./pages/TasksPage";
import CalendarPage from "./pages/CalendarPage";
import PassedExamsPage from "./pages/PassedExamsPage";
import GradeGoalPage from "./pages/GradeGoalPage";
import MaterialsPage from "./pages/MaterialsPage";
import PdfImportPage from "./pages/PdfImportPage";
import StatisticsPage from "./pages/StatisticsPage";
import SubjectDetailsPage from "./pages/SubjectDetailsPage";
import SettingsPage from "./pages/SettingsPage";
function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:subjectId" element={<SubjectDetailsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/exams" element={<PassedExamsPage />} />
        <Route path="/grade-goal" element={<GradeGoalPage />} />
        <Route path="/materials" element={<MaterialsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/pdf-import" element={<PdfImportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
