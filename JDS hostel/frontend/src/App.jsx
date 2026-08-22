import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/AdminLogin'
import AnnouncementsPage from './pages/AnnouncementsPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'
import StudentManagement from './pages/StudentManagement'
import ManagementPage from './pages/ManagementPage'
import ComplaintsPage from './pages/ComplaintsPage'
import MessPage from './pages/MessPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return <BrowserRouter><Routes>
    <Route path="/admin/login" element={<AdminLogin />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<StudentManagement />} />
      <Route path="/admin/rooms" element={<ManagementPage section="rooms" />} />
      <Route path="/admin/fees" element={<ManagementPage section="fees" />} />
      <Route path="/admin/payments" element={<ManagementPage section="payments" />} />
      <Route path="/admin/complaints" element={<ComplaintsPage />} />
      <Route path="/admin/mess" element={<MessPage />} />
      <Route path="/admin/announcements" element={<AnnouncementsPage />} />
      <Route path="/admin/reports" element={<ReportsPage />} />
      <Route path="/admin/settings" element={<SettingsPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
  </Routes></BrowserRouter>
}

export default App
