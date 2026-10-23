import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/auth'
import { useToast } from '../context/ToastContext'
import QRCodeModal from './QRCodeModal'
import EditUrlModal from './EditUrlModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'

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
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [url, setUrl] = useState('')
  const [customSlug, setCustomSlug] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [copiedMain, setCopiedMain] = useState(false)
  const [copiedId, setCopiedId] = useState(null)

  // My Links state
  const [urls, setUrls] = useState([])
  const [loadingUrls, setLoadingUrls] = useState(true)
  const [urlsError, setUrlsError] = useState(null)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  // Modals state
  const [qrModal, setQrModal] = useState({ open: false, url: '', shortCode: '' })
  const [editItem, setEditItem] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function fetchUrls() {
    setLoadingUrls(true)
    setUrlsError(null)
    try {
      const data = await api.get('/url/my-urls')
      if (data?.data) {
        setUrls(data.data)
      }
    } catch (err) {
      if (err.status === 401) {
        await logout()
        navigate('/login', { replace: true })
        return
      }
      setUrlsError('Could not load your links.')
    } finally {
      setLoadingUrls(false)
    }
  }

  useEffect(() => {
    fetchUrls()
  }, [])

  async function handleShorten(event) {
    event.preventDefault()
    setError(null)
    setCopiedMain(false)

    if (!isValidHttpUrl(url)) {
      return setError('Please enter a valid http:// or https:// URL.')
    }

    if (customSlug && customSlug.trim().length > 0) {
      const slug = customSlug.trim()
      if (slug.length < 3 || slug.length > 30) {
        return setError('Custom alias must be between 3 and 30 characters.')
      }
    }

    setSubmitting(true)
    try {
      const data = await api.post('/url/shorten', {
        url: url.trim(),
        customSlug: customSlug.trim() || undefined,
      })
      setResult(data.data)
      setUrl('')
      setCustomSlug('')
      setUrls((prev) => [data.data, ...prev])
      showToast('Short link created successfully! 🚀', 'success')
    } catch (err) {
      if (err.status === 401) {
        await logout()
        navigate('/login', { replace: true })
        return
      }
      setError(err.message || 'Something went wrong. Please try again.')
      showToast(err.message || 'Failed to shorten URL.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function copyToClipboard(text, id = null) {
    try {
      await navigator.clipboard.writeText(text)
      if (id) {
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
      } else {
        setCopiedMain(true)
        setTimeout(() => setCopiedMain(false), 2000)
      }
      showToast('Link copied to clipboard! 📋', 'success')
    } catch {
      setError('Could not copy automatically. Select and copy the link manually.')
      showToast('Could not copy automatically.', 'error')
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return

    setDeletingId(deleteTarget.id)
    try {
      await api.delete(`/url/${deleteTarget.id}`)
      setUrls((prev) => prev.filter((item) => item.id !== deleteTarget.id))
      if (result?.id === deleteTarget.id) setResult(null)
      showToast('Short link deleted! 🗑️', 'info')
      setDeleteTarget(null)
    } catch (err) {
      showToast(err.message || 'Failed to delete URL.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSaveEdit(id, newOriginalUrl) {
    const data = await api.patch(`/url/${id}`, { originalUrl: newOriginalUrl })
    if (data?.data) {
      setUrls((prev) =>
        prev.map((item) => (item.id === id ? { ...item, originalUrl: newOriginalUrl } : item))
      )
      if (result?.id === id) {
        setResult((prev) => ({ ...prev, originalUrl: newOriginalUrl }))
      }
      showToast('Destination URL updated! ✨', 'success')
    }
  }

  function openQR(linkUrl, shortCode) {
    setQrModal({ open: true, url: linkUrl, shortCode })
  }

  function closeQR() {
    setQrModal({ open: false, url: '', shortCode: '' })
  }

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const totalClicks = urls.reduce((acc, curr) => acc + (curr.clicks || 0), 0)

  const filteredUrls = urls.filter((item) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      item.originalUrl.toLowerCase().includes(q) ||
      item.shortCode.toLowerCase().includes(q) ||
      item.shortUrl.toLowerCase().includes(q)
    )
  })

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
          Shortix
        </span>
        <span className="navbar-user">
          {user?.username}
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Log out
          </button>
        </span>
      </nav>

      <main className="shorten-main">
        {/* Shorten Form Card */}
        <div className="shorten-card">
          <h1>Shorten a link</h1>
          <p className="shorten-sub">Paste a long URL and get a short, branded one in a click.</p>

          <form className="shorten-form" onSubmit={handleShorten}>
            <div className="shorten-form-grid">
              <input
                type="text"
                className="url-main-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/very/long/path?with=params"
                aria-label="URL to shorten"
                required
              />

              <div className="custom-slug-box">
                <span className="custom-slug-prefix">shortix/</span>
                <input
                  type="text"
                  className="custom-slug-input"
                  value={customSlug}
                  onChange={(e) =>
                    setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))
                  }
                  placeholder="custom-slug (optional)"
                  maxLength={30}
                  aria-label="Custom slug"
                />
              </div>

              <button type="submit" className="btn btn-primary shorten-submit-btn" disabled={submitting}>
                {submitting ? 'Shortening…' : 'Shorten'}
              </button>
            </div>
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
              <div className="result-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => copyToClipboard(result.shortUrl)}
                >
                  {copiedMain ? '✓ Copied!' : 'Copy Link'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openQR(result.shortUrl, result.shortCode)}
                >
                  QR Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* My Links Section */}
        <div className="my-links-container">
          <div className="my-links-header">
            <div>
              <h2 className="my-links-title">My Links</h2>
              <p className="my-links-sub">Manage and track your shortened URLs</p>
            </div>

            <div className="stats-badges">
              <div className="stat-badge">
                <span className="stat-label">Total Links</span>
                <span className="stat-val">{urls.length}</span>
              </div>
              <div className="stat-badge stat-clicks">
                <span className="stat-label">Total Clicks</span>
                <span className="stat-val">{totalClicks}</span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          {urls.length > 0 && (
            <div className="my-links-search-wrap">
              <input
                type="text"
                className="my-links-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by URL or short code..."
                aria-label="Search links"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {loadingUrls ? (
            <div className="links-loading">
              <div className="loading-spinner-wrapper" style={{ width: 32, height: 32 }}>
                <div className="loading-spinner" />
              </div>
              <span>Loading your links...</span>
            </div>
          ) : urlsError ? (
            <div className="links-empty">
              <p>{urlsError}</p>
              <button type="button" className="btn btn-secondary" onClick={fetchUrls}>
                Retry
              </button>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="links-empty">
              {search ? (
                <p>No links matched your search "{search}".</p>
              ) : (
                <p>You haven't shortened any links yet. Create your first link above!</p>
              )}
            </div>
          ) : (
            <div className="links-list">
              {filteredUrls.map((item) => (
                <div key={item.id} className="link-item-card">
                  <div className="link-item-main">
                    <div className="link-item-top">
                      <a
                        href={item.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="link-short-text"
                      >
                        {item.shortUrl}
                      </a>
                      <span className="link-clicks-pill" title="Total clicks">
                        ⚡ {item.clicks || 0} {item.clicks === 1 ? 'click' : 'clicks'}
                      </span>
                    </div>

                    <a
                      href={item.originalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="link-original-text"
                      title={item.originalUrl}
                    >
                      {item.originalUrl}
                    </a>

                    <div className="link-item-meta">
                      <span>Created {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}</span>
                    </div>
                  </div>

                  <div className="link-item-actions">
                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => copyToClipboard(item.shortUrl, item.id)}
                      title="Copy link"
                    >
                      {copiedId === item.id ? '✓ Copied' : 'Copy'}
                    </button>

                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => setEditItem(item)}
                      title="Edit destination URL"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="btn-action"
                      onClick={() => openQR(item.shortUrl, item.shortCode)}
                      title="Generate QR code"
                    >
                      QR
                    </button>

                    <button
                      type="button"
                      className="btn-action btn-action-danger"
                      onClick={() => setDeleteTarget(item)}
                      title="Delete link"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {qrModal.open && (
        <QRCodeModal
          url={qrModal.url}
          shortCode={qrModal.shortCode}
          onClose={closeQR}
        />
      )}

      {/* Edit URL Modal */}
      {editItem && (
        <EditUrlModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Custom Confirm Delete Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
          deleting={deletingId === deleteTarget.id}
        />
      )}
    </div>
  )
}
