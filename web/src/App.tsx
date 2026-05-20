import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { AppShell } from './layout/AppShell'
import { AttendancePage } from './pages/AttendancePage'
import { CoursesPage } from './pages/CoursesPage'
import { DashboardPage } from './pages/DashboardPage'
import { GradesPage } from './pages/GradesPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { UsersPage } from './pages/UsersPage'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="grades" element={<GradesPage />} />
        <Route path="attendance" element={<AttendancePage />} />
      </Route>
      <Route path="/auth/login" element={<SignInPage />} />
      <Route path="/auth/register" element={<SignUpPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
