import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { logout } from '@/lib/auth'

interface Props {
  name: string
  rol: string
  iniciales: string
}

export default function ProfileMenu({ name, rol, iniciales }: Props) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  // ✅ Cerrar menú al hacer click fuera (forma correcta)
  useEffect(() => {
    function handleClickOutside(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  // ✅ Logout
  async function handleLogout(e: React.MouseEvent) {
    e.stopPropagation()

    toast.success('Sesión cerrada correctamente')
    setOpen(false)

    logout()
    setTimeout(() => navigate('/'), 1000)
  }

  // ✅ Cambio de contraseña
  function handleChangePassword(e: React.MouseEvent) {
    e.stopPropagation()

    toast.success('Funcionalidad próximamente')
    setOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>

      {/* Botón perfil */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white text-sm font-semibold hover:bg-primary-hover transition"
      >
        {iniciales}
      </button>

      {/* Menú */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">

          {/* Info */}
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
