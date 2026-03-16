import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Props {
  name: string
  rol: string
  iniciales: string
}

export default function ProfileMenu({ name, rol, iniciales }: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  // Cerrar el menú si se hace click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    setOpen(false)
    toast.success('Sesión cerrada correctamente')
    setTimeout(() => navigate('/'), 1000)
  }

  function handleChangePassword() {
    setOpen(false)
    toast('Funcionalidad próximamente', { icon: '🔒' })
  }

  return (
    <div className="relative" ref={menuRef}>

      {/* Bolita del perfil */}
      <button
        onClick={() => setOpen(!open)}
        className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold hover:bg-primary-hover transition"
      >
        {iniciales}
      </button>

      {/* Menú desplegable */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">

          {/* Info del usuario */}
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-medium text-text">{name}</p>
            <p className="text-xs text-gray-400">{rol}</p>
          </div>

          {/* Opciones */}
          <button
            onClick={handleChangePassword}
            className="w-full text-left px-4 py-2 text-sm text-text hover:bg-surface transition"
          >
            Cambiar contraseña
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-accent hover:bg-surface transition"
          >
            Cerrar sesión
          </button>

        </div>
      )}

    </div>
  )
}