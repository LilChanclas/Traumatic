interface Props {
  titulo?: string
  //Reemplaza el titulo cuando se le pase algo personalizado
  headerContent?: React.ReactNode
  children: React.ReactNode
}

export default function DashboardCard({ titulo, headerContent, children }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col border-gray-100 hover:shadow-md transition-shadow">
      {headerContent ? (
        <div className="mb-4">{headerContent}</div>
      ) : (
        <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-4">
          {titulo}
        </h3>
      )}
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}