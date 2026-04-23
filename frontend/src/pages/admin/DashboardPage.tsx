import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiUsers, FiUserCheck, FiClock, FiFileText, FiInbox } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface Stats {
  total: number
  alumnos: number
  administrativos: number
  pendientes: number
}

interface Tramite {
  idTramite: string
  folio: string
  estado: string
  createdAt: string
  tipoTramite: { nombre: string } | null
  usuario: { nombre: string; apellidos: string } | null
}

const ESTADO_STYLES: Record<string, string> = {
  ENVIADO:     'bg-blue-100 text-blue-700',
  EN_REVISION: 'bg-yellow-100 text-yellow-700',
  APROBADO:    'bg-green-100 text-green-700',
  RECHAZADO:   'bg-red-100 text-red-700',
  ENTREGADO:   'bg-gray-100 text-gray-600',
}

const ESTADO_LABEL: Record<string, string> = {
  ENVIADO:     'Enviado',
  EN_REVISION: 'En revisión',
  APROBADO:    'Aprobado',
  RECHAZADO:   'Rechazado',
  ENTREGADO:   'Entregado',
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats>({ total: 0, alumnos: 0, administrativos: 0, pendientes: 0 })
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingTramites, setLoadingTramites] = useState(true)

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
      finally { setLoadingStats(false) }
    }

    async function fetchTramites() {
      try {
        const res = await apiFetch('/admin/tramites')
        if (res.ok) setTramites(await res.json())
      } catch { /* silencioso */ }
      finally { setLoadingTramites(false) }
    }

    fetchStats()
    fetchTramites()
  }, [])

  const tramiteStats = {
    enviados:    tramites.filter(t => t.estado === 'ENVIADO').length,
    enRevision:  tramites.filter(t => t.estado === 'EN_REVISION').length,
    aprobados:   tramites.filter(t => t.estado === 'APROBADO').length,
    rechazados:  tramites.filter(t => t.estado === 'RECHAZADO').length,
  }

  const userCards = [
    { label: 'Total usuarios',            value: stats.total,            icon: FiUsers,     color: 'bg-blue-50 text-blue-600' },
    { label: 'Alumnos',                   value: stats.alumnos,          icon: FiUserCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Administrativos',           value: stats.administrativos,  icon: FiUserCheck, color: 'bg-purple-50 text-purple-600' },
    { label: 'Pendientes de aprobación',  value: stats.pendientes,       icon: FiClock,     color: 'bg-amber-50 text-amber-600' },
  ]

  const tramiteCards = [
    { label: 'Enviados',     value: tramiteStats.enviados,   color: 'bg-blue-50 text-blue-600' },
    { label: 'En revisión',  value: tramiteStats.enRevision, color: 'bg-yellow-50 text-yellow-600' },
    { label: 'Aprobados',    value: tramiteStats.aprobados,  color: 'bg-green-50 text-green-600' },
    { label: 'Rechazados',   value: tramiteStats.rechazados, color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
        <p className="text-gray-500 text-sm mt-1">Resumen general del sistema</p>
      </div>

      {/* Alerta de pendientes */}
      {!loadingStats && stats.pendientes > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FiClock className="text-amber-500 shrink-0" size={22} />
            <div>
              <p className="font-semibold text-amber-800">
                {stats.pendientes} administrativo{stats.pendientes !== 1 ? 's' : ''} esperando aprobación
              </p>
              <p className="text-xs text-amber-600">Revisa las solicitudes pendientes para habilitar el acceso</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/usuarios')}
            className="px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition shrink-0"
          >
            Ver solicitudes
          </button>
        </div>
      )}

      {/* KPIs — Usuarios */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FiUsers size={15} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-600">Usuarios</h3>
        </div>
        {loadingStats ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {userCards.map(c => {
              const Icon = c.icon
              return (
                <div
                  key={c.label}
                  onClick={() => navigate('/admin/usuarios')}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
                >
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
      </section>

      {/* KPIs — Trámites */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <FiFileText size={15} className="text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-600">Trámites</h3>
        </div>
        {loadingTramites ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tramiteCards.map(c => (
              <div key={c.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`inline-flex w-2 h-2 rounded-full mb-3 ${c.color.replace('text-', 'bg-').split(' ')[0]}`} />
                <p className="text-2xl font-bold text-gray-800">{c.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Últimos trámites */}
      <section>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <FiInbox size={15} className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Últimos trámites del sistema</h3>
          </div>

          {loadingTramites ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : tramites.length === 0 ? (
            <p className="text-sm text-gray-400 p-5 text-center">No hay trámites registrados aún.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {tramites.slice(0, 6).map(t => (
                <div key={t.idTramite} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50/60 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{t.folio}</p>
                      <span className="text-gray-300 text-xs">·</span>
                      <p className="text-sm text-gray-500 truncate">
                        {t.usuario ? `${t.usuario.nombre} ${t.usuario.apellidos}` : '—'}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{t.tipoTramite?.nombre ?? 'Trámite'}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${ESTADO_STYLES[t.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                    {ESTADO_LABEL[t.estado] ?? t.estado}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">{fmtFecha(t.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
