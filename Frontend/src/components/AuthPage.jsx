import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/auth'
import LoadingScreen from './LoadingScreen'

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login'
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading, login, stopLoading } = useAuth()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const notice = location.state?.notice

  if (loading) {
    return <LoadingScreen onSkip={stopLoading} />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!email.trim()) return setError('Email is required.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (!isLogin && username.trim().length < 3) {
      return setError('Username must be at least 3 characters.')
    }

    setSubmitting(true)
    try {
      if (isLogin) {
        const data = await api.post('/auth/login', { email: email.trim(), password })
        login(data.data.user)
        navigate('/', { replace: true })
      } else {
        await api.post('/auth/register', {
          username: username.trim(),
          email: email.trim(),
          password,
        })
        navigate('/login', {
          replace: true,
          state: { notice: 'Account created. You can now log in.' },
        })
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-icon" aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        </div>
        <h1>{isLogin ? 'Welcome back' : 'Create account'}</h1>
        <p className="auth-sub">
          {isLogin ? 'Log in to shorten links' : 'Sign up to start shortening links'}
        </p>

        {notice && <p className="notice-msg">{notice}</p>}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="at least 8 characters"
            />
          </div>

          {error && (
            <p className="error-msg" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? (
            <>
              Don't have an account? <Link to="/register">Sign up</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Log in</Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
