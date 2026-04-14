import { saveToken, apiFetch, removeToken } from './api'

export interface UsuarioData {
  id: string
  nombre: string
  apellidos: string
  correo: string
  rol: 'ALUMNO' | 'ADMINISTRATIVO' | 'ADMIN'
  fotoUrl?: string | null
}

// ── Persistencia de datos del usuario ────────────────────────────────────────

export function saveUserData(user: UsuarioData) {
  localStorage.setItem('userData', JSON.stringify(user))
}

export function getStoredUser(): UsuarioData | null {
  const raw = localStorage.getItem('userData')
  if (!raw) return null
  try { return JSON.parse(raw) as UsuarioData } catch { return null }
}

export function savePreAuthToken(token: string) {
  sessionStorage.setItem('preAuthToken', token)
}

export function getPreAuthToken(): string | null {
  return sessionStorage.getItem('preAuthToken')
}

export function clearPreAuthToken() {
  sessionStorage.removeItem('preAuthToken')
}

// ── Auth helpers ──────────────────────────────────────────────────────────────

type AuthResult =
  | { type: 'ok'; usuario: UsuarioData }
  | { type: 'needsRoleSelection'; preAuthToken: string; tempUser: { nombre: string; correo: string } }
  | { type: 'pending_approval' }

function handleAuthResponse(data: any): AuthResult {
  if (data.needsRoleSelection) {
    return {
      type: 'needsRoleSelection',
      preAuthToken: data.preAuthToken,
      tempUser: data.tempUser,
    }
  }
  if (data.status === 'pending_approval') {
    return { type: 'pending_approval' }
  }
  saveToken(data.accessToken)
  saveUserData(data.usuario)
  return { type: 'ok', usuario: data.usuario }
}

// ── Login ─────────────────────────────────────────────────────────────────────

export async function loginWithGoogle(idToken: string): Promise<AuthResult> {
  const res = await apiFetch('/auth/oauth', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })
  if (!res.ok) throw new Error('Error al iniciar sesión')
  return handleAuthResponse(await res.json())
}

export async function loginWithMicrosoft(code: string): Promise<AuthResult> {
  const res = await apiFetch('/auth/microsoft', {
    method: 'POST',
    body: JSON.stringify({ code, redirectUri: 'http://localhost:5173/auth/microsoft/callback' }),
  })
  if (!res.ok) throw new Error('Error al iniciar sesión con Microsoft')
  return handleAuthResponse(await res.json())
}

export async function completeRegistration(
  preAuthToken: string,
  rol: 'ALUMNO' | 'ADMINISTRATIVO',
): Promise<AuthResult> {
  const res = await apiFetch('/auth/complete-registration', {
    method: 'POST',
    body: JSON.stringify({ preAuthToken, rol }),
  })
  if (!res.ok) throw new Error('Error al completar registro')
  return handleAuthResponse(await res.json())
}

// ── Logout ────────────────────────────────────────────────────────────────────

export function logout() {
  removeToken()
  localStorage.removeItem('userData')
  clearPreAuthToken()
}

// ── Usuario actual ────────────────────────────────────────────────────────────

export async function getMe() {
  const res = await apiFetch('/usuarios/me')
  if (!res.ok) throw new Error()
  const data = await res.json()
  return { ...data, id: data.id?.toString() }
}
