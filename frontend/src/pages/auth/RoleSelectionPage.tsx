import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FiUser, FiBriefcase } from 'react-icons/fi'
import { completeRegistration, getPreAuthToken, clearPreAuthToken } from '@/lib/auth'

export default function RoleSelectionPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<'ALUMNO' | 'ADMINISTRATIVO' | null>(null)

  async function handleConfirm() {
    if (!selected) return

    const token = getPreAuthToken()
    if (!token) {
      toast.error('Sesión expirada, inicia sesión de nuevo')
      navigate('/')
      return
    }

    setLoading(true)
    try {
      const result = await completeRegistration(token, selected)
      clearPreAuthToken()

      if (result.type === 'pending_approval') {
        navigate('/auth/pendiente')
        return
      }

      toast.success('Cuenta creada correctamente')
      navigate('/alumno/dashboard')
    } catch {
      toast.error('Error al completar el registro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg px-8 py-10">

        <div className="text-center mb-8">
          <img src="/traumatic_logo.png" alt="Traumatic" className="h-28 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800">¿Cuál es tu rol?</h1>
          <p className="text-sm text-gray-500 mt-2">
            Selecciona cómo accederás al sistema
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Alumno */}
          <button
            onClick={() => setSelected('ALUMNO')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all cursor-pointer ${
              selected === 'ALUMNO'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`p-3 rounded-full ${selected === 'ALUMNO' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              <FiUser size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Alumno</p>
              <p className="text-xs text-gray-500 mt-1">Solicita y da seguimiento a tus trámites</p>
            </div>
          </button>

          {/* Administrativo */}
          <button
            onClick={() => setSelected('ADMINISTRATIVO')}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all cursor-pointer ${
              selected === 'ADMINISTRATIVO'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className={`p-3 rounded-full ${selected === 'ADMINISTRATIVO' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              <FiBriefcase size={24} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Administrativo</p>
              <p className="text-xs text-gray-500 mt-1">Gestiona y resuelve solicitudes de alumnos</p>
            </div>
          </button>
        </div>

        {selected === 'ADMINISTRATIVO' && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <strong>Nota:</strong> Las cuentas administrativas requieren aprobación del administrador del sistema antes de poder acceder.
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full py-3 rounded-xl bg-primary text-white font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90"
        >
          {loading ? 'Creando cuenta...' : 'Continuar'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="w-full mt-3 py-2 text-sm text-gray-400 hover:text-gray-600 transition"
        >
          Cancelar y volver al inicio
        </button>

      </div>
    </div>
  )
}
