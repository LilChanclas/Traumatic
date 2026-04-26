import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { FiFileText, FiClock } from 'react-icons/fi'
import { apiFetch } from '@/lib/api'

interface Tramite {
  idTramite: string
  folio: string
  estado: string
  comentariosAlumno: string | null
  motivoRechazo: string | null
  createdAt: string
  tipoTramite: { nombre: string } | null
  documentos: { idDocumento: string }[]
}

const COLUMNAS = [
  { estado: 'ENVIADO',      label: 'Enviado',     estilo: 'bg-blue-100 text-blue-700',   card: 'bg-blue-50 border-blue-200' },
  { estado: 'EN_REVISION',  label: 'En revisión', estilo: 'bg-yellow-100 text-yellow-700', card: 'bg-yellow-50 border-yellow-200' },
  { estado: 'APROBADO',     label: 'Aprobado',    estilo: 'bg-green-100 text-green-700',  card: 'bg-green-50 border-green-200' },
  { estado: 'RECHAZADO',    label: 'Rechazado',   estilo: 'bg-red-100 text-red-700',      card: 'bg-red-50 border-red-200' },
  { estado: 'ENTREGADO',    label: 'Entregado',   estilo: 'bg-gray-100 text-gray-600',    card: 'bg-gray-50 border-gray-200' },
]

export default function TramitesPage() {
  const navigate = useNavigate()
  const [tramites, setTramites] = useState<Tramite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch('/tramites/mis-tramites')
      .then(r => r.json())
      .then(setTramites)
      .catch(() => toast.error('Error al cargar trámites'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        Cargando trámites...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Mis Trámites</h2>
        <p className="text-sm text-gray-500 mt-1">Seguimiento en tiempo real de tus solicitudes</p>
      </div>

      {tramites.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
          <FiFileText size={32} />
          <p className="text-sm">No tienes trámites registrados aún.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {COLUMNAS.map(col => {
            const lista = tramites.filter(t => t.estado === col.estado)
            return (
              <div key={col.estado} className={`rounded-2xl p-4 flex flex-col gap-3 border ${col.card}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${col.estilo}`}>
                    {col.label}
                  </span>
                  <span className="text-xs font-semibold text-gray-400 bg-white border border-gray-100 rounded-md px-2 py-0.5">
                    {lista.length}
                  </span>
                </div>

                {lista.length === 0 ? (
                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center">
                    <p className="text-xs text-gray-400">Sin trámites</p>
                  </div>
                ) : (
                  lista.map(t => (
                    <button
                      key={t.idTramite}
                      onClick={() => navigate(`/alumno/historial?id=${t.idTramite}`)}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-1.5 hover:shadow-md transition-shadow text-left w-full"
                    >
                      <p className="text-sm font-medium text-text line-clamp-2">
                        {t.tipoTramite?.nombre ?? 'Trámite'}
                      </p>
                      <p className="text-xs text-gray-400">Folio: {t.folio}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <FiClock size={11} />
                        {new Date(t.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      {t.motivoRechazo && (
                        <p className="text-xs text-red-500 line-clamp-2 mt-1">
                          Motivo: {t.motivoRechazo}
                        </p>
                      )}
                      {t.documentos.length > 0 && (
                        <p className="text-xs text-blue-500">{t.documentos.length} doc(s) adjunto(s)</p>
                      )}
                    </button>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
