import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/auth'
import LoadingScreen from './LoadingScreen'

export default function ProtectedRoute({ children }) {
  const { user, loading, stopLoading } = useAuth()

  if (loading) {
    return <LoadingScreen onSkip={stopLoading} />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
