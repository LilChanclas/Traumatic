import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard'
import { FiChevronDown, FiCheck } from 'react-icons/fi'

// Definición de trámites con sus campos y documentos
const TRAMITES = [
  {
    id: 'constancia',
    label: 'Constancia de estudios',
    campos: [
      { id: 'numeroCuenta', label: 'Número de cuenta', tipo: 'text', placeholder: '12345678' },
      { id: 'motivo', label: 'Motivo', tipo: 'textarea', placeholder: 'Describe el motivo de tu solicitud' },
    ],
    documentos: ['Comprobante de pago'],
  },
  {
    id: 'historial',
    label: 'Historial académico',
    campos: [
      { id: 'numeroCuenta', label: 'Número de cuenta', tipo: 'text', placeholder: '12345678' },
      { id: 'motivo', label: 'Motivo', tipo: 'textarea', placeholder: 'Describe el motivo de tu solicitud' },
    ],
    documentos: [],
  },
  {
    id: 'cartaPasante',
    label: 'Carta de pasante',
    campos: [
      { id: 'numeroCuenta', label: 'Número de cuenta', tipo: 'text', placeholder: '12345678' },
      { id: 'fechaEgreso', label: 'Fecha de egreso', tipo: 'date', placeholder: '' },
      { id: 'motivo', label: 'Motivo', tipo: 'textarea', placeholder: 'Describe el motivo de tu solicitud' },
    ],
    documentos: [],
  },
  {
    id: 'certificado',
    label: 'Certificado de terminación',
    campos: [
      { id: 'numeroCuenta', label: 'Número de cuenta', tipo: 'text', placeholder: '12345678' },
      { id: 'fechaEgreso', label: 'Fecha de egreso', tipo: 'date', placeholder: '' },
    ],
    documentos: [],
  },
  {
    id: 'bajaTemporal',
    label: 'Baja temporal',
    campos: [
      { id: 'numeroCuenta', label: 'Número de cuenta', tipo: 'text', placeholder: '12345678' },
      { id: 'semestreActual', label: 'Semestre actual', tipo: 'text', placeholder: 'Ej. 5to' },
      { id: 'motivo', label: 'Motivo', tipo: 'textarea', placeholder: 'Describe el motivo de tu solicitud' },
    ],
    documentos: [],
  },
  {
    id: 'cambioCarrera',
    label: 'Cambio de carrera',
    campos: [
      { id: 'numeroCuenta', label: 'Número de cuenta', tipo: 'text', placeholder: '12345678' },
      { id: 'carreraActual', label: 'Carrera actual', tipo: 'text', placeholder: 'Ej. Ingeniería en Software' },
      { id: 'carreraDestino', label: 'Carrera destino', tipo: 'text', placeholder: 'Ej. Ingeniería Civil' },
      { id: 'motivo', label: 'Motivo', tipo: 'textarea', placeholder: 'Describe el motivo de tu solicitud' },
    ],
    documentos: [],
  },
]

const PASOS = ['Tipo', 'Datos', 'Documentos', 'Confirmar']

const inputClass = `
  w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-surface text-text text-sm
  focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
  transition placeholder-gray-300
`

export default function SolicitarPage() {
  const [pasoActual, setPasoActual] = useState(0)
  const [tramiteId, setTramiteId] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [archivos, setArchivos] = useState<File[]>([])
  const [open, setOpen] = useState(false)

  const tramiteSeleccionado = TRAMITES.find((t) => t.id === tramiteId)

  function handleSiguiente() {
    if (pasoActual === 0 && !tramiteId) return
    if (pasoActual === 1 && tramiteSeleccionado?.documentos.length === 0) {
      setPasoActual(3)
      return
    }
    setPasoActual((p) => p + 1)
  }

  function handleAtras() {
    if (pasoActual === 3 && tramiteSeleccionado?.documentos.length === 0) {
      setPasoActual(1)
      return
    }
    setPasoActual((p) => p - 1)
  }

  function handleCampo(id: string, valor: string) {
    setFormData((prev) => ({ ...prev, [id]: valor }))
  }

  function handleSubmit() {
    console.log('Solicitud enviada:', { tramiteId, formData, archivos })
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
                i < pasoActual
                  ? 'bg-primary text-white'
                  : i === pasoActual
                    ? 'bg-primary text-white ring-4 ring-primary/15'
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
            <div>
              <label className="block text-sm font-medium text-text mb-1.5">
                Tipo de trámite
              </label>

              {/* Select personalizado */}
              <div className="relative">
                <button
                  onClick={() => setOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/70 backdrop-blur border border-gray-200 text-sm text-gray-700 hover:border-gray-300 transition"
                >
                  <span className={tramiteId ? 'text-gray-800' : 'text-gray-400'}>
                    {tramiteSeleccionado?.label || 'Selecciona un trámite...'}
                  </span>

                  <FiChevronDown
                    className={`transition ${open ? 'rotate-180' : ''}`}
                    size={16}
                  />
                </button>

                {open && (
                  <div className="absolute mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">

                    {TRAMITES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTramiteId(t.id)
                          setOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition flex items-center justify-between ${
                          tramiteId === t.id ? 'bg-primary/5 text-primary' : 'text-gray-700'
                        }`}
                      >
                        {t.label}

                        {tramiteId === t.id && (
                          <FiCheck size={14} />
                        )}
                      </button>
                    ))}

                  </div>
                )}
              </div>
            </div>


          </div>
        )}

        {/* Paso 2 — Datos del formulario */}
        {pasoActual === 1 && tramiteSeleccionado && (
          <div className="space-y-4">
            {tramiteSeleccionado.campos.map((campo) => (
              <div key={campo.id}>
                <label className="block text-sm font-medium text-text mb-1.5">
                  {campo.label}
                </label>
                {campo.tipo === 'textarea' ? (
                  <textarea
                    rows={3}
                    placeholder={campo.placeholder}
                    value={formData[campo.id] || ''}
                    onChange={(e) => handleCampo(campo.id, e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                ) : (
                  <input
                    type={campo.tipo}
                    placeholder={campo.placeholder}
                    value={formData[campo.id] || ''}
                    onChange={(e) => handleCampo(campo.id, e.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paso 3 — Documentos */}
        {pasoActual === 2 && tramiteSeleccionado && (
          <div className="space-y-5">
            {tramiteSeleccionado.documentos.map((doc) => (
              <div key={doc}>
                <label className="block text-sm font-medium text-text mb-1.5">
                  {doc}
                </label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer bg-surface hover:border-primary/40 hover:bg-primary/5 transition group">
                  <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-primary transition">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="text-sm font-medium">
                      {archivos.length > 0 ? archivos[0].name : 'Haz clic o arrastra el archivo aquí'}
                    </span>
                    <span className="text-xs">PDF o imagen, máx. 5MB</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setArchivos([e.target.files[0]])
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Paso 4 — Confirmar */}
        {pasoActual === 3 && tramiteSeleccionado && (
          <div className="space-y-3">
            <div className="bg-surface rounded-xl border border-gray-100 divide-y divide-gray-100 overflow-hidden">
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-gray-500">Tipo de trámite</span>
                <span className="text-sm font-medium text-text">{tramiteSeleccionado.label}</span>
              </div>
              {tramiteSeleccionado.campos.map((campo) => (
                <div key={campo.id} className="flex justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">{campo.label}</span>
                  <span className="text-sm font-medium text-text text-right max-w-[60%] truncate">
                    {formData[campo.id] || '—'}
                  </span>
                </div>
              ))}
              {archivos.length > 0 && (
                <div className="flex justify-between px-4 py-3">
                  <span className="text-sm text-gray-500">Documento adjunto</span>
                  <span className="text-sm font-medium text-text truncate max-w-[60%]">{archivos[0].name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className={`flex mt-8 pt-5 border-t border-gray-100 ${pasoActual > 0 ? 'justify-between' : 'justify-end'}`}>
          {pasoActual > 0 && (
            <button
              onClick={handleAtras}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-text hover:bg-surface transition"
            >
              ← Atrás
            </button>
          )}

          {pasoActual < 3 ? (
            <button
              onClick={handleSiguiente}
              disabled={pasoActual === 0 && !tramiteId}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
            >
              Enviar solicitud
            </button>
          )}
        </div>

      </DashboardCard>
    </div>
  )
}