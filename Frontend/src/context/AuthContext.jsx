import { useCallback, useEffect, useState } from 'react'
import { api } from '../api'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore the session on load: the auth cookie is httpOnly, so the only way
  // to learn who's logged in is to ask the server.
  useEffect(() => {
    let cancelled = false

    api
      .get('/auth/me')
      .then((data) => {
        if (!cancelled && data?.data?.user) {
          setUser(data.data.user)
        }
      })
      .catch(() => {
        // 401 (no/expired cookie) or a network error — stay logged out.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback((userData) => setUser(userData), [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } catch {
      // The cookie may already be gone; clear local state regardless.
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
