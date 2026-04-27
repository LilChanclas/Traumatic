import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardCard from '../../components/DashboardCard'
import KpiCard from '../../components/KpiCard'
import { FiClock, FiCheckCircle, FiXCircle, FiInbox, FiFileText } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

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

export default function AdministrativoDashboardPage() {
  const navigate = useNavigate()
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/administrativo/tramites?pageSize=50')
      .then(r => r.json())
      .then(json => setTramites(json.data ?? json))
      .finally(() => setLoading(false))
  }, [])

  const pendientes   = tramites.filter(t => t.estado === 'ENVIADO').length
  const revision     = tramites.filter(t => t.estado === 'EN_REVISION').length
  const aprobados    = tramites.filter(t => t.estado === 'APROBADO').length
  const rechazados   = tramites.filter(t => t.estado === 'RECHAZADO').length
  const ultimos      = tramites.slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Dashboard</h2>
        <p className="text-sm text-gray-500">Vista general del estado de los trámites escolares</p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard title="Pendientes"  value={loading ? '—' : pendientes} subtitle="Solicitudes recién enviadas"   icon={FiInbox}       />
        <KpiCard title="En revisión" value={loading ? '—' : revision}   subtitle="Trámites siendo procesados"   icon={FiClock}       />
        <KpiCard title="Aprobados"   value={loading ? '—' : aprobados}  subtitle="Resueltos favorablemente"     icon={FiCheckCircle} />
        <KpiCard title="Rechazados"  value={loading ? '—' : rechazados} subtitle="Con observaciones o motivo"   icon={FiXCircle}     />
      </section>

      <section>
        <DashboardCard>
          <div className="flex items-center gap-2 mb-5">
            <FiFileText className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">Últimos trámites recibidos</h3>
          </div>

          {loading ? (
            <p className="text-sm text-gray-400 py-4 text-center">Cargando trámites...</p>
          ) : tramites.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No hay trámites registrados aún.</p>
          ) : (
            <div className="space-y-3">
              {ultimos.map(t => (
                <div
                  key={t.idTramite}
                  onClick={() => navigate('/administrativo/bandeja-de-entrada')}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 transition hover:bg-gray-50 cursor-pointer md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{t.folio}</p>
                      <span className="text-xs text-gray-400">·</span>
                      <p className="text-sm text-gray-600 truncate">
                        {t.usuario ? `${t.usuario.nombre} ${t.usuario.apellidos}` : '—'}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{t.tipoTramite?.nombre ?? 'Trámite'}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_STYLES[t.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                      {ESTADO_LABEL[t.estado] ?? t.estado}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{fmtFecha(t.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </DashboardCard>
      </section>
    </div>
  )
}
