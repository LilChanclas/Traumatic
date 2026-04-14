import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FaMicrosoft } from 'react-icons/fa'
import { loginWithGoogle, savePreAuthToken } from '@/lib/auth'

declare global {
  interface Window { google: any }
}

function navigateByResult(result: any, navigate: ReturnType<typeof useNavigate>) {
  if (result.type === 'needsRoleSelection') {
    savePreAuthToken(result.preAuthToken)
    navigate('/auth/seleccionar-rol')
    return
  }
  if (result.type === 'pending_approval') {
    navigate('/auth/pendiente')
    return
  }
  const rol = result.usuario?.rol
  if (rol === 'ADMIN') navigate('/admin/dashboard')
  else if (rol === 'ADMINISTRATIVO') navigate('/administrativo/dashboard')
  else navigate('/alumno/dashboard')
}

export default function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const initGoogle = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      })
      window.google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { theme: 'outline', size: 'large', width: 400 },
      )
    }

    if (window.google) { initGoogle(); return }

    const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
    if (script) {
      script.addEventListener('load', initGoogle)
      return () => script.removeEventListener('load', initGoogle)
    }
  }, [])

  async function handleCredentialResponse(response: any) {
    try {
      const result = await loginWithGoogle(response.credential)
      if (result.type === 'ok') toast.success('Bienvenido')
      navigateByResult(result, navigate)
    } catch {
      toast.error('Error al iniciar sesión')
    }
  }

  function handleMicrosoftLogin() {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID
    const redirectUri = 'http://localhost:5173/auth/microsoft/callback'
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=openid profile email`
    window.location.href = url
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md px-8 py-10">

        <div className="mb-10 text-center">
          <img src="/traumatic_logo.png" alt="Traumatic" className="h-40 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-800">Iniciar sesión</h1>
          <p className="text-sm text-gray-500 mt-2">Ingresa con tu cuenta institucional</p>
        </div>

        <div className="space-y-4 flex flex-col items-center">
          <div id="googleBtn" />

          <div className="flex items-center w-full gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={handleMicrosoftLogin}
            className="w-full flex items-center justify-center gap-2 border rounded-lg py-2 hover:bg-gray-50 transition cursor-pointer"
          >
            <FaMicrosoft className="text-lg" />
            Continuar con Microsoft
          </button>
        </div>

      </div>
    </div>
  )
}
