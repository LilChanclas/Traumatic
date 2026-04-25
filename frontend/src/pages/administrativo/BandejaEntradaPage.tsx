import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  FiFileText, FiChevronDown, FiChevronUp, FiPaperclip,
  FiExternalLink, FiSearch, FiUser, FiList, FiGrid,
} from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface Documento {
  idDocumento: string
  nombreArchivo: string
  rutaAlmacenamiento: string
  tipoMime: string
}

interface HistorialEntry {
  idHistorial: string
  estadoAnterior: string | null
  estadoNuevo: string
  comentario: string | null
  createdAt: string
  usuario: { nombre: string; apellidos: string; rol: string } | null
}

interface Tramite {
  idTramite: string
  folio: string
  estado: string
  comentariosAlumno: string | null
  motivoRechazo: string | null
  createdAt: string
  tipoTramite: { nombre: string; docsRequeridos: string[] } | null
  usuario: { id: string; nombre: string; apellidos: string; correo: string; fotoUrl: string | null } | null
  documentos: Documento[]
  historial: HistorialEntry[]
}

type EstadoTramite = 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'ENTREGADO'

const COLUMNAS_KANBAN = [
  { estado: 'ENVIADO',     label: 'Enviado',     color: 'border-blue-400',   header: 'bg-blue-50 text-blue-700' },
  { estado: 'EN_REVISION', label: 'En revisión', color: 'border-yellow-400', header: 'bg-yellow-50 text-yellow-700' },
  { estado: 'APROBADO',    label: 'Aprobado',    color: 'border-green-400',  header: 'bg-green-50 text-green-700' },
  { estado: 'RECHAZADO',   label: 'Rechazado',   color: 'border-red-400',    header: 'bg-red-50 text-red-700' },
  { estado: 'ENTREGADO',   label: 'Entregado',   color: 'border-gray-300',   header: 'bg-gray-50 text-gray-600' },
]

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

const TRANSICIONES: Record<string, { label: string; estado: EstadoTramite; cls: string }[]> = {
  ENVIADO: [
    { label: 'Tomar en revisión', estado: 'EN_REVISION', cls: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
    { label: 'Rechazar',          estado: 'RECHAZADO',   cls: 'bg-red-500 hover:bg-red-600 text-white' },
  ],
  EN_REVISION: [
    { label: 'Aprobar',  estado: 'APROBADO',  cls: 'bg-green-600 hover:bg-green-700 text-white' },
    { label: 'Rechazar', estado: 'RECHAZADO', cls: 'bg-red-500 hover:bg-red-600 text-white' },
  ],
  APROBADO: [
    { label: 'Marcar entregado', estado: 'ENTREGADO', cls: 'bg-gray-600 hover:bg-gray-700 text-white' },
  ],
}

function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_STYLES[estado] ?? 'bg-gray-100 text-gray-500'}`}>
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  )
}

function fmtFecha(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

export default function BandejaEntradaPage() {
  const [tramites, setTramites]       = useState<Tramite[]>([])
  const [loading, setLoading]         = useState(true)
  const [vista, setVista]             = useState<'lista' | 'kanban'>('kanban')
  const [filterEstado, setFilterEstado] = useState('')
  const [search, setSearch]           = useState('')
  const [expandido, setExpandido]     = useState<string | null>(null)
  const [accionModal, setAccionModal] = useState<{ tramite: Tramite; estado: EstadoTramite; label: string } | null>(null)
  const [comentario, setComentario]   = useState('')
  const [guardando, setGuardando]     = useState(false)

  async function fetchTramites() {
    setLoading(true)
    try {
      const qs = filterEstado ? `?estado=${filterEstado}` : ''
      const res = await apiFetch(`/administrativo/tramites${qs}`)
      if (!res.ok) throw new Error()
      setTramites(await res.json())
    } catch {
      toast.error('Error al cargar trámites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTramites() }, [filterEstado])

  const filtered = tramites.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.folio.toLowerCase().includes(q) ||
      t.tipoTramite?.nombre.toLowerCase().includes(q) ||
      `${t.usuario?.nombre} ${t.usuario?.apellidos}`.toLowerCase().includes(q)
    )
  })

  function abrirAccion(tramite: Tramite, estado: EstadoTramite, label: string) {
    setAccionModal({ tramite, estado, label })
    setComentario('')
  }

  async function confirmarAccion() {
    if (!accionModal) return
    if (accionModal.estado === 'RECHAZADO' && !comentario.trim()) {
      toast.error('Debes indicar el motivo del rechazo')
      return
    }
    setGuardando(true)
    try {
      const res = await apiFetch(`/administrativo/tramites/${accionModal.tramite.idTramite}/estado`, {
        method: 'PATCH',
        body: JSON.stringify({ estado: accionModal.estado, comentario: comentario.trim() || undefined }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Error')
      }
      toast.success(`Trámite → "${ESTADO_LABEL[accionModal.estado]}"`)
      setAccionModal(null)
      fetchTramites()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al actualizar')
    } finally {
      setGuardando(false)
    }
  }

  const pendientesCount  = tramites.filter(t => t.estado === 'ENVIADO').length
  const enRevisionCount  = tramites.filter(t => t.estado === 'EN_REVISION').length

  return (
    <div className="space-y-6">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Bandeja de entrada</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona y atiende los trámites de los alumnos</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => setVista('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${vista === 'kanban' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiGrid size={14} /> Kanban
          </button>
          <button
            onClick={() => setVista('lista')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${vista === 'lista' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FiList size={14} /> Lista
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total',       value: tramites.length,    cls: 'text-blue-600 bg-blue-50' },
          { label: 'Nuevos',      value: pendientesCount,    cls: 'text-blue-500 bg-blue-50' },
          { label: 'En revisión', value: enRevisionCount,    cls: 'text-yellow-600 bg-yellow-50' },
          { label: 'Resueltos',   value: tramites.filter(t => ['APROBADO','RECHAZADO','ENTREGADO'].includes(t.estado)).length, cls: 'text-green-600 bg-green-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.cls}`}><FiFileText size={16} /></div>
            <div>
              <p className="text-lg font-bold text-gray-800">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtros — solo en vista lista */}
      {vista === 'lista' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 rounded-lg px-3 py-2">
            <FiSearch size={14} className="text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por folio, tipo o alumno..."
              className="flex-1 text-sm outline-none bg-transparent"
            />
          </div>
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_LABEL).map(([val, lbl]) => (
              <option key={val} value={val}>{lbl}</option>
            ))}
          </select>
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Cargando trámites...</div>
      ) : vista === 'kanban' ? (

        /* ── KANBAN ───────────────────────────────────────────────────────── */
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNAS_KANBAN.map(col => {
            const cards = filtered.filter(t => t.estado === col.estado)
            return (
              <div key={col.estado} className={`flex-shrink-0 w-64 rounded-2xl border-t-4 ${col.color} bg-white shadow-sm`}>
                <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${col.header}`}>
                  <span className="text-xs font-semibold">{col.label}</span>
                  <span className="text-xs font-bold bg-white/70 rounded-md px-2 py-0.5">{cards.length}</span>
                </div>
                <div className="p-3 space-y-3 min-h-[120px]">
                  {cards.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                      <p className="text-xs text-gray-400">Sin trámites</p>
                    </div>
                  ) : cards.map(t => {
                    const acciones = TRANSICIONES[t.estado] ?? []
                    return (
                      <div key={t.idTramite} className="bg-gray-50 border border-gray-100 rounded-xl p-3 space-y-2 hover:shadow-sm transition">
                        <div>
                          <p className="text-xs font-semibold text-gray-800 truncate">{t.tipoTramite?.nombre ?? 'Trámite'}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{t.folio}</p>
                        </div>
                        {t.usuario && (
                          <div className="flex items-center gap-1.5">
                            {t.usuario.fotoUrl ? (
                              <img src={t.usuario.fotoUrl} className="w-5 h-5 rounded-full object-cover" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                <FiUser size={10} />
                              </div>
                            )}
                            <span className="text-xs text-gray-500 truncate">{t.usuario.nombre} {t.usuario.apellidos}</span>
                          </div>
                        )}
                        <p className="text-xs text-gray-400">{fmtFecha(t.createdAt)}</p>
                        {t.documentos.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {t.documentos.map(d => (
                              <a key={d.idDocumento} href={d.rutaAlmacenamiento} target="_blank" rel="noreferrer"
                                className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100 transition"
                              >
                                <FiPaperclip size={9} />
                                <span className="truncate max-w-[80px]">{d.nombreArchivo}</span>
                              </a>
                            ))}
                          </div>
                        )}
                        {acciones.length > 0 && (
                          <div className="flex flex-col gap-1 pt-1 border-t border-gray-200">
                            {acciones.map(a => (
                              <button key={a.estado} onClick={() => abrirAccion(t, a.estado, a.label)}
                                className={`w-full py-1.5 rounded-lg text-xs font-medium transition ${a.cls}`}
                              >
                                {a.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

      ) : (

        /* ── LISTA ────────────────────────────────────────────────────────── */
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
              <FiFileText size={32} />
              <p className="text-sm">No hay trámites que mostrar</p>
            </div>
          ) : filtered.map(t => {
            const abierto  = expandido === t.idTramite
            const acciones = TRANSICIONES[t.estado] ?? []
            return (
              <div key={t.idTramite} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Fila principal — clic para expandir */}
                <button
                  type="button"
                  onClick={() => setExpandido(abierto ? null : t.idTramite)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50/60 transition text-left"
                >
                  <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
                    <FiFileText size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {t.tipoTramite?.nombre ?? 'Trámite'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.folio} · {new Date(t.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {t.usuario && (
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      {t.usuario.fotoUrl ? (
                        <img src={t.usuario.fotoUrl} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                          <FiUser size={13} className="text-gray-500" />
                        </div>
                      )}
                      <span className="text-xs text-gray-500">{t.usuario.nombre} {t.usuario.apellidos}</span>
                    </div>
                  )}
                  <EstadoBadge estado={t.estado} />
                  {abierto
                    ? <FiChevronUp size={16} className="text-gray-400 shrink-0" />
                    : <FiChevronDown size={16} className="text-gray-400 shrink-0" />
                  }
                </button>

                {/* Panel expandido */}
                {abierto && (
                  <div className="border-t border-gray-100 px-5 py-5 space-y-4">

                    {/* Datos del alumno */}
                    {t.usuario && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        {t.usuario.fotoUrl ? (
                          <img src={t.usuario.fotoUrl} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                            {t.usuario.nombre[0]}{t.usuario.apellidos[0]}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-800">{t.usuario.nombre} {t.usuario.apellidos}</p>
                          <p className="text-xs text-gray-400">{t.usuario.correo}</p>
                        </div>
                      </div>
                    )}

                    {t.comentariosAlumno && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Comentarios del alumno</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{t.comentariosAlumno}</p>
                      </div>
                    )}

                    {t.motivoRechazo && (
                      <div>
                        <p className="text-xs font-medium text-red-500 mb-1">Motivo de rechazo</p>
                        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{t.motivoRechazo}</p>
                      </div>
                    )}

                    {/* Documentos */}
                    {t.documentos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Documentos adjuntos</p>
                        <div className="space-y-2">
                          {t.documentos.map(d => (
                            <a key={d.idDocumento} href={d.rutaAlmacenamiento} target="_blank" rel="noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 hover:bg-blue-100 transition"
                            >
                              <FiPaperclip size={13} />
                              <span className="flex-1 truncate">{d.nombreArchivo}</span>
                              <FiExternalLink size={13} className="shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Historial */}
                    {(t.historial?.length ?? 0) > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-3">Historial</p>
                        <div className="relative pl-5 space-y-3">
                          <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gray-200" />
                          {(t.historial ?? []).map((h, idx) => (
                            <div key={h.idHistorial} className="relative">
                              <div className={`absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${idx === t.historial.length - 1 ? 'bg-primary' : 'bg-gray-300'}`} />
                              <div className="bg-gray-50 rounded-xl px-3 py-2.5 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {h.estadoAnterior && (
                                    <><EstadoBadge estado={h.estadoAnterior} /><span className="text-gray-400 text-xs">→</span></>
                                  )}
                                  <EstadoBadge estado={h.estadoNuevo} />
                                </div>
                                {h.comentario && <p className="text-xs text-gray-600">{h.comentario}</p>}
                                <p className="text-xs text-gray-400">
                                  {h.usuario ? `${h.usuario.nombre} ${h.usuario.apellidos}` : 'Sistema'} ·{' '}
                                  {new Date(h.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Botones de acción */}
                    {acciones.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                        <p className="w-full text-xs font-medium text-gray-500 mb-1">Cambiar estado</p>
                        {acciones.map(a => (
                          <button key={a.estado} onClick={() => abrirAccion(t, a.estado, a.label)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${a.cls}`}
                          >
                            {a.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {acciones.length === 0 && (
                      <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
                        Este trámite ya está en su estado final.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal confirmación */}
      {accionModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-1">{accionModal.label}</h3>
            <p className="text-sm text-gray-500 mb-5">
              {accionModal.tramite.tipoTramite?.nombre} · {accionModal.tramite.folio}
            </p>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {accionModal.estado === 'RECHAZADO' ? 'Motivo del rechazo *' : 'Comentario (opcional)'}
              </label>
              <textarea
                rows={3}
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                placeholder={accionModal.estado === 'RECHAZADO' ? 'Explica el motivo...' : 'Observaciones para el alumno...'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary resize-none"
              />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setAccionModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button onClick={confirmarAccion} disabled={guardando}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
