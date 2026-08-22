const TOKEN_KEY = 'jds_admin_token'
const ADMIN_KEY = 'jds_admin'

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredAdmin() {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_KEY) || 'null')
  } catch {
    return null
  }
}

export function storeSession(token, admin) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(ADMIN_KEY, JSON.stringify(admin))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(ADMIN_KEY)
}