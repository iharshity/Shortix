import { useEffect } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

export default function QRCodeModal({ url, shortCode, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function downloadQR() {
    const canvas = document.getElementById('shortix-qr-canvas')
    if (!canvas) return
    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `shortix-${shortCode || 'qrcode'}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <h3 id="qr-modal-title" className="modal-title">QR Code</h3>
        <p className="modal-sub">Scan with any phone camera to visit this link.</p>

        <div className="qr-container">
          <QRCodeCanvas
            id="shortix-qr-canvas"
            value={url}
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="modal-url-box">
          <span className="modal-url-text">{url}</span>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={downloadQR}>
            Download PNG
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
