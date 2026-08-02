import { createContext, useContext } from 'react'

// Kept separate from AuthProvider so the file exporting the component only
// exports components (react-refresh/only-export-components).
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
