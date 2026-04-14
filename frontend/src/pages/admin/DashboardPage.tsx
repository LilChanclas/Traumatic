import { useEffect, useState } from 'react'
import { FiUsers, FiUserCheck, FiUserX, FiClock } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

interface Stats {
  total: number
  alumnos: number
  administrativos: number
  pendientes: number
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ total: 0, alumnos: 0, administrativos: 0, pendientes: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [todos, pendientes] = await Promise.all([
          apiFetch('/admin/usuarios').then(r => r.json()),
          apiFetch('/admin/usuarios?pendiente=true').then(r => r.json()),
        ])
        setStats({
          total: todos.length,
          alumnos: todos.filter((u: any) => u.rol === 'ALUMNO').length,
          administrativos: todos.filter((u: any) => u.rol === 'ADMINISTRATIVO').length,
          pendientes: pendientes.length,
        })
      } catch { /* silencioso */ }
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: 'Total usuarios', value: stats.total, icon: FiUsers, color: 'bg-blue-50 text-blue-600' },
    { label: 'Alumnos', value: stats.alumnos, icon: FiUserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Administrativos', value: stats.administrativos, icon: FiUserCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pendientes de aprobación', value: stats.pendientes, icon: FiClock, color: 'bg-amber-50 text-amber-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`inline-flex p-2.5 rounded-xl mb-3 ${c.color}`}>
                  <Icon size={20} />
                </div>
                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
              </div>
            )
          })}
        </div>
      )}

      {stats.pendientes > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiClock className="text-amber-500" size={22} />
            <div>
              <p className="font-semibold text-amber-800">
                {stats.pendientes} administrativo{stats.pendientes !== 1 ? 's' : ''} esperando aprobación
              </p>
              <p className="text-xs text-amber-600">Revisa las solicitudes pendientes para habilitar el acceso</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition"
          >
            Ver solicitudes
          </button>
        </div>
      )}
    </div>
  )
}
