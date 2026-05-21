import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { RequireSession } from './components/RequireSession'
import { AppShell } from './layout/AppShell'
import { AttendancePage } from './pages/AttendancePage'
import { ClassroomsPage } from './pages/ClassroomsPage'
import { CoursesPage } from './pages/CoursesPage'
import { DashboardPage } from './pages/DashboardPage'
import { EnrollmentsPage } from './pages/EnrollmentsPage'
import { GradesPage } from './pages/GradesPage'
import { NotFoundPage } from './pages/NotFoundPage'
import NotAuthorizedPage from './pages/NotAuthorizedPage'
import { SchedulePage } from './pages/SchedulePage'
import { SemestersPage } from './pages/SemestersPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { UsersPage } from './pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route
        element={
          <RequireSession>
            <AppShell />
          </RequireSession>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="courses"
          element={
            <RequireSession allowedRoles={["TEACHER", "ADMIN"]}>
              <CoursesPage />
            </RequireSession>
          }
        />
        <Route
          path="semesters"
          element={
            <RequireSession allowedRoles={["ADMIN"]}>
              <SemestersPage />
            </RequireSession>
          }
        />
        <Route
          path="users"
          element={
            <RequireSession allowedRoles={["ADMIN"]}>
              <UsersPage />
            </RequireSession>
          }
        />
        <Route
          path="enrollments"
          element={
            <RequireSession allowedRoles={["ADMIN"]}>
              <EnrollmentsPage />
            </RequireSession>
          }
        />
        <Route
          path="classrooms"
          element={
            <RequireSession allowedRoles={["ADMIN"]}>
              <ClassroomsPage />
            </RequireSession>
          }
        />
        <Route
          path="schedule"
          element={
            <RequireSession allowedRoles={["STUDENT", "ADMIN"]}>
              <SchedulePage />
            </RequireSession>
          }
        />
        <Route
          path="grades"
          element={
            <RequireSession allowedRoles={["TEACHER", "ADMIN"]}>
              <GradesPage />
            </RequireSession>
          }
        />
        <Route
          path="attendance"
          element={
            <RequireSession allowedRoles={["TEACHER", "ADMIN"]}>
              <AttendancePage />
            </RequireSession>
          }
        />
      </Route>
      <Route path="/not-authorized" element={<NotAuthorizedPage />} />
      <Route path="/auth/login" element={<SignInPage />} />
      <Route path="/auth/register" element={<SignUpPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
