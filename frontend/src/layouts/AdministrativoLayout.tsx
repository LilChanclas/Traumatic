import { FiInbox, FiClipboard, FiBarChart2 } from 'react-icons/fi'
import BaseLayout from './BaseLayout'

const navItems = [
  { label: 'Dashboard', icon: FiInbox, path: '/administrativo/dashboard' },
  { label: 'Bandeja de entrada', icon: FiClipboard, path: '/administrativo/bandeja-de-entrada' },
  { label: 'Reportes', icon: FiBarChart2, path: '/administrativo/reportes' },
]

const user = {
  name: 'Juan Pérez',
  rol: 'Administrativo',
  iniciales: 'JP',
}

export default function AdministrativoLayout() {
  return <BaseLayout navItems={navItems} user={user} />
}