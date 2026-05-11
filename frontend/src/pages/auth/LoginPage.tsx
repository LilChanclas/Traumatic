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
        auto_select: false,
      })

      window.google.accounts.id.renderButton(
        document.getElementById('googleButtonDiv'),
        {
          width: 398,
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'center',
        }
      )
    }

    if (window.google) {
      initGoogle()
      return
    }

    const script = document.querySelector(
      'script[src*="accounts.google.com/gsi/client"]'
    )

    if (script) {
      script.addEventListener('load', initGoogle)

      return () => {
        script.removeEventListener('load', initGoogle)
      }
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

    const url =
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
    `?client_id=${clientId}` +
    `&response_type=code` +
    `&redirect_uri=${redirectUri}` +
    `&response_mode=query` +
    `&scope=openid profile email` +
    `&prompt=select_account`

    window.location.href = url
  }

  const providerBtnStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '40px',
    border: '1px solid #dadce0',
    borderRadius: '4px',
    background: '#fff',
    color: '#3c4043',
    fontSize: '14px',
   
    fontFamily: 'Roboto, sans-serif',
    cursor: 'pointer',
    transition: 'background 0.2s',
  }

  function hoverOn(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = '#eef5fb'
  }

  function hoverOff(e: React.MouseEvent<HTMLButtonElement>) {
    e.currentTarget.style.background = '#fff'
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
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div id="googleButtonDiv"></div>
          </div>
            

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