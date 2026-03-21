import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { loginWithMicrosoft } from '@/lib/auth'

export default function MicrosoftCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      toast.error('Error al iniciar sesión con Microsoft')
      navigate('/')
      return
    }

    loginWithMicrosoft(code).then((usuario) => {
      toast.success('Bienvenido')
      if (usuario.rol === 'ALUMNO') navigate('/alumno/dashboard')
      else if (usuario.rol === 'ADMINISTRATIVO') navigate('/administrativo/dashboard')
      else navigate('/alumno/dashboard')
    }).catch(() => {
      toast.error('Error al iniciar sesión con Microsoft')
      navigate('/')
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Iniciando sesión...</p>
    </div>
  )
}