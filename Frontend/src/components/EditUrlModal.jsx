import { useEffect, useState } from 'react'

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export default function EditUrlModal({ item, onClose, onSave }) {
  const [newUrl, setNewUrl] = useState(item.originalUrl || '')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const trimmed = newUrl.trim()
    if (!trimmed) {
      return setError('Destination URL cannot be empty.')
    }

    if (!isValidHttpUrl(trimmed)) {
      return setError('Please enter a valid http:// or https:// URL.')
    }

    if (trimmed === item.originalUrl) {
      return onClose() // No change made
    }

    setSubmitting(true)
    try {
      await onSave(item.id, trimmed)
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update destination URL.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card edit-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <h3 id="edit-modal-title" className="modal-title">Edit Destination URL</h3>
        <p className="modal-sub">
          Update where <span className="modal-accent-code">{item.shortCode}</span> redirects visitors.
        </p>

        <div className="edit-short-preview">
          <span className="edit-short-label">Short Link:</span>
          <a
            href={item.shortUrl}
            target="_blank"
            rel="noreferrer"
            className="edit-short-link"
          >
            {item.shortUrl}
          </a>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          <label className="edit-input-label">New Destination URL</label>
          <input
            type="text"
            className="edit-input"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://example.com/new-destination"
            autoFocus
          />

          {error && (
            <p className="error-msg" role="alert" style={{ textAlign: 'left', marginTop: 8 }}>
              {error}
            </p>
          )}

          <div className="modal-actions" style={{ marginTop: 20 }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Saving…' : 'Save Changes'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
