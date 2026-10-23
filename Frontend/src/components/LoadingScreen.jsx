import { useEffect, useState } from 'react'

export default function LoadingScreen({ onSkip }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  let title = 'Connecting to Shortix...'
  let subtitle = 'Checking your session'

  if (seconds >= 4 && seconds < 10) {
    title = 'Contacting server...'
    subtitle = 'Reaching backend API'
  } else if (seconds >= 10) {
    title = 'Waking up backend server...'
    subtitle =
      'Render free tier servers sleep after inactivity. The first wake-up can take 40–60 seconds.'
  }

  return (
    <div className="spinner-screen">
      <div className="loading-card">
        <div className="loading-spinner-wrapper">
          <div className="loading-spinner" />
          <div className="loading-glow" />
        </div>

        <h2 className="loading-title">{title}</h2>
        <p className="loading-subtitle">{subtitle}</p>

        {seconds >= 4 && (
          <div className="loading-timer-badge">
            <span className="pulse-dot" />
            <span>Elapsed: {seconds}s</span>
          </div>
        )}

        {seconds >= 10 && onSkip && (
          <button
            type="button"
            className="btn btn-secondary loading-skip-btn"
            onClick={onSkip}
          >
            Continue to Login
          </button>
        )}
      </div>
    </div>
  )
}
