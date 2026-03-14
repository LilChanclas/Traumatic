// Datos mockeados
const MOCK_TRAMITES = [
  { id: 1, tipo: 'Constancia de estudios', estado: 'Aprobado', fecha: '2026-03-01' },
  { id: 2, tipo: 'Historial académico', estado: 'En revisión', fecha: '2026-03-05' },
  { id: 3, tipo: 'Constancia de estudios', estado: 'Enviado', fecha: '2026-03-08' },
  { id: 4, tipo: 'Certificado', estado: 'Rechazado', fecha: '2026-02-20' },
  { id: 5, tipo: 'Constancia de estudios', estado: 'En revisión', fecha: '2026-03-10' },
]

const ESTADO_STYLES: Record<string, string> = {
  'Aprobado': 'bg-green-100 text-green-700',
  'En revisión': 'bg-yellow-100 text-yellow-700',
  'Enviado': 'bg-blue-100 text-blue-700',
  'Rechazado': 'bg-[#8B1E3F]/10 text-[#8B1E3F]',
}

function getUltimos3() {
  return MOCK_TRAMITES.slice(-3).reverse()
}

function getMasFrecuente() {
  const conteo: Record<string, number> = {}
  MOCK_TRAMITES.forEach((t) => {
    conteo[t.tipo] = (conteo[t.tipo] || 0) + 1
  })
  const tipo = Object.entries(conteo).sort((a, b) => b[1] - a[1])[0]
  return { tipo: tipo[0], cantidad: tipo[1] }
}

function getEnProceso() {
  return MOCK_TRAMITES.filter(
    (t) => t.estado === 'En revisión' || t.estado === 'Enviado'
  )
}

export default function AlumnoDashboardPage() {
  const ultimos3 = getUltimos3()
  const masFrecuente = getMasFrecuente()
  const enProceso = getEnProceso()

  return (
    <div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Tarjeta 1 — Últimos trámites */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-[#1E3A5F] uppercase tracking-wide mb-4">
            Últimos trámites
          </h3>
          <div className="space-y-3">
            {ultimos3.map((t) => (
              <div key={t.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#2D3748]">{t.tipo}</p>
                  <p className="text-xs text-gray-400">{t.fecha}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_STYLES[t.estado]}`}>
                  {t.estado}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tarjeta 2 — Más frecuente */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-[#1E3A5F] uppercase tracking-wide mb-4">
            Trámite más frecuente
          </h3>
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <p className="text-lg font-bold text-[#2D3748]">{masFrecuente.tipo}</p>
              <p className="text-xs text-gray-400 mt-1">
                Última vez: {MOCK_TRAMITES.filter(t => t.tipo === masFrecuente.tipo).at(-1)?.fecha}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Solicitado {masFrecuente.cantidad} {masFrecuente.cantidad === 1 ? 'vez' : 'veces'}
              </p>
            </div>
            <button
              onClick={() => { }}
              className="mt-6 w-full py-2.5 bg-[#1E3A5F] hover:bg-[#2C5282] text-white text-sm font-medium rounded-lg transition"
            >
              Solicitar de nuevo
            </button>
          </div>
        </div>

        {/* Tarjeta 3 — En proceso */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-sm font-semibold text-[#1E3A5F] uppercase tracking-wide mb-4">
            En proceso
          </h3>
          {enProceso.length === 0 ? (
            <p className="text-sm text-gray-400">No tienes trámites en proceso.</p>
          ) : (
            <div className="space-y-3">
              {enProceso.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#2D3748]">{t.tipo}</p>
                    <p className="text-xs text-gray-400">{t.fecha}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_STYLES[t.estado]}`}>
                    {t.estado}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}