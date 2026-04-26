import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner";
import { loginWithMicrosoft, savePreAuthToken } from '@/lib/auth'

export default function MicrosoftCallback() {
  const navigate = useNavigate()
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      toast.error('Error al iniciar sesión con Microsoft')
      navigate('/')
      return
    }

    loginWithMicrosoft(code)
      .then((result) => {
        if (result.type === 'needsRoleSelection') {
          savePreAuthToken(result.preAuthToken)
          navigate('/auth/seleccionar-rol')
          return
        }
        if (result.type === 'pending_approval') {
          navigate('/auth/pendiente')
          return
        }
        toast.success('Bienvenido')
        const rol = result.usuario?.rol
        if (rol === 'ADMIN') navigate('/admin/dashboard')
        else if (rol === 'ADMINISTRATIVO') navigate('/administrativo/dashboard')
        else navigate('/alumno/dashboard')
      })
      .catch(() => {
        toast.error('Error al iniciar sesión con Microsoft')
        navigate('/')
      })
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-stone-50">

      <style>{`
        @keyframes spinCw  { to { transform: rotate(360deg);  } }
        @keyframes spinCcw { to { transform: rotate(-360deg); } }
        @keyframes pulse   { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .ring-outer {
          animation: spinCw 0.8s linear infinite;
        }
        .ring-inner {
          animation: spinCcw 0.8s linear infinite;
          opacity: 0.45;
        }
        .pulse-text {
          animation: pulse 1.9s ease-in-out infinite;
        }
      `}</style>

      {/* Spinner de dos anillos contra-rotativos */}
      <div className="relative w-11 h-11">
        {/* Anillo exterior */}
        <div className="ring-outer absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-[#101e3a] border-r-[#101e3a]" />
        {/* Anillo interior */}
        <div className="ring-inner absolute inset-[5px] rounded-full border-[2px] border-transparent border-b-[#6aa0ff] border-l-[#6aa0ff]" />
      </div>

      {/* Texto + logo de Microsoft */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Cuatro cuadros de Microsoft */}
        <span className="grid grid-cols-2 gap-[2.5px] w-[14px] h-[14px]">
          <span className="rounded-[1px] bg-[#f25022]" />
          <span className="rounded-[1px] bg-[#7fba00]" />
          <span className="rounded-[1px] bg-[#00a4ef]" />
          <span className="rounded-[1px] bg-[#ffb900]" />
        </span>
        <p className="pulse-text text-[0.82rem] text-gray-400 font-light tracking-wide">
          Verificando con Microsoft…
        </p>
      </div>

    </div>
  )
}