import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
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

    loginWithMicrosoft(code).then((result) => {
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
