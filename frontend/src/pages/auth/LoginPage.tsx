import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { loginWithGoogle } from '@/lib/auth'
import { savePreAuthToken } from '@/lib/auth'

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

  function handleGoogleLogin() {
    window.google.accounts.id.prompt()
  }

  function handleMicrosoftLogin() {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID
    const redirectUri = 'http://localhost:5173/auth/microsoft/callback'
    const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=openid profile email`
    window.location.href = url
  }

  const providerBtnStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    height: '44px',
    border: '1.5px solid #dadce0',
    borderRadius: '4px',
    background: '#fff',
    color: '#3c4043',
    fontSize: '14px',
    fontWeight: 500,
    fontFamily: 'Google Sans, Roboto, sans-serif',
    letterSpacing: '0.01em',
    cursor: 'pointer',
    transition: 'background 0.15s, box-shadow 0.15s',
  }

  function hoverOn(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = '#f8f9fa'
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.12)'
  }

  function hoverOff(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = '#fff'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0f2d55 0%, #1a4a8a 60%, #1e3a6e 100%)' }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-10"
          style={{ background: '#f59e0b', top: '-150px', right: '-100px' }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full opacity-10"
          style={{ background: '#3b82f6', bottom: '-100px', left: '-80px' }}
        />
      </div>

      <div
        className="relative z-10 bg-white w-full mx-4 overflow-hidden"
        style={{
          maxWidth: '480px',
          borderRadius: '24px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ height: '5px', background: 'linear-gradient(90deg, #1d4ed8, #f59e0b)' }} />

        <div
          className="flex flex-col items-center justify-center pt-12 pb-10 px-8"
          style={{ background: '#f0f6ff' }}
        >
          <img
            src="/traumatic_logo.png"
            alt="Traumatic"
            style={{ height: '160px', width: 'auto', objectFit: 'contain', marginBottom: '16px' }}
          />
          <h1
            className="font-bold tracking-tight text-center"
            style={{ fontSize: '22px', color: '#0f2d55', marginBottom: '4px' }}
          >
            Sistema de Gestión de Trámites Escolares
          </h1>
          <p style={{ fontSize: '14px', color: '#4a6fa5', textAlign: 'center' }}>
            Accede con tu cuenta institucional
          </p>
        </div>

        <div className="px-10 py-8 flex flex-col items-center gap-3">
          <p
            className="text-center font-medium mb-1"
            style={{ fontSize: '13px', color: '#64748b', letterSpacing: '0.04em', textTransform: 'uppercase' }}
          >
            Elige tu método de acceso
          </p>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            style={providerBtnStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continuar con Google
          </button>

          {/* Microsoft */}
          <button
            onClick={handleMicrosoftLogin}
            style={providerBtnStyle}
            onMouseEnter={hoverOn}
            onMouseLeave={hoverOff}
          >
            <svg width="18" height="18" viewBox="0 0 21 21">
              <rect x="1"  y="1"  width="9" height="9" fill="#f25022"/>
              <rect x="11" y="1"  width="9" height="9" fill="#7fba00"/>
              <rect x="1"  y="11" width="9" height="9" fill="#00a4ef"/>
              <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
            </svg>
            Continuar con Microsoft
          </button>

        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-center py-3"
          style={{ background: '#f8fafc', borderTop: '1px solid #e9edf2' }}
        >
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
            © {new Date().getFullYear()} Traumatic · Todos los derechos reservados
          </span>
        </div>
      </div>
    </div>
  )
}