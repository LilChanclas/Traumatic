import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { FiFileText, FiTrendingUp, FiCheckCircle, FiXCircle, FiClock, FiInbox } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface Tramite {
  idTramite: string
  folio: string
  estado: string
  createdAt: string
  tipoTramite: { nombre: string } | null
  usuario: { nombre: string; apellidos: string } | null
}

const ESTADO_LABEL: Record<string, string> = {
  ENVIADO:     'Enviado',
  EN_REVISION: 'En revisión',
  APROBADO:    'Aprobado',
  RECHAZADO:   'Rechazado',
  ENTREGADO:   'Entregado',
}

const ESTADO_COLOR: Record<string, string> = {
  ENVIADO:     'bg-blue-500',
  EN_REVISION: 'bg-yellow-500',
  APROBADO:    'bg-green-500',
  RECHAZADO:   'bg-red-500',
  ENTREGADO:   'bg-gray-400',
}

const ESTADO_LIGHT: Record<string, string> = {
  ENVIADO:     'bg-blue-100 text-blue-700',
  EN_REVISION: 'bg-yellow-100 text-yellow-700',
  APROBADO:    'bg-green-100 text-green-700',
  RECHAZADO:   'bg-red-100 text-red-700',
  ENTREGADO:   'bg-gray-100 text-gray-600',
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ReportesPage() {
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/administrativo/tramites')
      .then(r => r.json())
      .then(setTramites)
      .catch(() => toast.error('Error al cargar reportes'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Cargando reportes...</div>
  }

  const total = tramites.length

  // ── Por estado ────────────────────────────────────────────────────────────
  const porEstado = Object.entries(ESTADO_LABEL).map(([key, label]) => {
    const count = tramites.filter(t => t.estado === key).length
    const pct = total > 0 ? Math.round((count / total) * 100) : 0
    return { key, label, count, pct }
  }).filter(e => e.count > 0)

  // ── Por tipo ──────────────────────────────────────────────────────────────
  const tipoMap: Record<string, number> = {}
  tramites.forEach(t => {
    const nombre = t.tipoTramite?.nombre ?? 'Sin tipo'
    tipoMap[nombre] = (tipoMap[nombre] ?? 0) + 1
  })
  const porTipo = Object.entries(tipoMap)
    .map(([nombre, count]) => ({ nombre, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
    .sort((a, b) => b.count - a.count)

  // ── KPIs rápidos ──────────────────────────────────────────────────────────
  const resueltos = tramites.filter(t => t.estado === 'APROBADO' || t.estado === 'ENTREGADO').length
  const rechazados = tramites.filter(t => t.estado === 'RECHAZADO').length
  const enCurso = tramites.filter(t => t.estado === 'ENVIADO' || t.estado === 'EN_REVISION').length
  const tasaAprobacion = total > 0 ? Math.round(((resueltos) / total) * 100) : 0

  const kpis = [
    { label: 'Total trámites',   value: total,           icon: FiFileText,    cls: 'bg-blue-50 text-blue-600' },
    { label: 'En curso',         value: enCurso,         icon: FiClock,       cls: 'bg-yellow-50 text-yellow-600' },
    { label: 'Resueltos',        value: resueltos,        icon: FiCheckCircle, cls: 'bg-green-50 text-green-600' },
    { label: 'Rechazados',       value: rechazados,       icon: FiXCircle,     cls: 'bg-red-50 text-red-600' },
    { label: 'Tasa de aprobación', value: `${tasaAprobacion}%`, icon: FiTrendingUp, cls: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Reportes</h2>
        <p className="text-sm text-gray-500 mt-1">Estadísticas generales de los trámites atendidos</p>
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <FiInbox size={36} strokeWidth={1.2} />
          <p className="text-sm">No hay trámites registrados aún para generar reportes.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpis.map(k => {
              const Icon = k.icon
              return (
                <div key={k.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className={`inline-flex p-2 rounded-lg mb-2 ${k.cls}`}>
                    <Icon size={15} />
                  </div>
                  <p className="text-xl font-bold text-gray-800">{k.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{k.label}</p>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Distribución por estado */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Distribución por estado</h3>
              <div className="space-y-3">
                {porEstado.map(e => (
                  <div key={e.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ESTADO_LIGHT[e.key]}`}>
                        {e.label}
                      </span>
                      <span className="text-xs text-gray-500">{e.count} ({e.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${ESTADO_COLOR[e.key]}`}
                        style={{ width: `${e.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trámites más solicitados */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Tipos más solicitados</h3>
              <div className="space-y-3">
                {porTipo.map((t, i) => (
                  <div key={t.nombre}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                        <span className="text-sm text-gray-700 truncate max-w-[180px]">{t.nombre}</span>
                      </div>
                      <span className="text-xs text-gray-500">{t.count} ({t.pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${t.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Listado reciente */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FiFileText size={14} className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700">Trámites recientes</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Folio</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Alumno</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 hidden md:table-cell">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500">Estado</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 hidden sm:table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tramites.slice(0, 10).map(t => (
                  <tr key={t.idTramite} className="hover:bg-gray-50/50 transition">
                    <td className="px-5 py-3 font-medium text-gray-800">{t.folio}</td>
                    <td className="px-5 py-3 text-gray-600 hidden sm:table-cell">
                      {t.usuario ? `${t.usuario.nombre} ${t.usuario.apellidos}` : '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-500 hidden md:table-cell">
                      {t.tipoTramite?.nombre ?? '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${ESTADO_LIGHT[t.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                        {ESTADO_LABEL[t.estado] ?? t.estado}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">
                      {fmtFecha(t.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
