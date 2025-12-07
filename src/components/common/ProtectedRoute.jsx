import { Navigate, useLocation } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) return <LoadingScreen label="Securing your experience..." />

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && profile?.role && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute
