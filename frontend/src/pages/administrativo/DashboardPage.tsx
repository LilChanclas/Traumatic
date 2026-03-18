import DashboardCard from '../../components/DashboardCard'
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInbox,
  FiAlertCircle,
  FiFileText,
  FiBarChart2,
  FiActivity,
} from 'react-icons/fi'

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

const ACTIVIDAD = [
  {
    id: 1,
    texto: 'Aprobaste el trámite TR-003 de Carlos Ramos',
    fecha: 'Hace 15 min',
  },
  {
    id: 2,
    texto: 'Se recibió una nueva solicitud de Lucía Castro',
    fecha: 'Hace 32 min',
  },
  {
    id: 3,
    texto: 'Rechazaste el trámite TR-004 de María Torres',
    fecha: 'Hace 1 hora',
  },
  {
    id: 4,
    texto: 'Juan Pérez subió documentos adicionales',
    fecha: 'Hace 2 horas',
  },
]

function contarPorEstado(estado: string) {
  return MOCK_TRAMITES.filter((t) => t.estado === estado).length
}

function getUrgentes() {
  return MOCK_TRAMITES.filter(
    (t) => (t.estado === 'Enviado' || t.estado === 'En revisión') && t.dias >= 3
  )
}

function getUltimos() {
  return [...MOCK_TRAMITES].reverse().slice(0, 5)
}

function getTiposFrecuentes() {
  const conteo: Record<string, number> = {}

  MOCK_TRAMITES.forEach((t) => {
    conteo[t.tipo] = (conteo[t.tipo] || 0) + 1
  })

  const total = MOCK_TRAMITES.length

  return Object.entries(conteo)
    .map(([tipo, cantidad]) => ({
      tipo,
      cantidad,
      porcentaje: Math.round((cantidad / total) * 100),
    }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 4)
}

function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string
  value: number | string
  subtitle: string
  icon: React.ElementType
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

export default function AdministrativoDashboardPage() {
  const pendientes = contarPorEstado('Enviado')
  const revision = contarPorEstado('En revisión')
  const aprobados = contarPorEstado('Aprobado')
  const rechazados = contarPorEstado('Rechazado')
  const urgentes = getUrgentes()
  const ultimos = getUltimos()
  const tiposFrecuentes = getTiposFrecuentes()

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

      <section className="rounded-2xl border border-amber-100 bg-amber-50/70 shadow-sm p-5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
            <FiAlertCircle size={18} />
          </div>

          <div className="flex-1">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-amber-900">
                  Trámites urgentes
                </h3>
                <p className="text-sm text-amber-700">
                  Solicitudes que llevan varios días sin resolverse
                </p>
              </div>

              <span className="inline-flex w-fit rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                {urgentes.length} urgentes
              </span>
            </div>

            {urgentes.length === 0 ? (
              <p className="mt-4 text-sm text-amber-700">
                Todo bien. No hay trámites urgentes por atender.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {urgentes.map((t) => (
                  <div
                    key={t.id}
                    className="rounded-xl border border-amber-200 bg-white/80 px-4 py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {t.alumno}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t.id} · {t.tipo}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${ESTADO_STYLES[t.estado]}`}
                      >
                        {t.estado}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-amber-700">
                      Lleva {t.dias} días en proceso
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
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

        <div>
          <DashboardCard>
            <div className="flex items-center gap-2 mb-5">
              <FiBarChart2 className="text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700">
                Tipos más solicitados
              </h3>
            </div>

            <div className="space-y-4">
              {tiposFrecuentes.map((item) => (
                <div key={item.tipo}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-700">
                      {item.tipo}
                    </p>
                    <span className="text-xs text-gray-400">
                      {item.cantidad} · {item.porcentaje}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${item.porcentaje}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </section>

      <section>
        <DashboardCard>
          <div className="flex items-center gap-2 mb-5">
            <FiActivity className="text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-700">
              Actividad reciente
            </h3>
          </div>

          <div className="space-y-4">
            {ACTIVIDAD.map((item, index) => (
              <div key={item.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  {index < ACTIVIDAD.length - 1 && (
                    <div className="mt-2 h-full w-px bg-gray-200" />
                  )}
                </div>

                <div className="pb-4">
                  <p className="text-sm text-gray-700">{item.texto}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      </section>
    </div>
  )
}