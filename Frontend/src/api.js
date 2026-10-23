export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

// VITE_API_URL is the backend host in production (e.g. https://api.example.com).
// All API routes live under /api, so append it. In dev, the Vite proxy forwards
// /api → localhost:4000 so we use a relative path.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api'

async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })

  // 204 No Content (e.g. logout) has no body to parse.
  if (response.status === 204) {
    return null
  }

  let data
  try {
    data = await response.json()
  } catch {
    // Body was not JSON — data stays undefined.
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message || `Request failed with status ${response.status}.`
    )
  }

  return data
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  delete: (path) => request(path, { method: 'DELETE' }),
}
