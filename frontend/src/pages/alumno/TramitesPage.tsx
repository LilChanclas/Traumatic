
const MOCK_TRAMITES = [
  { id: 1, tipo: 'Constancia de estudios', folio: 'TRM-001', fecha: '2026-03-01', estado: 'Aprobado' },
  { id: 2, tipo: 'Historial académico', folio: 'TRM-002', fecha: '2026-03-05', estado: 'En revisión' },
  { id: 3, tipo: 'Constancia de estudios', folio: 'TRM-003', fecha: '2026-03-08', estado: 'Enviado' },
  { id: 4, tipo: 'Certificado de terminación', folio: 'TRM-004', fecha: '2026-02-20', estado: 'Rechazado' },
  { id: 5, tipo: 'Baja temporal', folio: 'TRM-005', fecha: '2026-03-10', estado: 'En revisión' },
  { id: 6, tipo: 'Carta de pasante', folio: 'TRM-006', fecha: '2026-03-11', estado: 'Enviado' },
]

const COLUMNAS = [
  { estado: 'Enviado', estilo: 'bg-blue-100 text-blue-700', card: 'bg-blue-50 border border-blue-200' },
  { estado: 'En revisión', estilo: 'bg-yellow-100 text-yellow-700', card: 'bg-yellow-50 border border-yellow-200' },
  { estado: 'Aprobado', estilo: 'bg-green-100 text-green-700', card: 'bg-green-50 border border-green-200' },
  { estado: 'Rechazado', estilo: 'bg-accent/10 text-accent', card: 'bg-red-50 border border-red-200' },
]

export default function TramitesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-primary mb-8">Mis Trámites</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {COLUMNAS.map((col) => {
          const tramites = MOCK_TRAMITES.filter((t) => t.estado === col.estado)
          return (
            <div key={col.estado} className={`rounded-2xl p-6 flex flex-col gap-3 ${col.card}`}>

              {/* Header */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${col.estilo}`}>
                  {col.estado}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {tramites.length} trámite{tramites.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Tarjetas */}
              {tramites.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-400">Sin trámites</p>
                </div>
              ) : (
                tramites.map((t) => (
                  <div key={t.id} className="bg-white rounded-xl shadow-sm p-4 space-y-1.5">
                    <p className="text-sm font-medium text-text">{t.tipo}</p>
                    <p className="text-xs text-gray-400">Folio: {t.folio}</p>
                    <p className="text-xs text-gray-400">{t.fecha}</p>
                  </div>
                ))
              )}

            </div>
          )
        })}
      </div>
    </div>
  )
}