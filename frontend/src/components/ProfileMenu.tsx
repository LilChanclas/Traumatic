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
        className="h-9 w-9 rounded-full bg-[#1E3A5F] flex items-center justify-center text-white text-sm font-semibold hover:bg-[#2C5282] transition"
      >
        {iniciales}
      </button>

      {/* Menú desplegable */}
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">

          {/* Info del usuario */}
          <div className="px-4 py-2 border-b border-gray-100 mb-1">
            <p className="text-sm font-medium text-[#2D3748]">{name}</p>
            <p className="text-xs text-gray-400">{rol}</p>
          </div>

          {/* Opciones */}
          <button
            onClick={handleChangePassword}
            className="w-full text-left px-4 py-2 text-sm text-[#2D3748] hover:bg-[#F5F7FA] transition"
          >
            Cambiar contraseña
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-[#8B1E3F] hover:bg-[#F5F7FA] transition"
          >
            Cerrar sesión
          </button>

        </div>
      )}

    </div>
  )
}