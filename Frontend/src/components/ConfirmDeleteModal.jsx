import { useEffect } from 'react'

export default function ConfirmDeleteModal({ item, onClose, onConfirm, deleting }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !deleting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, deleting])

  return (
    <div className="modal-overlay" onClick={!deleting ? onClose : undefined}>
      <div
        className="modal-card delete-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          disabled={deleting}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="delete-icon-wrap">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </div>

        <h3 id="delete-modal-title" className="modal-title">Delete short link?</h3>
        <p className="modal-sub">
          This action cannot be undone. Visitors using this link will no longer be redirected.
        </p>

        {item && (
          <div className="modal-url-box delete-url-box">
            <span className="modal-url-text">{item.shortUrl}</span>
          </div>
        )}

        <div className="modal-actions delete-modal-actions">
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Yes, Delete Link'}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
