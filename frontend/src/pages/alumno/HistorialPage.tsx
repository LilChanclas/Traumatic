import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiFileText, FiChevronDown, FiChevronUp, FiPaperclip, FiExternalLink } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface HistorialEntry {
  idHistorial: string
  estadoAnterior: string | null
  estadoNuevo: string
  comentario: string | null
  createdAt: string
  usuario: { nombre: string; apellidos: string; rol: string } | null
}

interface Documento {
  idDocumento: string
  nombreArchivo: string
  rutaAlmacenamiento: string
  tipoMime: string
}

interface Tramite {
  idTramite: string
  folio: string
  estado: string
  comentariosAlumno: string | null
  motivoRechazo: string | null
  createdAt: string
  tipoTramite: { nombre: string; descripcion: string | null } | null
  documentos: Documento[]
  historial: HistorialEntry[]
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

function EstadoBadge({ estado }: { estado: string }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADO_STYLES[estado] ?? 'bg-gray-100 text-gray-500'}`}>
      {ESTADO_LABEL[estado] ?? estado}
    </span>
  )
}

export default function HistorialPage() {
  const [searchParams] = useSearchParams()
  const idSeleccionado = searchParams.get('id')

  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(idSeleccionado)

  useEffect(() => {
    apiFetch('/tramites/mis-tramites')
      .then(r => r.json())
      .then((data: Tramite[]) => {
        setTramites(data)
        if (idSeleccionado) setExpandido(idSeleccionado)
      })
      .catch(() => toast.error('Error al cargar historial'))
      .finally(() => setLoading(false))
  }, [idSeleccionado])

  function toggleExpand(id: string) {
    setExpandido(prev => (prev === id ? null : id))
  }

  if (loading) {
    return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Cargando historial...</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Historial de Trámites</h2>
        <p className="text-sm text-gray-500 mt-1">Detalle y seguimiento de cada solicitud</p>
      </div>

      {tramites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <FiFileText size={32} />
          <p className="text-sm">No tienes trámites registrados aún.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tramites.map(t => {
            const abierto = expandido === t.idTramite
            return (
              <div key={t.idTramite} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Cabecera del trámite */}
                <button
                  onClick={() => toggleExpand(t.idTramite)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/60 transition text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                      <FiFileText size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {t.tipoTramite?.nombre ?? 'Trámite'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.folio} · {new Date(t.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <EstadoBadge estado={t.estado} />
                    {abierto ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                  </div>
                </button>

                {/* Detalle expandido */}
                {abierto && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-5">

                    {/* Comentarios alumno */}
                    {t.comentariosAlumno && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Mis comentarios</p>
                        <p className="text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">{t.comentariosAlumno}</p>
                      </div>
                    )}

                    {/* Motivo de rechazo */}
                    {t.motivoRechazo && (
                      <div>
                        <p className="text-xs font-medium text-red-500 mb-1">Motivo de rechazo</p>
                        <p className="text-sm text-red-700 bg-red-50 rounded-xl px-4 py-3">{t.motivoRechazo}</p>
                      </div>
                    )}

                    {/* Documentos adjuntos */}
                    {t.documentos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Documentos adjuntos</p>
                        <div className="space-y-2">
                          {t.documentos.map(d => (
                            <a
                              key={d.idDocumento}
                              href={d.rutaAlmacenamiento}
                              target="_blank"
                              rel="noreferrer"
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

                    {/* Línea de tiempo del historial */}
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-3">Historial de estados</p>
                      <div className="relative pl-5 space-y-4">
                        <div className="absolute left-1.5 top-1 bottom-1 w-px bg-gray-200" />
                        {t.historial.map((h, idx) => (
                          <div key={h.idHistorial} className="relative">
                            <div className={`absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${idx === t.historial.length - 1 ? 'bg-primary' : 'bg-gray-300'}`} />
                            <div className="bg-gray-50 rounded-xl px-4 py-3 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                {h.estadoAnterior && (
                                  <>
                                    <EstadoBadge estado={h.estadoAnterior} />
                                    <span className="text-gray-400 text-xs">→</span>
                                  </>
                                )}
                                <EstadoBadge estado={h.estadoNuevo} />
                              </div>
                              {h.comentario && (
                                <p className="text-xs text-gray-600">{h.comentario}</p>
                              )}
                              <p className="text-xs text-gray-400">
                                {h.usuario ? `${h.usuario.nombre} ${h.usuario.apellidos}` : 'Sistema'} ·{' '}
                                {new Date(h.createdAt).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

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
