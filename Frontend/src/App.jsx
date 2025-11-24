import { Navigate, Route, Routes } from 'react-router-dom'

import './App.css'
import AdminLayout from './layouts/AdminLayout.jsx'
import UserLayout from './layouts/UserLayout.jsx'
import { useAuth } from './context/AuthContext.jsx'
import AdminComplaints from './pages/admin/AdminComplaints.jsx'
import AdminCustomers from './pages/admin/AdminCustomers.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminMeals from './pages/admin/AdminMeals.jsx'
import LoginPage from './pages/Login.jsx'
import UserComplaints from './pages/user/UserComplaints.jsx'
import UserDashboard from './pages/user/UserDashboard.jsx'
import UserMeals from './pages/user/UserMeals.jsx'
import UserSubscriptions from './pages/user/UserSubscriptions.jsx'

function RootRedirect() {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <Navigate to={isAdmin ? '/admin' : '/user'} replace />
}

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/user" replace />
  }
  if (!requireAdmin && isAdmin) {
    return <Navigate to="/admin" replace />
  }
  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/user"
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="meals" element={<UserMeals />} />
        <Route path="subscriptions" element={<UserSubscriptions />} />
        <Route path="complaints" element={<UserComplaints />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="meals" element={<AdminMeals />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="customers" element={<AdminCustomers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
