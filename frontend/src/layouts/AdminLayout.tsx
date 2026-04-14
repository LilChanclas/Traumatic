import { Navigate } from 'react-router-dom'
import { FiHome, FiUsers, FiSettings } from 'react-icons/fi'
import BaseLayout from './BaseLayout'
import { getToken } from '@/lib/api'
import { getStoredUser } from '@/lib/auth'

const navItems = [
  { label: 'Dashboard', icon: FiHome, path: '/admin/dashboard' },
  { label: 'Usuarios', icon: FiUsers, path: '/admin/usuarios' },
  { label: 'Tipos de Trámite', icon: FiSettings, path: '/admin/tramites' },
]

export default function AdminLayout() {
  const token = getToken()
  const userData = getStoredUser()

  if (!token || !userData) return <Navigate to="/" replace />
  if (userData.rol !== 'ADMIN') return <Navigate to="/" replace />

  const iniciales = `${userData.nombre?.[0] ?? ''}${userData.apellidos?.[0] ?? ''}`.toUpperCase()

  return (
    <BaseLayout
      navItems={navItems}
      user={{
        name: `${userData.nombre} ${userData.apellidos}`,
        rol: 'Administrador',
        iniciales,
      }}
    />
  )
}
