const API_URL = import.meta.env.API_URL ?? 'http://localhost:3000'

export function getToken() {
  return localStorage.getItem('token')
}

export function saveToken(token: string) {
  localStorage.setItem('token', token)
}

export function removeToken() {
  localStorage.removeItem('token')
}

// Fetch autenticado — adjunta el token automáticamente
export function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken()

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
}