import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FiChevronDown, FiCheck, FiUpload, FiX, FiFileText } from 'react-icons/fi'
import DashboardCard from '../../components/DashboardCard'
import { apiFetch } from '@/lib/api'

interface TipoTramite {
  idTipo: string
  nombre: string
  descripcion: string | null
  docsRequeridos: string[]
}

const PASOS = ['Tipo', 'Detalles', 'Documentos', 'Confirmar']

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition placeholder-gray-300'

export default function SolicitarPage() {
  const navigate = useNavigate()
  const [tipos, setTipos] = useState<TipoTramite[]>([])
  const [loadingTipos, setLoadingTipos] = useState(true)
  const [pasoActual, setPasoActual] = useState(0)
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoTramite | null>(null)
  const [open, setOpen] = useState(false)
  const [comentarios, setComentarios] = useState('')
  const [archivos, setArchivos] = useState<Record<string, File>>({})
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    apiFetch('/tipos-tramite')
      .then(r => r.json())
      .then((data: TipoTramite[]) => setTipos(data))
      .catch(() => toast.error('Error al cargar tipos de trámite'))
      .finally(() => setLoadingTipos(false))
  }, [])

  const tieneDocumentos = (tipoSeleccionado?.docsRequeridos.length ?? 0) > 0

  function handleSiguiente() {
    if (pasoActual === 0 && !tipoSeleccionado) return
    if (pasoActual === 1 && !tieneDocumentos) {
      setPasoActual(3)
      return
    }
    setPasoActual(p => p + 1)
  }

  function handleAtras() {
    if (pasoActual === 3 && !tieneDocumentos) {
      setPasoActual(1)
      return
    }
    setPasoActual(p => p - 1)
  }

  function handleArchivo(docNombre: string, file: File | null) {
    if (file) {
      setArchivos(prev => ({ ...prev, [docNombre]: file }))
    } else {
      setArchivos(prev => {
        const next = { ...prev }
        delete next[docNombre]
        return next
      })
    }
  }

  async function handleSubmit() {
    if (!tipoSeleccionado) return
    setEnviando(true)
    try {
      // 1. Crear el trámite
      const res = await apiFetch('/tramites', {
        method: 'POST',
        body: JSON.stringify({
          idTipoTramite: tipoSeleccionado.idTipo,
          comentariosAlumno: comentarios.trim() || undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.message ?? 'Error al crear el trámite')
      }
      const tramite = await res.json()

      // 2. Subir cada documento
      for (const docNombre of tipoSeleccionado.docsRequeridos) {
        const file = archivos[docNombre]
        if (!file) continue
        const form = new FormData()
        form.append('file', file)
        form.append('idTramite', tramite.idTramite)
        const uploadRes = await apiFetch('/documentos/upload', { method: 'POST', body: form })
        if (!uploadRes.ok) throw new Error(`Error al subir: ${docNombre}`)
      }

      toast.success(`Trámite enviado — Folio: ${tramite.folio}`)
      navigate('/alumno/tramites')
    } catch (e: any) {
      toast.error(e.message || 'Error al enviar el trámite')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-0">
      <h2 className="text-2xl font-semibold text-primary mb-8">Solicitar Trámite</h2>

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-6">
        {PASOS.map((paso, i) => (
          <div key={paso} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                i < pasoActual ? 'bg-primary text-white'
                : i === pasoActual ? 'bg-primary text-white ring-4 ring-primary/15'
                : 'bg-gray-100 text-gray-400'
              }`}>
                {i < pasoActual ? <FiCheck size={14} strokeWidth={3} /> : i + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium whitespace-nowrap ${
                i === pasoActual ? 'text-primary' : i < pasoActual ? 'text-primary/60' : 'text-gray-400'
              }`}>
                {paso}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all ${
                i < pasoActual ? 'bg-primary' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <DashboardCard titulo={PASOS[pasoActual]}>

        {/* Paso 1 — Elegir tipo */}
        {pasoActual === 0 && (
          <div className="space-y-5">
            {loadingTipos ? (
              <p className="text-sm text-gray-400">Cargando tipos de trámite...</p>
            ) : tipos.length === 0 ? (
              <p className="text-sm text-gray-400">No hay tipos de trámite disponibles en este momento.</p>
            ) : (
              <div>
                <label className="block text-sm font-medium text-text mb-1.5">Tipo de trámite</label>
                <div className="relative">
                  <button
                    onClick={() => setOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur border border-gray-200 text-sm text-gray-700 hover:border-gray-300 transition"
                  >
                    <span className={tipoSeleccionado ? 'text-gray-800' : 'text-gray-400'}>
                      {tipoSeleccionado?.nombre || 'Selecciona un trámite...'}
                    </span>
                    <FiChevronDown className={`transition ${open ? 'rotate-180' : ''}`} size={16} />
                  </button>

                  {open && (
                    <div className="absolute mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
                      {tipos.map(t => (
                        <button
                          key={t.idTipo}
                          onClick={() => { setTipoSeleccionado(t); setOpen(false) }}
                          className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition flex items-start justify-between gap-3 ${
                            tipoSeleccionado?.idTipo === t.idTipo ? 'bg-primary/5 text-primary' : 'text-gray-700'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{t.nombre}</p>
                            {t.descripcion && <p className="text-xs text-gray-400 mt-0.5">{t.descripcion}</p>}
                          </div>
                          {tipoSeleccionado?.idTipo === t.idTipo && <FiCheck size={14} className="shrink-0 mt-0.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {tipoSeleccionado && tipoSeleccionado.docsRequeridos.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <p className="text-xs font-medium text-blue-700 mb-1.5">Documentos requeridos:</p>
                    <ul className="space-y-1">
                      {tipoSeleccionado.docsRequeridos.map(d => (
                        <li key={d} className="flex items-center gap-1.5 text-xs text-blue-600">
                          <FiFileText size={11} /> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paso 2 — Detalles / comentarios */}
        {pasoActual === 1 && tipoSeleccionado && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Comentarios u observaciones <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe el motivo de tu solicitud, agrega observaciones relevantes..."
                value={comentarios}
                onChange={e => setComentarios(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
            <p className="text-xs text-gray-400">
              Trámite: <span className="font-medium text-gray-600">{tipoSeleccionado.nombre}</span>
            </p>
          </div>
        )}

        {/* Paso 3 — Documentos */}
        {pasoActual === 2 && tipoSeleccionado && (
          <div className="space-y-5">
            {tipoSeleccionado.docsRequeridos.map(doc => {
              const archivo = archivos[doc]
              return (
                <div key={doc}>
                  <label className="block text-sm font-medium text-text mb-1.5">{doc}</label>
                  {archivo ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                      <FiFileText size={16} className="text-green-600 shrink-0" />
                      <span className="text-sm text-green-700 flex-1 truncate">{archivo.name}</span>
                      <button
                        onClick={() => handleArchivo(doc, null)}
                        className="text-green-500 hover:text-red-500 transition"
                      >
                        <FiX size={15} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-surface hover:border-primary/40 hover:bg-primary/5 transition group">
                      <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-primary transition">
                        <FiUpload size={20} />
                        <span className="text-sm font-medium">Haz clic o arrastra el archivo aquí</span>
                        <span className="text-xs">PDF o imagen, máx. 10MB</span>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) handleArchivo(doc, e.target.files[0])
                        }}
                      />
                    </label>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Paso 4 — Confirmar */}
        {pasoActual === 3 && tipoSeleccionado && (
          <div className="space-y-3">
            <div className="bg-surface rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-gray-500">Tipo de trámite</span>
                <span className="text-sm font-medium text-text">{tipoSeleccionado.nombre}</span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-gray-500">Comentarios</span>
                <span className="text-sm font-medium text-text text-right max-w-[60%]">
                  {comentarios.trim() || <span className="text-gray-400">Sin comentarios</span>}
                </span>
              </div>
              {tipoSeleccionado.docsRequeridos.length > 0 && (
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-500 mb-2">Documentos adjuntos</p>
                  <div className="space-y-1.5">
                    {tipoSeleccionado.docsRequeridos.map(doc => (
                      <div key={doc} className="flex items-center gap-2">
                        {archivos[doc] ? (
                          <FiCheck size={13} className="text-green-500 shrink-0" />
                        ) : (
                          <FiX size={13} className="text-red-400 shrink-0" />
                        )}
                        <span className={`text-xs ${archivos[doc] ? 'text-gray-700' : 'text-red-400'}`}>
                          {doc}{archivos[doc] ? ` — ${archivos[doc].name}` : ' — Pendiente'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {tipoSeleccionado.docsRequeridos.some(d => !archivos[d]) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                Algunos documentos requeridos no han sido adjuntados. Puedes enviar la solicitud igualmente, pero podría ser rechazada.
              </div>
            )}
          </div>
        )}

        {/* Navegación */}
        <div className={`flex mt-8 pt-5 border-t border-gray-100 ${pasoActual > 0 ? 'justify-between' : 'justify-end'}`}>
          {pasoActual > 0 && (
            <button
              onClick={handleAtras}
              disabled={enviando}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-text hover:bg-surface transition disabled:opacity-40"
            >
              ← Atrás
            </button>
          )}

          {pasoActual < 3 ? (
            <button
              onClick={handleSiguiente}
              disabled={(pasoActual === 0 && !tipoSeleccionado) || loadingTipos}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={enviando}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-medium transition disabled:opacity-50"
            >
              {enviando ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          )}
        </div>
      </DashboardCard>
    </div>
  )
}
