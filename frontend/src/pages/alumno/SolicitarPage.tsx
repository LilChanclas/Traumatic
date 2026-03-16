import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard'

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

const PASOS = ['Tipo de trámite', 'Datos', 'Documentos', 'Confirmar']

export default function SolicitarPage() {
  const [pasoActual, setPasoActual] = useState(0)
  const [tramiteId, setTramiteId] = useState('')
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [archivos, setArchivos] = useState<File[]>([])

  const tramiteSeleccionado = TRAMITES.find((t) => t.id === tramiteId)

  function handleSiguiente() {
    if (pasoActual === 0 && !tramiteId) return
    // Saltar paso de documentos si el trámite no los requiere
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
    // Aquí irá la llamada al backend después
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <h2 className="text-2xl font-bold text-primary mb-8">Solicitar Trámite</h2>

      {/* Stepper */}
      <div className="flex items-start sm:items-center mb-10 overflow-x-auto pb-2">
        {PASOS.map((paso, i) => (
          <div key={paso} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition ${i < pasoActual
                  ? 'bg-primary text-white'
                  : i === pasoActual
                    ? 'bg-primary text-white ring-4 ring-primary/20'
                    : 'bg-gray-200 text-gray-400'
                }`}>
                {i < pasoActual ? '✓' : i + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${i === pasoActual ? 'text-primary' : 'text-gray-400'
                }`}>
                {paso}
              </span>
            </div>
            {i < PASOS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${i < pasoActual ? 'bg-primary' : 'bg-gray-200'
                }`} />
            )}
          </div>
        ))}
      </div>

      <DashboardCard titulo={PASOS[pasoActual]}>

        {/* Paso 1 — Elegir tipo */}
        {pasoActual === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-text mb-1">
              Tipo de trámite
            </label>
            <select
              value={tramiteId}
              onChange={(e) => setTramiteId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
            >
              <option value="">Selecciona un trámite...</option>
              {TRAMITES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </div>
        )}

        {/* Paso 2 — Datos del formulario */}
        {pasoActual === 1 && tramiteSeleccionado && (
          <div className="space-y-4">
            {tramiteSeleccionado.campos.map((campo) => (
              <div key={campo.id}>
                <label className="block text-sm font-medium text-text mb-1">
                  {campo.label}
                </label>
                {campo.tipo === 'textarea' ? (
                  <textarea
                    rows={3}
                    placeholder={campo.placeholder}
                    value={formData[campo.id] || ''}
                    onChange={(e) => handleCampo(campo.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition resize-none"
                  />
                ) : (
                  <input
                    type={campo.tipo}
                    placeholder={campo.placeholder}
                    value={formData[campo.id] || ''}
                    onChange={(e) => handleCampo(campo.id, e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-surface text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary transition"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Paso 3 — Documentos */}
        {pasoActual === 2 && tramiteSeleccionado && (
          <div className="space-y-4">
            {tramiteSeleccionado.documentos.map((doc) => (
              <div key={doc}>
                <label className="block text-sm font-medium text-text mb-1">
                  {doc}
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setArchivos([e.target.files[0]])
                    }
                  }}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:text-sm file:font-medium hover:file:bg-[#2C5282] transition"
                />
                <p className="text-xs text-gray-400 mt-1">PDF o imagen, máx. 5MB</p>
              </div>
            ))}
          </div>
        )}

        {/* Paso 4 — Confirmar */}
        {pasoActual === 3 && tramiteSeleccionado && (
          <div className="space-y-3">
            <div className="bg-surface rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-700">Tipo de trámite</span>
                <span className="text-sm font-medium text-text">{tramiteSeleccionado.label}</span>
              </div>
              {tramiteSeleccionado.campos.map((campo) => (
                <div key={campo.id} className="flex justify-between">
                  <span className="text-sm text-gray-700">{campo.label}</span>
                  <span className="text-sm font-medium text-text">{formData[campo.id] || '—'}</span>
                </div>
              ))}
              {archivos.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Documento adjunto</span>
                  <span className="text-sm font-medium text-text">{archivos[0].name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          {pasoActual > 0 ? (
            <button
              onClick={handleAtras}
              className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-text hover:bg-surface transition"
            >
              Atrás
            </button>
          ) : <div />}

          {pasoActual < 3 ? (
            <button
              onClick={handleSiguiente}
              disabled={pasoActual === 0 && !tramiteId}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm font-medium transition"
            >
              Enviar solicitud
            </button>
          )}
        </div>

      </DashboardCard>
    </div>
  )
}