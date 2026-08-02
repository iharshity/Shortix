import { Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import ShortenPage from './components/ShortenPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ShortenPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  )
}

export default App
