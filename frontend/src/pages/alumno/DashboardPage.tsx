import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardCard from '../../components/DashboardCard'
import { apiFetch } from '@/lib/api'
import { FiFileText, FiPlusCircle } from 'react-icons/fi'

interface Tramite {
  idTramite: string
  folio: string
  estado: string
  createdAt: string
  tipoTramite: { nombre: string } | null
}

const ESTADO_STYLES: Record<string, string> = {
  ENVIADO:     'bg-blue-50 text-blue-700',
  EN_REVISION: 'bg-yellow-50 text-yellow-700',
  APROBADO:    'bg-green-50 text-green-700',
  RECHAZADO:   'bg-rose-50 text-rose-700',
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

export default function AlumnoDashboardPage() {
  const navigate = useNavigate()
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/tramites/mis-tramites')
      .then(r => r.json())
      .then(setTramites)
      .finally(() => setLoading(false))
  }, [])

  const ultimos3 = [...tramites].slice(0, 3)

  const enProceso = tramites.filter(
    t => t.estado === 'ENVIADO' || t.estado === 'EN_REVISION'
  )

  // Trámite más frecuente por tipo
  const conteo: Record<string, { nombre: string; count: number; ultima: string }> = {}
  tramites.forEach(t => {
    const nombre = t.tipoTramite?.nombre ?? 'Desconocido'
    if (!conteo[nombre]) conteo[nombre] = { nombre, count: 0, ultima: t.createdAt }
    conteo[nombre].count++
    if (t.createdAt > conteo[nombre].ultima) conteo[nombre].ultima = t.createdAt
  })
  const masFrecuente = Object.values(conteo).sort((a, b) => b.count - a.count)[0] ?? null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Cargando panel...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Mi Panel</h2>
        <p className="text-sm text-gray-500 mt-1">Resumen rápido de tus trámites recientes</p>
      </div>

      {tramites.length === 0 ? (
        /* Estado vacío */
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-gray-400">
          <FiFileText size={48} strokeWidth={1.2} />
          <p className="text-base font-medium text-gray-500">Aún no has solicitado ningún trámite</p>
          <p className="text-sm text-gray-400">Cuando envíes tu primera solicitud aparecerá aquí</p>
          <button
            onClick={() => navigate('/alumno/solicitar')}
            className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition"
          >
            <FiPlusCircle size={16} /> Solicitar trámite
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Tarjeta 1 — Últimos trámites */}
          <DashboardCard titulo="Últimos trámites">
            <div className="divide-y divide-gray-100">
              {ultimos3.map(t => (
                <div
                  key={t.idTramite}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-gray-50/60 rounded-lg px-1 -mx-1 transition"
                  onClick={() => navigate(`/alumno/historial?id=${t.idTramite}`)}
                >
                  <div>
                    <p className="text-sm font-medium text-text">{t.tipoTramite?.nombre ?? 'Trámite'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{fmtFecha(t.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap ${ESTADO_STYLES[t.estado] ?? 'bg-gray-100 text-gray-500'}`}>
                    {ESTADO_LABEL[t.estado] ?? t.estado}
                  </span>
                </div>
              ))}
            </div>
          </DashboardCard>

          {/* Tarjeta 2 — Más frecuente */}
          <DashboardCard titulo="Trámite más frecuente">
            {masFrecuente ? (
              <div className="flex flex-col justify-between h-full">
                <div>
                  <p className="text-lg font-bold text-text leading-snug">{masFrecuente.nombre}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Última vez: {fmtFecha(masFrecuente.ultima)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Solicitado {masFrecuente.count} {masFrecuente.count === 1 ? 'vez' : 'veces'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/alumno/solicitar')}
                  className="mt-6 w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-sm font-medium rounded-lg transition"
                >
                  Solicitar de nuevo
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sin datos aún.</p>
            )}
          </DashboardCard>

          {/* Tarjeta 3 — En proceso */}
          <DashboardCard titulo="En proceso">
            {enProceso.length === 0 ? (
              <p className="text-sm text-gray-400">No tienes trámites en proceso.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {enProceso.map(t => (
                  <div
                    key={t.idTramite}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0 cursor-pointer hover:bg-gray-50/60 rounded-lg px-1 -mx-1 transition"
                    onClick={() => navigate(`/alumno/historial?id=${t.idTramite}`)}
                  >
                    <div>
                      <p className="text-sm font-medium text-text">{t.tipoTramite?.nombre ?? 'Trámite'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{fmtFecha(t.createdAt)}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-md whitespace-nowrap ${ESTADO_STYLES[t.estado]}`}>
                      {ESTADO_LABEL[t.estado]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

        </div>
      )}
    </div>
  )
}
