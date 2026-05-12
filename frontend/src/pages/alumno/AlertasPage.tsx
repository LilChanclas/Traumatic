import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { FiBell, FiPlus, FiX, FiClock, FiCheckCircle, FiEye, FiAlertTriangle } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface Tramite {
  idTramite: string
  folio: string
  tipoTramite: { nombre: string } | null
}

interface Alerta {
  idAlerta: string
  asunto: string
  descripcion: string
  estado: 'PENDIENTE' | 'VISTA' | 'RESPONDIDA'
  respuesta: string | null
  respondidaAt: string | null
  createdAt: string
  tramite: { idTramite: string; folio: string; tipoTramite: { nombre: string } | null } | null
  adminResponde: { nombre: string; apellidos: string } | null
}

const ESTADO_CONFIG = {
  PENDIENTE:   { label: 'Pendiente',   estilo: 'bg-orange-100 text-orange-700', icon: FiAlertTriangle },
  VISTA:       { label: 'Vista',        estilo: 'bg-blue-100 text-blue-700',    icon: FiEye },
  RESPONDIDA:  { label: 'Respondida',  estilo: 'bg-green-100 text-green-700',  icon: FiCheckCircle },
}

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [enviando, setEnviando] = useState(false)
  const [expandida, setExpandida] = useState<string | null>(null)

  const [form, setForm] = useState({ asunto: '', descripcion: '', idTramite: '' })

  useEffect(() => {
    cargarAlertas()
    apiFetch('/tramites/mis-tramites')
      .then(r => r.json())
      .then(setTramites)
      .catch(() => {})
  }, [])

  function cargarAlertas() {
    setLoading(true)
    apiFetch('/alertas/mis-alertas')
      .then(r => r.json())
      .then(setAlertas)
      .catch(() => toast.error('Error al cargar alertas'))
      .finally(() => setLoading(false))
  }

  async function enviarAlerta(e: React.FormEvent) {
    e.preventDefault()
    if (!form.asunto.trim() || !form.descripcion.trim()) {
      toast.error('El asunto y la descripción son requeridos')
      return
    }
    if (!form.idTramite) {
      toast.error('Debes seleccionar el trámite relacionado con tu alerta')
      return
    }
    setEnviando(true)
    try {
      const body: Record<string, string> = { asunto: form.asunto, descripcion: form.descripcion, idTramite: form.idTramite }
      const res = await apiFetch('/alertas', { method: 'POST', body: JSON.stringify(body) })
      if (!res.ok) throw new Error()
      toast.success('Alerta enviada correctamente')
      setMostrarModal(false)
      setForm({ asunto: '', descripcion: '', idTramite: '' })
      cargarAlertas()
    } catch {
      toast.error('Error al enviar la alerta')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary">Mis Alertas</h2>
          <p className="text-sm text-gray-500 mt-1">Envía recordatorios o reporta incidentes al equipo administrativo</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            onClick={() => setMostrarModal(true)}
            disabled={tramites.length === 0}
            title={tramites.length === 0 ? 'Necesitas tener al menos un trámite para enviar una alerta' : undefined}
            className="flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={16} />
            Nueva Alerta
          </button>
          {tramites.length === 0 && !loading && (
            <p className="text-xs text-gray-400">Debes tener un trámite activo para enviar alertas</p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
          Cargando alertas...
        </div>
      ) : alertas.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <FiBell size={32} />
          <p className="text-sm">No has enviado ninguna alerta todavía.</p>
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
                  onClick={() => setExpandida(abierta ? null : a.idAlerta)}
                  className="w-full text-left px-5 py-4 flex items-start justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Icon size={18} className={`mt-0.5 shrink-0 ${a.estado === 'PENDIENTE' ? 'text-orange-500' : a.estado === 'VISTA' ? 'text-blue-500' : 'text-green-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text truncate">{a.asunto}</p>
                      {a.tramite && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Trámite: {a.tramite.folio} — {a.tramite.tipoTramite?.nombre ?? ''}
                        </p>
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
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Tu mensaje</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.descripcion}</p>
                    </div>
                    {a.respuesta && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-1">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">
                          Respuesta del administrativo
                          {a.adminResponde && ` — ${a.adminResponde.nombre} ${a.adminResponde.apellidos}`}
                        </p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{a.respuesta}</p>
                        {a.respondidaAt && (
                          <p className="text-xs text-gray-400">
                            {new Date(a.respondidaAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )}
                    {a.estado === 'VISTA' && !a.respuesta && (
                      <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                        El equipo administrativo ya revisó tu alerta y está procesándola.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal nueva alerta */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text">Nueva Alerta</h3>
              <button onClick={() => setMostrarModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={enviarAlerta} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Asunto *</label>
                <input
                  type="text"
                  placeholder="Ej: Trámite sin atención desde hace 2 semanas"
                  value={form.asunto}
                  onChange={e => setForm(f => ({ ...f, asunto: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Descripción *</label>
                <textarea
                  placeholder="Describe detalladamente el problema o recordatorio que deseas comunicar..."
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Trámite relacionado <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.idTramite}
                  onChange={e => setForm(f => ({ ...f, idTramite: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                  required
                >
                  <option value="">— Selecciona un trámite —</option>
                  {tramites.map(t => (
                    <option key={t.idTramite} value={t.idTramite}>
                      {t.folio} — {t.tipoTramite?.nombre ?? 'Trámite'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="text-sm px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="text-sm px-5 py-2 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                  {enviando ? 'Enviando...' : 'Enviar Alerta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
