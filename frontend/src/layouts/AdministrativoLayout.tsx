import { Navigate } from 'react-router-dom'
import { FiInbox, FiClipboard, FiBarChart2 } from 'react-icons/fi'
import BaseLayout from './BaseLayout'
import { getToken } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

const navItems = [
  { label: 'Dashboard', icon: FiInbox, path: '/administrativo/dashboard' },
  { label: 'Bandeja de entrada', icon: FiClipboard, path: '/administrativo/bandeja-de-entrada' },
  { label: 'Reportes', icon: FiBarChart2, path: '/administrativo/reportes' },
]

export default function AdministrativoLayout() {
  const token = getToken()
  const userData = getStoredUser()

  if (!token || !userData) return <Navigate to="/" replace />
  if (userData.rol !== 'ADMINISTRATIVO') return <Navigate to="/" replace />

  const iniciales = `${userData.nombre?.[0] ?? ''}${userData.apellidos?.[0] ?? ''}`.toUpperCase()

  return (
    <BaseLayout
      navItems={navItems}
      user={{
        name: `${userData.nombre} ${userData.apellidos}`,
        rol: 'Administrativo',
        iniciales,
      }}
    />
  )
}
