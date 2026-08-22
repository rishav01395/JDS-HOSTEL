import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getStoredToken } from '../services/auth'

function ProtectedRoute() {
  const location = useLocation()

  if (!getStoredToken()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute