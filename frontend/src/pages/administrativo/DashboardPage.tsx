import DashboardCard from '../../components/DashboardCard'
import KpiCard from '../../components/KpiCard'
import { FiClock, FiCheckCircle, FiXCircle, FiInbox, FiFileText } from 'react-icons/fi'

const MOCK_TRAMITES = [
  {
    id: 'TR-001',
    alumno: 'Juan Pérez',
    tipo: 'Constancia de estudios',
    estado: 'Enviado',
    fecha: '2026-03-10',
    dias: 3,
  },
  {
    id: 'TR-002',
    alumno: 'Ana López',
    tipo: 'Historial académico',
    estado: 'En revisión',
    fecha: '2026-03-11',
    dias: 2,
  },
  {
    id: 'TR-003',
    alumno: 'Carlos Ramos',
    tipo: 'Certificado',
    estado: 'Aprobado',
    fecha: '2026-03-12',
    dias: 1,
  },
  {
    id: 'TR-004',
    alumno: 'María Torres',
    tipo: 'Constancia de estudios',
    estado: 'Rechazado',
    fecha: '2026-03-09',
    dias: 4,
  },
  {
    id: 'TR-005',
    alumno: 'Lucía Castro',
    tipo: 'Carta de pasante',
    estado: 'En revisión',
    fecha: '2026-03-13',
    dias: 1,
  },
  {
    id: 'TR-006',
    alumno: 'Pedro Vega',
    tipo: 'Constancia de estudios',
    estado: 'Enviado',
    fecha: '2026-03-13',
    dias: 5,
  },
]

const ESTADO_STYLES: Record<string, string> = {
  Aprobado: 'bg-green-100 text-green-700',
  'En revisión': 'bg-yellow-100 text-yellow-700',
  Enviado: 'bg-blue-100 text-blue-700',
  Rechazado: 'bg-red-100 text-red-700',
}

function contarPorEstado(estado: string) {
  return MOCK_TRAMITES.filter((t) => t.estado === estado).length
}


function getUltimos() {
  return [...MOCK_TRAMITES].reverse().slice(0, 5)
}


export default function AdministrativoDashboardPage() {
  const pendientes = contarPorEstado('Enviado')
  const revision = contarPorEstado('En revisión')
  const aprobados = contarPorEstado('Aprobado')
  const rechazados = contarPorEstado('Rechazado')
  const ultimos = getUltimos()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-primary">Dashboard</h2>
        <p className="text-sm text-gray-500">
          Vista general del estado de los trámites escolares
        </p>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Pendientes"
          value={pendientes}
          subtitle="Solicitudes recién enviadas"
          icon={FiInbox}
        />
        <KpiCard
          title="En revisión"
          value={revision}
          subtitle="Trámites siendo procesados"
          icon={FiClock}
        />
        <KpiCard
          title="Aprobados"
          value={aprobados}
          subtitle="Resueltos favorablemente"
          icon={FiCheckCircle}
        />
        <KpiCard
          title="Rechazados"
          value={rechazados}
          subtitle="Con observaciones o motivo"
          icon={FiXCircle}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-3">
          <DashboardCard>
            <div className="flex items-center gap-2 mb-5">
              <FiFileText className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700">
                Últimos trámites recibidos
              </h3>
            </div>

            <div className="space-y-3">
              {ultimos.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 transition hover:bg-gray-50 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {t.id}
                      </p>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-sm text-gray-600 truncate">
                        {t.alumno}
                      </p>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">{t.tipo}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_STYLES[t.estado]}`}
                    >
                      {t.estado}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {t.fecha}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </section>
    </div>
  )
}