import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiBell, FiX, FiClock, FiCheckCircle, FiEye, FiAlertTriangle, FiSend } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface Alerta {
  idAlerta: string
  asunto: string
  descripcion: string
  estado: 'PENDIENTE' | 'VISTA' | 'RESPONDIDA'
  respuesta: string | null
  respondidaAt: string | null
  createdAt: string
  alumno: { nombre: string; apellidos: string; correo: string } | null
  tramite: {
    idTramite: string
    folio: string
    estado: string
    createdAt: string
    tipoTramite: { nombre: string } | null
  } | null
  adminResponde: { nombre: string; apellidos: string } | null
}

const TRAMITE_ESTADO_CONFIG: Record<string, { label: string; estilo: string }> = {
  ENVIADO:     { label: 'Enviado',     estilo: 'bg-blue-100 text-blue-700' },
  EN_REVISION: { label: 'En revisión', estilo: 'bg-yellow-100 text-yellow-700' },
  APROBADO:    { label: 'Aprobado',    estilo: 'bg-green-100 text-green-700' },
  RECHAZADO:   { label: 'Rechazado',   estilo: 'bg-red-100 text-red-700' },
  ENTREGADO:   { label: 'Entregado',   estilo: 'bg-gray-100 text-gray-600' },
}

const ESTADO_CONFIG = {
  PENDIENTE:  { label: 'Pendiente',  estilo: 'bg-orange-100 text-orange-700', icon: FiAlertTriangle },
  VISTA:      { label: 'Vista',       estilo: 'bg-blue-100 text-blue-700',    icon: FiEye },
  RESPONDIDA: { label: 'Respondida', estilo: 'bg-green-100 text-green-700',  icon: FiCheckCircle },
}

const FILTROS = [
  { value: '', label: 'Todas' },
  { value: 'PENDIENTE', label: 'Pendientes' },
  { value: 'VISTA', label: 'Vistas' },
  { value: 'RESPONDIDA', label: 'Respondidas' },
]

export default function AlertasAdminPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [expandida, setExpandida] = useState<string | null>(null)
  const [respuestaPendiente, setRespuestaPendiente] = useState<Record<string, string>>({})
  const [enviandoRespuesta, setEnviandoRespuesta] = useState<string | null>(null)

  useEffect(() => { cargar() }, [filtro])

  function cargar() {
    setLoading(true)
    const qs = filtro ? `?estado=${filtro}` : ''
    apiFetch(`/administrativo/alertas${qs}`)
      .then(r => r.json())
      .then(d => setAlertas(d.data ?? []))
      .catch(() => toast.error('Error al cargar alertas'))
      .finally(() => setLoading(false))
  }

  async function abrirAlerta(alerta: Alerta) {
    const yaAbierta = expandida === alerta.idAlerta
    setExpandida(yaAbierta ? null : alerta.idAlerta)

    if (!yaAbierta && alerta.estado === 'PENDIENTE') {
      try {
        const res = await apiFetch(`/administrativo/alertas/${alerta.idAlerta}/vista`, { method: 'PATCH' })
        if (res.ok) {
          setAlertas(prev => prev.map(a =>
            a.idAlerta === alerta.idAlerta ? { ...a, estado: 'VISTA' } : a
          ))
        }
      } catch {}
    }
  }

  async function enviarRespuesta(idAlerta: string) {
    const texto = respuestaPendiente[idAlerta]?.trim()
    if (!texto) { toast.error('Escribe una respuesta antes de enviar'); return }
    setEnviandoRespuesta(idAlerta)
    try {
      const res = await apiFetch(`/administrativo/alertas/${idAlerta}/responder`, {
        method: 'PATCH',
        body: JSON.stringify({ respuesta: texto }),
      })
      if (!res.ok) throw new Error()
      const actualizada: Alerta = await res.json()
      setAlertas(prev => prev.map(a => a.idAlerta === idAlerta ? actualizada : a))
      setRespuestaPendiente(prev => { const n = { ...prev }; delete n[idAlerta]; return n })
      toast.success('Respuesta enviada')
    } catch {
      toast.error('Error al enviar la respuesta')
    } finally {
      setEnviandoRespuesta(null)
    }
  }

  const pendientes = alertas.filter(a => a.estado === 'PENDIENTE').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-semibold text-primary">Alertas de Alumnos</h2>
            {pendientes > 0 && (
              <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendientes}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Recordatorios e incidentes reportados por los alumnos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${
              filtro === f.value
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Cargando alertas...
        </div>
      ) : alertas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <FiBell size={32} />
          <p className="text-sm">No hay alertas {filtro ? 'con este filtro' : 'registradas'}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map(a => {
            const cfg = ESTADO_CONFIG[a.estado]
            const Icon = cfg.icon
            const abierta = expandida === a.idAlerta
            return (
              <div
                key={a.idAlerta}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => abrirAlerta(a)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon
                      size={18}
                      className={`mt-0.5 shrink-0 ${
                        a.estado === 'PENDIENTE' ? 'text-orange-500' : a.estado === 'VISTA' ? 'text-blue-500' : 'text-green-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{a.asunto}</p>
                      {a.alumno && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {a.alumno.nombre} {a.alumno.apellidos} · {a.alumno.correo}
                        </p>
                      )}
                      {a.tramite && (
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className="text-xs text-gray-400">
                            {a.tramite.folio} — {a.tramite.tipoTramite?.nombre ?? 'Trámite'}
                          </p>
                          {TRAMITE_ESTADO_CONFIG[a.tramite.estado] && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TRAMITE_ESTADO_CONFIG[a.tramite.estado].estilo}`}>
                              {TRAMITE_ESTADO_CONFIG[a.tramite.estado].label}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <FiClock size={11} />
                        {new Date(a.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.estilo}`}>
                    {cfg.label}
                  </span>
                </button>

                {abierta && (
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
                    {a.tramite && (
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Trámite relacionado</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-gray-400">Folio</p>
                            <p className="text-sm font-semibold text-text">{a.tramite.folio}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Tipo</p>
                            <p className="text-sm font-medium text-text">{a.tramite.tipoTramite?.nombre ?? '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Estado actual</p>
                            {TRAMITE_ESTADO_CONFIG[a.tramite.estado] ? (
                              <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-0.5 ${TRAMITE_ESTADO_CONFIG[a.tramite.estado].estilo}`}>
                                {TRAMITE_ESTADO_CONFIG[a.tramite.estado].label}
                              </span>
                            ) : <p className="text-sm text-text">{a.tramite.estado}</p>}
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Fecha de envío</p>
                            <p className="text-sm text-text">
                              {new Date(a.tramite.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mensaje del alumno</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.descripcion}</p>
                    </div>

                    {a.respuesta ? (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                          Tu respuesta
                          {a.adminResponde && ` — ${a.adminResponde.nombre} ${a.adminResponde.apellidos}`}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.respuesta}</p>
                        {a.respondidaAt && (
                          <p className="text-xs text-gray-400">
                            {new Date(a.respondidaAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Responder al alumno</p>
                        <textarea
                          placeholder="Escribe tu respuesta aquí..."
                          value={respuestaPendiente[a.idAlerta] ?? ''}
                          onChange={e => setRespuestaPendiente(prev => ({ ...prev, [a.idAlerta]: e.target.value }))}
                          rows={3}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => enviarRespuesta(a.idAlerta)}
                            disabled={enviandoRespuesta === a.idAlerta}
                            className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                          >
                            <FiSend size={14} />
                            {enviandoRespuesta === a.idAlerta ? 'Enviando...' : 'Enviar respuesta'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
