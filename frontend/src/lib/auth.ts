import { saveToken, apiFetch } from './api'

export async function loginWithGoogle(idToken: string): Promise<{ rol: string }> {
  const res = await apiFetch('/auth/oauth', {
    method: 'POST',
    body: JSON.stringify({ idToken }),
  })

  if (!res.ok) throw new Error('Error al iniciar sesión')

  const data = await res.json()
  saveToken(data.accessToken)

  return data.usuario
}

export async function loginWithMicrosoft(code: string): Promise<{ rol: string }> {
  const res = await apiFetch('/auth/microsoft', {
    method: 'POST',
    body: JSON.stringify({
      code,
      redirectUri: 'http://localhost:5173/auth/microsoft/callback',
    }),
  })

  if (!res.ok) throw new Error('Error al iniciar sesión con Microsoft')

  const data = await res.json()
  saveToken(data.accessToken)

  return data.usuario
}

export function logout() {
  localStorage.removeItem('token')
}

export async function getMe() {
  const res = await apiFetch('/usuarios/me')
  if (!res.ok) throw new Error()
  const data = await res.json()
  return {
    ...data,
    id: data.id.toString(), // BigInt viene como string
  }
}