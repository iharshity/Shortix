import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/auth'

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function ShortenPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleShorten(event) {
    event.preventDefault()
    setError(null)
    setCopied(false)

    if (!isValidHttpUrl(url)) {
      return setError('Please enter a valid http:// or https:// URL.')
    }

    setSubmitting(true)
    try {
      const data = await api.post('/url/shorten', { url: url.trim() })
      setResult(data.data)
      setUrl('')
    } catch (err) {
      if (err.status === 401) {
        // Session expired or invalid — bounce back to login.
        await logout()
        navigate('/login', { replace: true })
        return
      }
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyShortUrl() {
    try {
      await navigator.clipboard.writeText(result.shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Could not copy automatically. Select and copy the link manually.')
    }
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell">
      <nav className="navbar">
        <span className="brand">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          URL Shortener
        </span>
        <span className="navbar-user">
          {user?.username}
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </span>
      </nav>

      <main className="shorten-main">
        <div className="shorten-card">
          <h1>Shorten a link</h1>
          <p className="shorten-sub">Paste a long URL and get a short one in a click.</p>

          <form className="shorten-form" onSubmit={handleShorten}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/path?with=params"
              aria-label="URL to shorten"
            />
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Shortening…' : 'Shorten'}
            </button>
          </form>

          {error && (
            <p className="error-msg" role="alert">
              {error}
            </p>
          )}

          {result && (
            <div className="result-card">
              <p className="result-label">Your short URL</p>
              <a href={result.shortUrl} target="_blank" rel="noreferrer" className="result-link">
                {result.shortUrl}
              </a>
              <button type="button" className="btn" onClick={copyShortUrl}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
