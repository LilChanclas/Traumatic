import { Navigate } from 'react-router-dom'
import { GoHistory } from 'react-icons/go'
import { FiFileText, FiClipboard, FiHome } from 'react-icons/fi'
import BaseLayout from './BaseLayout'
import { getToken } from '@/lib/api'
import { getStoredUser as getUser } from '@/lib/auth'

const navItems = [
  { label: 'Dashboard', icon: FiHome, path: '/alumno/dashboard' },
  { label: 'Solicitar Trámite', icon: FiFileText, path: '/alumno/solicitar' },
  { label: 'Mis Trámites', icon: FiClipboard, path: '/alumno/tramites' },
  { label: 'Historial', icon: GoHistory, path: '/alumno/historial' },
]

export default function AlumnoLayout() {
  const token = getToken()
  const userData = getUser()

  if (!token || !userData) return <Navigate to="/" replace />
  if (userData.rol !== 'ALUMNO') return <Navigate to="/" replace />

  const iniciales = `${userData.nombre?.[0] ?? ''}${userData.apellidos?.[0] ?? ''}`.toUpperCase()

  return (
    <BaseLayout
      navItems={navItems}
      user={{
        name: `${userData.nombre} ${userData.apellidos}`,
        rol: 'Alumno',
        iniciales,
      }}
    />
  )
}
