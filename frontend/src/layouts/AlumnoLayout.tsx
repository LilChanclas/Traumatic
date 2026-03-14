import { GoHistory } from 'react-icons/go'
import { FiFileText, FiClipboard, FiHome } from 'react-icons/fi'
import BaseLayout from './BaseLayout'

const navItems = [
  { label: 'Dashboard', icon: FiHome, path: '/alumno/dashboard' },
  { label: 'Solicitar Trámite', icon: FiFileText, path: '/alumno/solicitar' },
  { label: 'Mis Trámites', icon: FiClipboard, path: '/alumno/tramites' },
  { label: 'Historial', icon: GoHistory, path: '/alumno/historial' },
]

const user = {
  name: 'Humberto',
  rol: 'Alumno',
  //opcional
  iniciales: 'H',
}

export default function AlumnoLayout() {
  return <BaseLayout navItems={navItems} user={user} />
}