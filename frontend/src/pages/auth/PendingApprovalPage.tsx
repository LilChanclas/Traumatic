import { useNavigate } from 'react-router-dom'
import { FiClock } from 'react-icons/fi'
import { logout } from '@/lib/auth'

export default function PendingApprovalPage() {
  const navigate = useNavigate()

  function handleBack() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-white rounded-2xl shadow-md w-full max-w-md px-8 py-12 text-center">

        <div className="flex justify-center mb-6">
          <div className="p-5 rounded-full bg-amber-100 text-amber-500">
            <FiClock size={40} />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          Cuenta pendiente de aprobación
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          Tu solicitud de acceso como <strong>Administrativo</strong> ha sido recibida. El administrador del sistema revisará tu cuenta y te notificará cuando sea aprobada.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-2 text-sm text-gray-600">
          <p className="font-medium text-gray-700">¿Qué sigue?</p>
          <ul className="space-y-1 list-disc list-inside text-gray-500">
            <li>El administrador recibirá tu solicitud</li>
            <li>Una vez aprobada, podrás iniciar sesión normalmente</li>
            <li>Si tienes dudas, contacta a soporte institucional</li>
          </ul>
        </div>

        <button
          onClick={handleBack}
          className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition font-medium"
        >
          Volver al inicio de sesión
        </button>

      </div>
    </div>
  )
}
